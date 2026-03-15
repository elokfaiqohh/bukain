export default function MenuCard({
  title,
  price,
  items,
  image,
  badge,
  badgeColor = "bg-primary"
}) {
  return (
    <div className="flex flex-col overflow-hidden transition-all duration-300 bg-white border shadow-sm group dark:bg-slate-900 rounded-xl hover:shadow-xl border-slate-100 dark:border-slate-800">

      {/* Image */}
      <div className="relative w-full h-56 overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-500 bg-center bg-cover group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
        />

        {badge && (
          <div
            className={`absolute top-4 left-4 ${badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase`}
          >
            {badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">

        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>

          <span className="font-bold text-primary">{price}</span>
        </div>

        {/* Items */}
        <div className="flex flex-wrap gap-2 mb-6">
          {items.map((item, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs rounded bg-primary/10 text-primary"
            >
              {item}
            </span>
          ))}
        </div>

        <button className="flex items-center justify-center w-full gap-2 py-3 mt-auto font-bold text-white transition-colors rounded-lg bg-primary hover:bg-primary/90">
          <span className="text-lg material-symbols-outlined">
            shopping_basket
          </span>
          Order This Package
        </button>

      </div>
    </div>
  );
}