import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("ws-skeleton h-4 w-full", className)} />;
}

/** Placeholder rows that mirror the shape of a data table while it loads. */
export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="ws-card overflow-hidden">
      <div className="flex gap-4 border-b border-border bg-[var(--surface-muted)] px-4 py-3.5">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>

      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-t border-[var(--hairline)] px-4 py-4">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className={clsx("h-4 flex-1", c === 0 && "max-w-[160px]")} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Placeholder cards for the mobile list view. */
export function CardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ws-card space-y-3 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Stat tiles + table, the shape most list pages load into. */
export function PageSkeleton() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>

      <div className="hidden lg:block">
        <TableSkeleton />
      </div>
      <div className="lg:hidden">
        <CardListSkeleton />
      </div>
    </div>
  );
}

export default Skeleton;
