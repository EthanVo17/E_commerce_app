export default function SearchSkeleton() {
  return (
    <div
      data-testid="search-loading"
      className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="aspect-square animate-pulse bg-gray-200" />
          <div className="space-y-2.5 p-3">
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
