// Placeholder shimmer shown while lists load — no new deps.
export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-white/10 ${className}`} />;
}

export function JobCardSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-xl border border-white/10 bg-panel p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="mt-3 h-3 w-full" />
      <div className="mt-2 flex gap-2">
        <Skeleton className="h-5 w-16 !rounded-full" />
        <Skeleton className="h-5 w-16 !rounded-full" />
      </div>
    </div>
  );
}
