import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRestaurants } from "../utils/api";
import { usePackages } from "../contexts/PackagesContext";
import Loader from "../components/Loader";
import PackageCard from "../components/PackageCard";

export default function BrowseMenu() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginated, setIsPaginated] = useState(false);
  const itemsPerPage = 15; // 5 baris x 3 kolom

  const navigate = useNavigate();
  const { setRecommendations } = usePackages();

  useEffect(() => {
    fetchRestaurants()
      .then(setRestaurants)
      .catch(() => setError("Unable to load menu"))
      .finally(() => setLoading(false));
  }, []);

  // 1. Gabungkan semua menu jadi satu array pipih
  const allItems = useMemo(() => {
    return restaurants.flatMap((rest) =>
      rest.menu.map((item) => ({
        ...item,
        restaurantName: rest.name,
        restaurantId: rest.id,
      })),
    );
  }, [restaurants]);

  // 2. Filter menu berdasarkan pencarian (search query)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;

    const query = searchQuery.toLowerCase();
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.restaurantName.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)),
    );
  }, [allItems, searchQuery]);

  // Reset ke halaman 1 ketika user melakukan pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // 3. Potong array menu sesuai halaman yang sedang aktif
  const displayedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleSeeMore = () => {
    setIsPaginated(true);
    setCurrentPage(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewDetail = (item) => {
    const pkg = {
      id: `${item.restaurantId}-menu-${item.id}`,
      name: item.name,
      description:
        item.description ||
        `A delicious serving of ${item.name} from ${item.restaurantName}.`,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName,
      items:
        restaurants
          .find((r) => r.id === item.restaurantId)
          ?.menu.slice(0, 3)
          .map((m) => ({
            name: m.name,
            price: m.price,
            img: m.image || m.img,
          })) || [],
      totalPrice: item.price,
    };

    setRecommendations([pkg]);
    navigate(`/package/${pkg.id}`);
  };

  return (
    <main className="max-w-6xl px-4 pb-20 mx-auto">
      <div className="flex flex-col gap-4 mt-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Browse All Menu</h1>
          <p className="mt-2 text-sm text-slate-600">
            Explore all packages and menu items from every restaurant.
          </p>
        </div>

        <div className="w-full md:max-w-xs">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-slate-400 material-symbols-outlined">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food or restaurant..."
              className="w-full py-3 pl-12 pr-4 text-sm transition-colors bg-white border rounded-full shadow-sm border-slate-200 focus:outline-none focus:border-bukain-green focus:ring-1 focus:ring-bukain-green"
            />
          </div>
        </div>
      </div>

      <section className="p-8 mt-8 bg-white shadow-sm rounded-3xl">
        {loading ? (
          <Loader label="Loading menu..." />
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : (
          <>
            {filteredItems.length === 0 ? (
              <div className="py-20 text-center text-slate-500">
                <p className="text-lg font-medium">
                  No menu items found for "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 font-semibold text-bukain-green hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {/* {displayedItems.map((item) => {
                const coverImage =
                  item.image ||
                  item.img ||
                  "https://images.unsplash.com/photo-1504674900247-0877df9cc836"; */}
                  {displayedItems.map((item) => {
                    const pkg = {
                      id: `${item.restaurantId}-menu-${item.id}`,
                      name: item.name,
                      description:
                        item.description ||
                        `A delicious serving of ${item.name} from ${item.restaurantName}.`,
                      restaurantId: item.restaurantId,
                      restaurantName: item.restaurantName,
                      items:
                        restaurants
                          .find((r) => r.id === item.restaurantId)
                          ?.menu.slice(0, 3)
                          .map((m) => ({
                            name: m.name,
                            price: m.price,
                            img: m.image || m.img,
                          })) || [],
                      totalPrice: item.price,
                    };

                    return (
                      <PackageCard
                        key={pkg.id}
                        item={pkg}
                        onClick={() => handleViewDetail(item)}
                      />
                    );
                  })}
                </div>

                {/* Pagination / See More */}
                {filteredItems.length > itemsPerPage && (
                  <div className="flex justify-center mt-12">
                    {!isPaginated ? (
                      <button
                        onClick={handleSeeMore}
                        className="px-8 py-3 font-semibold text-white transition-colors rounded-full shadow-sm bg-bukain-green hover:bg-bukain-green/90"
                      >
                        See More
                      </button>
                    ) : (
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handlePrevious}
                          disabled={currentPage === 1}
                          className="px-6 py-2 text-sm font-semibold transition-colors bg-white border rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-sm font-medium text-slate-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={handleNext}
                          disabled={currentPage === totalPages}
                          className="px-6 py-2 text-sm font-semibold transition-colors bg-white border rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}
