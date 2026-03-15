import OpenAI from "openai";

const openaiKey = process.env.OPENAI_API_KEY;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

const DRINK_KEYWORDS = [
  "es",
  "teh",
  "jeruk",
  "kopi",
  "susu",
  "air",
  "sirup",
  "milo",
  "sinom",
  "degan"
];

const SPICY_KEYWORDS = [
  "pedas",
  "geprek",
  "sambal",
  "mercon",
  "setan",
  "iblis",
  "matah",
  "taliwang"
];

export async function generateRecommendations({
  budget,
  people,
  preferences,
  restaurants
}) {
  const budgetNumber = Number(budget);
  const peopleNumber = Number(people);

  if (!budgetNumber || !peopleNumber) {
    throw new Error("Invalid budget or people");
  }

  if (openai) {
    try {
      const prompt = buildPrompt({
        budget: budgetNumber,
        people: peopleNumber,
        preferences,
        restaurants
      });

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that creates iftar meal packages using provided restaurant menus. Ensure to include the 'img' property for each item exactly as provided in the menu."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 600
      });

      const text = response.choices?.[0]?.message?.content;

      const parsed = tryParseJson(text);

      if (parsed?.packages) {
        return {
          empty: parsed.packages.length === 0,
          packages: parsed.packages,
          message: parsed.packages.length === 0 ? "Tidak ada menu yang sesuai dengan pencarian kamu." : ""
        };
      }
    } catch (error) {
      console.error("OpenAI error", error);
      console.warn("OpenAI failed, using local generator");
    }
  }

  return generateLocalRecommendations({
    budget: budgetNumber,
    people: peopleNumber,
    preferences,
    restaurants
  });
}

function buildPrompt({ budget, people, preferences, restaurants }) {
  const items = restaurants
    .map((r) => {
      const menu = r.menu
        .map((m) => `- ${m.name} (Rp${m.price}) ${m.img ? `[img: ${m.img}]` : ''}`)
        .join("\n");
      return `Restaurant: ${r.name}\nMenu:\n${menu}`;
    })
    .join("\n\n");

  return `
User budget: Rp${budget}
People: ${people}
Preferences: ${preferences.join(",")}

Restaurants:
${items}

Return JSON with packages.
`;
}

function tryParseJson(text) {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/* ============================= */
/* LOCAL RECOMMENDATION ENGINE */
/* ============================= */

function generateLocalRecommendations({
  budget,
  preferences,
  restaurants
}) {
  // 1. Ekstrak custom instruksi jika ada
  const rawStr = (preferences || []).join(" ").toLowerCase();
  const customMatch = rawStr.match(/strict custom request: "(.*?)"/);
  const customQuery = customMatch ? customMatch[1] : "";

  // 2. Ambil preference dari tombol (selain dari custom instruction)
  const otherPrefs = (preferences || [])
    .filter(p => !String(p).includes('STRICT CUSTOM REQUEST'))
    .join(" ")
    .toLowerCase();

  // 3. Terjemahkan ID preference bahasa Inggris ke kata kunci menu bahasa Indonesia
  const mappedPrefs = otherPrefs
    .replace(/\bdrinks\b/g, 'es teh kopi sirup')
    .replace(/\bchicken\b/g, 'ayam')
    .replace(/\bspicy\b/g, 'pedas geprek mercon')
    .replace(/\bvegetarian\b/g, 'tahu tempe sayur');

  const query = `${mappedPrefs} ${customQuery}`.trim();

  const results = searchMenu(restaurants, query, budget);

  if (!results.length) {
    return {
      empty: true,
      message: "Tidak ada menu yang sesuai dengan pencarian kamu.",
      packages: []
    };
  }

  const items = getTopResults(results);

  const packages = items.map((item, index) => {
    const restaurant = restaurants.find(r => r.id === item.restaurantId);
    
    let packageItems = [{ name: item.name, price: item.price, img: item.img }];
    let currentTotal = item.price;

    if (restaurant) {
       const otherMenu = restaurant.menu.filter(m => m.id !== item.id);
       const shuffledOther = shuffleArray(otherMenu);
       
       // Targetkan paket berisi 2 hingga 4 item secara acak
       const targetCount = Math.floor(Math.random() * 3) + 2; 
       
       for (const m of shuffledOther) {
         if (packageItems.length >= targetCount) break;
         // Tambahkan item ekstra hanya jika masih masuk dalam budget
         if (!budget || (currentTotal + m.price <= budget)) {
           packageItems.push({ name: m.name, price: m.price, img: m.img });
           currentTotal += m.price;
         }
       }
    }

    return {
      id: `${item.restaurantId}-pkg-${Date.now()}-${index}`,
      name: `${item.restaurantName} Selection`,
      description: `Rekomendasi spesial untuk kamu.`,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName,
      items: packageItems,
      totalPrice: currentTotal
    };
  });

  return {
    empty: false,
    packages
  };
}

function searchMenu(restaurants, text, budget) {
  const keyword = text.trim().toLowerCase();
  const results = [];
  
  // Ekstrak kata-kata penting untuk smart fallback search
  const searchKeywords = keyword.split(/\s+/).filter(w => w.length >= 2 && !['mau','yang','ada','se','paket','aja','dan','aku','cari'].includes(w));

  restaurants.forEach(r => {
    r.menu.forEach(item => {
      if (budget && item.price > budget) return;

      const itemName = item.name.toLowerCase();
      let isMatch = itemName.includes(keyword);

      // Jika pencarian mentah tidak ketemu, coba cocokkan per-kata (smart match)
      if (!isMatch && searchKeywords.length > 0) {
         isMatch = searchKeywords.some(kw => itemName.includes(kw));
      }

      if (!keyword || keyword === '') {
         isMatch = true;
      }

      if (isMatch) {
        results.push({
          ...item,
          restaurantId: r.id,
          restaurantName: r.name
        });
      }
    });
  });

  return results;
}

function getTopResults(results) {
  if (!results.length) {
    return [];
  }
  const shuffled = shuffleArray(results);
  return shuffled.slice(0, 3);
}

function shuffleArray(arr) {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}