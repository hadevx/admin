import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import clsx from "clsx";

type PaginateProps = {
  page: number;
  pages: number;
  setPage: (p: number) => void;
  className?: string;
};

/**
 * Builds a windowed page list: 1 … 4 5 [6] 7 8 … 20.
 * Keeps the control a fixed width no matter how many pages exist.
 */
const buildRange = (page: number, pages: number): (number | "…")[] => {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

  const range: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);

  if (start > 2) range.push("…");
  for (let i = start; i <= end; i++) range.push(i);
  if (end < pages - 1) range.push("…");

  range.push(pages);
  return range;
};

const Paginate = ({ page, pages, setPage, className }: PaginateProps) => {
  const language = useSelector((state: any) => state.language.lang);
  const isRTL = language === "ar";

  if (pages <= 1) return null;

  const Prev = isRTL ? ChevronRight : ChevronLeft;
  const Next = isRTL ? ChevronLeft : ChevronRight;

  const go = (next: number) => setPage(Math.min(Math.max(next, 1), pages));

  const arrowClass =
    "inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      aria-label="Pagination"
      className={clsx("flex flex-wrap items-center justify-center gap-1.5 py-4", className)}>
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label={isRTL ? "الصفحة السابقة" : "Previous page"}
        className={arrowClass}>
        <Prev className="size-4" />
      </button>

      {/* Compact indicator on phones, full page list from sm up */}
      <span className="px-3 text-sm font-semibold text-muted-foreground sm:hidden">
        {page} / {pages}
      </span>

      <div className="hidden items-center gap-1.5 sm:flex">
        {buildRange(page, pages).map((entry, i) =>
          entry === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => go(entry)}
              aria-current={entry === page ? "page" : undefined}
              className={clsx(
                "inline-flex size-9 items-center justify-center rounded-lg border text-sm font-bold transition-colors",
                entry === page
                  ? "border-transparent bg-emphasis text-emphasis-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}>
              {entry}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= pages}
        aria-label={isRTL ? "الصفحة التالية" : "Next page"}
        className={arrowClass}>
        <Next className="size-4" />
      </button>
    </nav>
  );
};

export default Paginate;
