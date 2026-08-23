export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse mb-8" />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 h-80 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
