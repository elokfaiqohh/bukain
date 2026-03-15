import { useNavigate } from "react-router-dom";

export default function PackageCard({ item, onClick }) {
  const totalPrice = Number(item.totalPrice || 0);
  const navigate = useNavigate();

  // Ambil gambar dari item pertama di dalam paket (atau default fallback)
  const coverImage =
    item.items?.[0]?.img ||
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop";

  return (
    <div
      onClick={onClick ? onClick : () => navigate(`/package/${item.id}`)}
      className="flex flex-col overflow-hidden transition-all duration-300 bg-white border shadow-sm cursor-pointer group rounded-xl hover:shadow-xl border-slate-200"
    >
      {/* IMAGE */}
      <div className="relative w-full h-56 overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={item.name}
          className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />

        {/* Restaurant badge */}
        <div className="absolute px-3 py-1 text-xs font-bold tracking-tight text-white uppercase rounded-full top-4 left-4 bg-bukain-green">
          {item.restaurantName}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 p-6">
        {/* TITLE + PRICE */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-xl font-bold leading-snug text-slate-900">
            {item.name}
          </h3>

          <span className="font-bold text-bukain-green whitespace-nowrap">
            Rp{totalPrice.toLocaleString("id-ID")}
          </span>
        </div>

        {/* FOOD TAGS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {item.items?.slice(0, 3).map((food, index) => (
            <span
              key={`${food.name}-${index}`}
              className="px-2 py-1 text-xs rounded bg-bukain-green/10 text-bukain-green"
            >
              {food.name}
            </span>
          ))}
          {item.items?.length > 3 && (
            <span className="px-2 py-1 text-xs rounded bg-bukain-green/10 text-bukain-green">
              +{item.items.length - 3}
            </span>
          )}
        </div>

        {/* BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick ? onClick(e) : navigate(`/package/${item.id}`);
          }}
          className="flex items-center justify-center w-full gap-2 py-3 mt-auto font-semibold text-white transition-colors rounded-lg bg-bukain-green hover:bg-bukain-green/90"
        >
          <span className="text-lg material-symbols-outlined">
            shopping_basket
          </span>
          Order This Package
        </button>
      </div>
    </div>
  );
}
