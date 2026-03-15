export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-bukain-green border-opacity-30 border-t-bukain-green" />
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  );
}
