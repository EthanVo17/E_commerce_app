export default function SearchSkeleton() {
  return (
    <div
      data-testid="search-loading"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="aspect-square animate-pulse bg-gray-200" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
