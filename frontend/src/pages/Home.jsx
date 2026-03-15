import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRecommendations } from "../utils/api";
import { usePackages } from "../contexts/PackagesContext";
import PackageCard from "../components/PackageCard";
import Loader from "../components/Loader";

const PREFERENCE_OPTIONS = [
  { id: "chicken", label: "Chicken" },
  { id: "gorengan", label: "Gorengan" },
  { id: "drinks", label: "Refreshing Drinks" },
  { id: "spicy", label: "Spicy" },
  { id: "vegetarian", label: "Vegetarian" },
];

const FAQS = [
  {
    q: "How do I preorder my meals?",
    a: "Simply use our AI planner, choose your preferred set, and hit the 'Order' button. We connect you directly with the restaurant for pickup.",
  },
  {
    q: "What are the delivery areas covered?",
    a: "We currently cover Greater Jakarta, Bandung, and Surabaya, with more cities being added daily throughout Ramadan.",
  },
  {
    q: "Is the AI meal suggestions free?",
    a: "Yes! Planning your Iftar with Bukain is 100% free. We aim to support the Ummah in having a stress-free Ramadan.",
  },
];

export default function Home() {
  const { recommendations, setRecommendations, setSelectedPackageId } =
    usePackages();
  const [budget, setBudget] = useState("50000");
  const [people, setPeople] = useState("2");
  const [preferences, setPreferences] = useState([]);
  const [customPreference, setCustomPreference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emptyMessage, setEmptyMessage] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedPackageId("");
  }, [setSelectedPackageId]);

  const handleTogglePref = (id) => {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setEmptyMessage("");
    setLoading(true);

    const finalPreferences = [...preferences];
    if (customPreference.trim()) {
      finalPreferences.push(
        `STRICT CUSTOM REQUEST: "${customPreference.trim()}". PENTING: Jika pengguna hanya meminta minuman, cemilan, atau hal spesifik tertentu, JANGAN masukkan makanan berat/nasi/sate/lauk pauk lainnya ke dalam paket. Harus benar-benar sesuai request ini.`,
      );
    }

    try {
      const data = await fetchRecommendations({
        budget: Number(budget),
        people: Number(people),
        preferences: finalPreferences,
      });
      if (data.empty) {
        setRecommendations([]);
        setEmptyMessage(
          data.message || "Tidak ada menu yang sesuai dengan pencarian kamu.",
        );
      } else {
        setRecommendations(data.packages || []);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to generate recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col flex-1 w-full">
      {/* Hero Section */}
      <section className="flex flex-col w-full max-w-6xl gap-10 px-4 pt-32 pb-12 mx-auto md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-full bg-bukain-gold/20 text-bukain-green">
            Ramadan Edition
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-grey-900 sm:text-5xl">
            Bingung Buka Puasa{" "}
            <span className="text-bukain-green">Makan Apa?</span>
          </h1>
          <p className="mt-8 text-lg text-grey-600">
            Bukain helps you discover the perfect iftar meal using AI based on
            your budget and preferences.
          </p>
          <div className="flex flex-col gap-3 mt-12 sm:flex-row">
            <button
              onClick={() =>
                document
                  .getElementById("generator-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-6 py-3 text-sm font-semibold text-white rounded-full shadow-sm bg-bukain-green hover:bg-bukain-green/90"
            >
              Find My Iftar Meal
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("recommendation-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-6 py-3 text-sm font-semibold bg-white border rounded-full border-grey-200 text-grey-700 hover:bg-grey-50"
            >
              See Example
            </button>
          </div>
        </div>

        <div className="relative w-full h-56 max-w-md overflow-hidden shadow-lg rounded-3xl md:h-72">
          <div className="absolute inset-0 bg-gradient-to-br from-bukain-green/80 via-bukain-green to-bukain-gold/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-10 text-center text-white border shadow-lg rounded-3xl border-white/20 bg-white/10">
              <div className="text-2xl font-bold">Iftar Deals</div>
              <div className="mt-2 text-sm text-white/80">
                Smart recommendations, ready in seconds.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Near You */}
      <section className="w-full max-w-6xl px-4 py-20 mx-auto overflow-hidden">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-sm font-bold tracking-widest uppercase text-bukain-gold">
              Most Popular
            </span>
            <h2 className="mt-2 text-3xl font-black md:text-4xl text-grey-900">
              Trending Near You
            </h2>
          </div>
        </div>
        <div
          className="flex gap-6 pb-8 overflow-x-auto snap-x"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            onClick={() => navigate("/browse")}
            className="min-w-[320px] snap-start group cursor-pointer"
          >
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-4">
              <img
                alt="Family Iftar Set"
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZPeBfi-aWmD7S6CbarC9h114_BRu_h-bx5TizGBWPrvg2nEH2SpU-a3qqpVT4pgq9qJPWjddQE0RuncKp-MLCJuzN9qwusj0wnd2Sgm_D7L5OOGbmIdJ_WE8vSRYLoQAeeX82gksstAzvBeUL6oGqXtYi0_SgBJdl6XM1z13ore_kUGSsntNRNEqcpvBjqSHkCM_km8IKOhopmul7e7Jv9zeSp-VIRfEKR31exKUh_l4LSO9Vdxw2jM7fjwVCmURnq3bLADXKDvQ"
              />
              <div className="absolute px-3 py-1 text-xs font-black rounded-full top-4 left-4 bg-white/90 backdrop-blur text-bukain-green">
                Best Value
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute text-white bottom-6 left-6">
                <p className="text-sm font-medium opacity-80">
                  Paket Buka Bareng
                </p>
                <p className="text-xl font-bold">Family Delight Set</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-2">
              <span className="font-bold text-bukain-green">
                Rp 120.000{" "}
                <span className="text-xs font-normal text-grey-400">
                  / 4 pax
                </span>
              </span>
              <div className="flex items-center gap-1 text-bukain-gold">
                <span className="material-symbols-outlined !text-sm">star</span>
                <span className="text-sm font-bold">4.9</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate("/browse")}
            className="min-w-[320px] snap-start group cursor-pointer"
          >
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-4">
              <img
                alt="Healthy Iftar"
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqfNcTB6PooGnoGmzvOGm2uGJ3_d7c9aie1IO0Hn1fzkSdKveNw1ezwMecWN5WVKKK8mqq__9FcYqyGWhDkjJ5d3Yf6m4oBzmkx-FSqySijH4z79Aj1cLre7lnlqHNlMErJvO9Emd8VubZFH58rBcCwsWpTUZJBZ8wSM4RxcFoty_YvmuYUzJ6MreaWxcTV_QNZAFQmGqYdR8jjRPPvYye-1isKUqNSbbh_i9nqF18Zx_lj2pxdSGjcdx_hnHlMzLPQKazIqDe7ds"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute text-white bottom-6 left-6">
                <p className="text-sm font-medium opacity-80">Healthy Choice</p>
                <p className="text-xl font-bold">Green Iftar Bowl</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-2">
              <span className="font-bold text-bukain-green">
                Rp 45.000{" "}
                <span className="text-xs font-normal text-grey-400">/ pax</span>
              </span>
              <div className="flex items-center gap-1 text-bukain-gold">
                <span className="material-symbols-outlined !text-sm">star</span>
                <span className="text-sm font-bold">4.7</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate("/browse")}
            className="min-w-[320px] snap-start group cursor-pointer"
          >
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-4">
              <img
                alt="Traditional Set"
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJvT1ewDYmRyOLrEO57Ia5WGUeWmMLheJl0QsUfzJ10NNiCi-wUc_sygUUbeYRzrB2BVNhleo0GyYPt3ZEgJFFYGZJR4C77x7L1cVMYj-CkB1DwtPcj9Szk_2FM7Vi00sRvJvUKlibhvAcn0sF2tnjsKDZjTn_JFoVRvUI0nsUPrPtb_ZjQ2tYeNJZFhQV1CI6OPZOF7iSAS7jlXU9NXNgll_I5_e7lP3LneFRuy45LU4LaA-sBDLzTzXLLqdiYvIML3B9FUo7XvA"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute text-white bottom-6 left-6">
                <p className="text-sm font-medium opacity-80">Local Favorite</p>
                <p className="text-xl font-bold">Nasi Kebuli Sultan</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-2">
              <span className="font-bold text-bukain-green">
                Rp 65.000{" "}
                <span className="text-xs font-normal text-grey-400">/ pax</span>
              </span>
              <div className="flex items-center gap-1 text-bukain-gold">
                <span className="material-symbols-outlined !text-sm">star</span>
                <span className="text-sm font-bold">4.8</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="generator-form"
        className="w-full max-w-6xl px-4 mx-auto mt-6"
      >
        <div className="p-8 bg-white shadow-sm rounded-3xl">
          <h2 className="text-2xl font-semibold text-grey-900">
            Plan Your Iftar
          </h2>
          <p className="mt-2 text-sm text-grey-600">
            Fill in the details and let AI do the rest.
          </p>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 mt-6 md:grid-cols-3"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-grey-700">
                Budget (IDR)
              </label>
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                type="number"
                min={0}
                className="w-full px-4 py-3 text-sm bg-white border shadow-sm rounded-2xl border-grey-200 focus:border-bukain-green focus:outline-none"
                placeholder="e.g. 50000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-grey-700">
                Number of people
              </label>
              <input
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                type="number"
                min={1}
                className="w-full px-4 py-3 text-sm bg-white border shadow-sm rounded-2xl border-grey-200 focus:border-bukain-green focus:outline-none"
                placeholder="e.g. 2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-grey-700">
                Food preferences
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PREFERENCE_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => handleTogglePref(option.id)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                      preferences.includes(option.id)
                        ? "border-bukain-green bg-bukain-green/10 text-bukain-green"
                        : "border-grey-200 bg-white text-grey-700 hover:bg-grey-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-medium text-grey-700">
                Custom Preference (Ceritakan keinginanmu)
              </label>
              <textarea
                value={customPreference}
                onChange={(e) => setCustomPreference(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-white border shadow-sm resize-none rounded-2xl border-grey-200 focus:border-bukain-green focus:outline-none"
                placeholder="Misal: 'Aku lagi pengen banget makan yang berkuah pedes, tapi minumnya es yang seger dan manis...'"
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-3 md:col-span-3 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-4 text-base font-semibold text-white transition shadow-sm rounded-2xl bg-bukain-green hover:bg-bukain-green/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Finding options…" : "Generate Meal with AI"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/browse")}
                className="flex-none px-6 py-4 text-base font-semibold transition bg-white border shadow-sm rounded-2xl border-grey-200 text-grey-700 hover:bg-grey-50"
              >
                Browse All Menu
              </button>
            </div>
            {error ? (
              <p className="mt-2 text-sm text-red-600 md:col-span-3">{error}</p>
            ) : null}
          </form>
        </div>
      </section>

      <section id="recommendation-section" className="w-full max-w-6xl px-4 mx-auto mt-16 mb-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-grey-900">
              Recommended for You
            </h2>
            <p className="mt-1 text-sm text-grey-600">
              Based on your preferences, here are the best meal packages for
              your iftar tonight.
            </p>
          </div>
          {recommendations?.length ? (
            <div className="hidden text-sm font-medium text-bukain-green sm:block">
              Tap a package to see details and checkout
            </div>
          ) : null}
        </div>

        {loading ? (
          <Loader label="Generating meal packages..." />
        ) : emptyMessage ? (
          <div className="px-8 py-12 mt-8 text-center border border-dashed rounded-3xl border-rose-200 bg-rose-50 text-rose-600">
            <p className="text-lg font-semibold">Waduh!</p>
            <p className="mt-2 text-rose-500">{emptyMessage}</p>
          </div>
        ) : recommendations?.length ? (
          <div className="grid gap-6 mt-8 lg:grid-cols-3">
            {recommendations.map((item) => (
              <PackageCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="px-8 py-12 mt-10 text-center bg-white border border-dashed rounded-2xl border-grey-200 text-grey-600">
            <p className="text-lg font-semibold">
              Start by generating a meal plan.
            </p>
            <p className="mt-2">
              Tell Bukain your budget and preferences to see curated options.
            </p>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section
        className="relative w-full py-24 bg-bukain-green/5 dark:bg-white"
        id="how-it-works"
      >
        <div className="relative z-10 max-w-6xl px-4 mx-auto">
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-4xl font-black text-bukain-green dark:text-bukain-green md:text-5xl">
              How it Works
            </h2>
            <div className="mx-auto h-1.5 w-24 bg-bukain-gold rounded-full"></div>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-10 bg-[#fdfaf3] rounded-[2.5rem] shadow-md border border-bukain-green/5 hover:border-bukain-gold/30 hover:shadow-xl hover:shadow-bukain-green/5 transition-all group">
              <div className="flex items-center justify-center w-24 h-24 mb-8 transition-transform rounded-3xl bg-bukain-green/10 text-bukain-green group-hover:scale-110 group-hover:rotate-3">
                <span className="material-symbols-outlined !text-5xl">
                  edit_note
                </span>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-grey-900">
                1. Preferences
              </h3>
              <p className="leading-relaxed text-grey-600 dark:text-grey-400">
                Input your budget, group size, and specific cravings for today's
                iftar.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-10 bg-[#fdfaf3] rounded-[2.5rem] shadow-md border border-bukain-green/5 hover:border-bukain-gold/30 hover:shadow-xl hover:shadow-bukain-green/5 transition-all group">
              <div className="flex items-center justify-center w-24 h-24 mb-8 transition-transform rounded-3xl bg-bukain-gold/10 text-bukain-gold group-hover:scale-110 group-hover:-rotate-3">
                <span className="material-symbols-outlined !text-5xl">
                  psychology
                </span>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-grey-900">
                2. AI Magic
              </h3>
              <p className="leading-relaxed text-grey-600 dark:text-grey-400">
                Our AI engine scans menus and nearby vendors to fit your exact
                budget.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-10 bg-[#fdfaf3] rounded-[2.5rem] shadow-md border border-bukain-green/5 hover:border-bukain-gold/30 hover:shadow-xl hover:shadow-bukain-green/5 transition-all group">
              <div className="flex items-center justify-center w-24 h-24 mb-8 transition-transform rounded-3xl bg-bukain-green/10 text-bukain-green group-hover:scale-110 group-hover:rotate-3">
                <span className="material-symbols-outlined !text-5xl">
                  celebration
                </span>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-grey-900">
                3. Enjoy Iftar
              </h3>
              <p className="leading-relaxed text-grey-600 dark:text-grey-400">
                Get curated meal sets and enjoy a stress-free blessing with your
                loved ones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Testimonials */}
      <section className="bg-[#fdfaf3] dark:bg-grey-900/40 py-24 w-full">
        <div className="max-w-6xl px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-bukain-green dark:text-bukain-green">
              Blessed Experiences
            </h2>
            <p className="text-grey-600 dark:text-grey-400">
              Join thousands of happy families who simplified their Ramadan
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white dark:bg-grey-800 p-8 rounded-[2rem] shadow-sm border border-bukain-green/5 hover:shadow-xl transition-all">
              <div className="flex gap-1 mb-6 text-bukain-gold">
                <span className="material-symbols-outlined !text-xl">star</span>
                <span className="material-symbols-outlined !text-xl">star</span>
                <span className="material-symbols-outlined !text-xl">star</span>
                <span className="material-symbols-outlined !text-xl">star</span>
                <span className="material-symbols-outlined !text-xl">star</span>
              </div>
              <p className="mb-8 italic text-grey-600 dark:text-grey-300">
                "Bukain saved me hours of daily debating with the family. The AI
                suggestions are always spot on for our budget!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 overflow-hidden rounded-full bg-grey-200">
                  <img
                    alt="Ahmad"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxfT_aTbWPfPNy_YHG7p_K1i7UYRTJ765BE4A3tgomwfZaIQv0gIvmXXcdBwZDpJ_Jl1bEDLkCCg6hVrD-fYmYcA9QOHB_wqT-KXZB1RMyz4iuPHdUyzBt8C3mWJcKxU013d3RSSa3Qx2E1r6T2ec1Saw5Krhmu1t7DHYtkFonQw65MIKO42h7fmE9Mi5uH-VGuv1a5S0VoYhRy9a1YECIfViPtoo-nc6ZnvsmgK6QOysPVh77LFuE4_FwZKYpzT7ru1vVJonwfn0"
                  />
                </div>
                <div>
                  <p className="font-bold text-grey-900">Ahmad Fauzi</p>
                  <p className="text-xs text-grey-400">Verified Parent</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-grey-800 p-8 rounded-[2rem] shadow-sm border border-bukain-green/5 hover:shadow-xl transition-all">
              <div className="flex gap-1 mb-6 text-bukain-gold">
                <span className="material-symbols-outlined !text-xl">star</span>
                <span className="material-symbols-outlined !text-xl">star</span>
                <span className="material-symbols-outlined !text-xl">star</span>
                <span className="material-symbols-outlined !text-xl">star</span>
                <span className="material-symbols-outlined !text-xl">star</span>
              </div>
              <p className="mb-8 italic text-grey-600 dark:text-grey-300">
                "I love how it highlights healthy choices. Keeping energy levels
                high while fasting is easier than ever."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 overflow-hidden rounded-full bg-grey-200">
                  <img
                    alt="Lina"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7VjjdZRAdbWuFx6zHcNkdtTmOrFBH1IxWfsNjhIo03L177BDKfJW7kIzf-tokwCLhID0yZ7vsvEnz4CrLaLMcFl3aDv5zByVmGUwR3CQm7UE9RVv06fHL2WmSpXsAXlNDG78RGJCtizNBn2sv420bAqvSFIZl7KqgUEdz3CuNvgRDcEYKCAu5Q_iRalazw2zQwW9VOoDPMWWD9FvoNXfkAJ5UsCQrUt1KRL7mbkbYayYkL7V8s8l71AippoUhu5SKk2oBIHBjYV4"
                  />
                </div>
                <div>
                  <p className="font-bold text-grey-900">Lina Permata</p>
                  <p className="text-xs text-grey-400">Nutrition Enthusiast</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-grey-800 p-8 rounded-[2rem] shadow-sm border border-bukain-green/5 hover:shadow-xl transition-all">
              <div className="flex gap-1 mb-6 text-bukain-gold">
                <span className="material-symbols-outlined !text-xl">star</span>
                <span className="material-symbols-outlined !text-xl">star</span>
                <span className="material-symbols-outlined !text-xl">star</span>
                <span className="material-symbols-outlined !text-xl">star</span>
                <span className="material-symbols-outlined !text-xl">star</span>
              </div>
              <p className="mb-8 italic text-grey-600 dark:text-grey-300">
                "Perfect for students like me. It finds the best budget-friendly
                Gorengan spots near campus!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 overflow-hidden rounded-full bg-grey-200">
                  <img
                    alt="Budi"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIOXc08ymD8Fxrg6zLrx-rCqjbIVorxLnPcb6hLU2dIonAW5mIDv7OCuX-sbrmhtKHggustOnRKngvP-MGjIQlBNEi_0_54DUpchAACBHQLLOCis_aBj8GFQP9u2fs9jdLO9_SPMYQ9fyfWNqqrcSMk3Cpg-aP8kPm0AW-tuoTxhKgfzSlpC6lLkjRFJU0Z5hhYT1roYL941fn8CGZHsVWy8Yq8EwXRWUr4lJcQP2ZFX07yH6JHUI_jJ0CeYCOUeOntGeIOLSeL7E"
                  />
                </div>
                <div>
                  <p className="font-bold text-grey-900">Budi Santoso</p>
                  <p className="text-xs text-grey-400">Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {/* <section className="w-full py-24 bg-white">
        <div className="max-w-3xl px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-bukain-green dark:text-bukain-green">Frequently Asked</h2>
            <p className="text-grey-600 dark:text-grey-400">Everything you need to know about Bukain</p>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div key={index} className="overflow-hidden bg-[#fdfaf3] border rounded-2xl dark:bg-grey-800 border-bukain-green/10 shadow-lg">
                <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex items-center justify-between w-full px-8 py-6 text-left transition-colors group hover:bg-grey-50">
                  <span className="text-lg font-bold text-grey-900">{faq.q}</span>
                  <span className={`material-symbols-outlined text-bukain-green transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6 text-sm text-grey-600 dark:text-grey-400">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section> */}
      {/* FAQ Section */}
      <section className="w-full py-24 bg-white">
        <div className="max-w-3xl px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-bukain-green">
              Frequently Asked Questions
            </h2>
            <p className="text-grey-600">
              Everything you need to know about Bukain
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="overflow-hidden bg-[#fdfaf3] border rounded-2xl border-bukain-green/10 shadow-lg">
              <button
                onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                className="flex items-center justify-between w-full px-8 py-6 text-left transition-colors group hover:bg-grey-50"
              >
                <span className="text-lg font-bold text-grey-900">
                  What is Bukain?
                </span>
                <span
                  className={`material-symbols-outlined text-bukain-green transition-transform ${openFaq === 0 ? "rotate-180" : ""}`}
                >
                  expand_more
                </span>
              </button>

              {openFaq === 0 && (
                <div className="px-8 pb-6 text-sm text-grey-600">
                  Bukain is a platform that helps you discover local restaurants
                  and order food easily. You can browse menus, choose your
                  favorite dishes, and complete payments securely in one place.
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="overflow-hidden bg-[#fdfaf3] border rounded-2xl border-bukain-green/10 shadow-lg">
              <button
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="flex items-center justify-between w-full px-8 py-6 text-left transition-colors group hover:bg-grey-50"
              >
                <span className="text-lg font-bold text-grey-900">
                  How do I order food on Bukain?
                </span>
                <span
                  className={`material-symbols-outlined text-bukain-green transition-transform ${openFaq === 1 ? "rotate-180" : ""}`}
                >
                  expand_more
                </span>
              </button>

              {openFaq === 1 && (
                <div className="px-8 pb-6 text-sm text-grey-600">
                  Simply browse restaurants, select a menu item you like, and
                  click the checkout button. Bukain will generate a secure
                  payment page where you can complete your order.
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="overflow-hidden bg-[#fdfaf3] border rounded-2xl border-bukain-green/10 shadow-lg">
              <button
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="flex items-center justify-between w-full px-8 py-6 text-left transition-colors group hover:bg-grey-50"
              >
                <span className="text-lg font-bold text-grey-900">
                  Is payment on Bukain secure?
                </span>
                <span
                  className={`material-symbols-outlined text-bukain-green transition-transform ${openFaq === 2 ? "rotate-180" : ""}`}
                >
                  expand_more
                </span>
              </button>

              {openFaq === 2 && (
                <div className="px-8 pb-6 text-sm text-grey-600">
                  Yes. Bukain uses a secure payment gateway to process
                  transactions. Your payment is handled safely through trusted
                  infrastructure to ensure reliability and protection.
                </div>
              )}
            </div>

            {/* FAQ 4 */}
            <div className="overflow-hidden bg-[#fdfaf3] border rounded-2xl border-bukain-green/10 shadow-lg">
              <button
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                className="flex items-center justify-between w-full px-8 py-6 text-left transition-colors group hover:bg-grey-50"
              >
                <span className="text-lg font-bold text-grey-900">
                  Can I explore restaurants before ordering?
                </span>
                <span
                  className={`material-symbols-outlined text-bukain-green transition-transform ${openFaq === 3 ? "rotate-180" : ""}`}
                >
                  expand_more
                </span>
              </button>

              {openFaq === 3 && (
                <div className="px-8 pb-6 text-sm text-grey-600">
                  Of course. Bukain lets you browse restaurants, explore their
                  menus, and view available dishes before deciding to place an
                  order.
                </div>
              )}
            </div>

            {/* FAQ 5 */}
            <div className="overflow-hidden bg-[#fdfaf3] border rounded-2xl border-bukain-green/10 shadow-lg">
              <button
                onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
                className="flex items-center justify-between w-full px-8 py-6 text-left transition-colors group hover:bg-grey-50"
              >
                <span className="text-lg font-bold text-grey-900">
                  How can restaurants join Bukain?
                </span>
                <span
                  className={`material-symbols-outlined text-bukain-green transition-transform ${openFaq === 4 ? "rotate-180" : ""}`}
                >
                  expand_more
                </span>
              </button>

              {openFaq === 4 && (
                <div className="px-8 pb-6 text-sm text-grey-600">
                  Restaurants can join Bukain to showcase their menu online and
                  reach more customers. Bukain helps restaurants accept digital
                  payments and manage orders more efficiently.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="w-full px-4 py-20 bg-[#fdfaf3]">
        <div className="max-w-6xl mx-auto">
          <div className="bg-bukain-gold rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden group">
            <div
              className="absolute inset-0 transition-transform duration-1000 opacity-20 group-hover:scale-110"
              style={{
                backgroundImage:
                  "url(https://lh3.googleusercontent.com/aida-public/AB6AXuCp_IYtiR9VspyZGKdbxZ8QLE0bXWJzz9DyKZyXBsJtvnbYG6PXoFav6wDRHb3L8ElzmxVZhQS7XambTNFkhAlFWQnD8ujuE6nKTBvTXxifE0sx5ihi_U6IhzrHpAy3ZdsIE13p9gR_jZ3ihcaNdI3rmbfwmYHuackMvgnyfMIfXg9fV2C_WDzthKLGNBEYkfKnNr43sXwNoTxtmsl2DTY2xJIXTUfVRWen36M9XuM1X-yMG_Gz-R3zUe0HlHi6i4BQY1z2XHHRmb4)",
                backgroundSize: "cover",
              }}
            ></div>
            <div className="relative z-10 flex flex-col items-center gap-8">
              <div className="flex items-center justify-center w-20 h-20 rounded-full text-bukain-green bg-white/20">
                <span className="material-symbols-outlined !text-4xl">
                  mail
                </span>
              </div>
              <div className="max-w-2xl text-bukain-green">
                <h2 className="mb-4 text-4xl font-black leading-tight drop-shadow-sm">
                  Get Daily Iftar Inspirations
                </h2>
                <p className="font-medium drop-shadow-sm">
                  Join 50,000+ others receiving daily AI-curated recipes and
                  local discounts directly in their inbox.
                </p>
              </div>
              <form
                className="flex flex-col w-full max-w-lg gap-4 sm:flex-row"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  className="flex-1 h-16 px-6 font-medium transition-all border-none outline-none rounded-2xl bg-white/90 backdrop-blur focus:ring-4 focus:ring-white/30 text-grey-800"
                  placeholder="Your best email address"
                  required
                  type="email"
                />
                <button
                  className="h-16 px-10 font-black text-white transition-all shadow-xl rounded-2xl bg-bukain-green hover:bg-bukain-green/90 shadow-bukain-green/20"
                  type="submit"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-[10px] uppercase tracking-widest font-bold text-bukain-green/70">
                NO SPAM. ONLY BLESSINGS. UNSUBSCRIBE ANYTIME.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
