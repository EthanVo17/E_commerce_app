export default function ProductDetailSkeleton() {
  return (
    <div data-testid="product-detail-loading">
      <div className="mb-5 h-4 w-64 animate-pulse rounded bg-gray-200" />

      <section className="rounded-xl bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div>
            <div className="aspect-square animate-pulse rounded-lg bg-gray-200" />
            <div className="mt-3 grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse rounded-md bg-gray-200"
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-5/6 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100" />
            <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
