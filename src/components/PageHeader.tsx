import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Small count pill rendered next to the title, e.g. "128 orders". */
  count?: string | number;
  countLabel?: string;
  actions?: React.ReactNode;
  className?: string;
};

/**
 * The standard page heading: icon tile, title + subtitle, optional count pill
 * and a right-hand action slot that wraps below the title on narrow screens.
 */
function PageHeader({
  title,
  subtitle,
  icon: Icon,
  count,
  countLabel,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={clsx(
        "mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}>
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emphasis text-emphasis-foreground shadow-sm">
            <Icon className="size-5" strokeWidth={2} />
          </span>
        ) : null}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
            {count !== undefined && (
              <span className="ws-pill ws-pill-info">
                {count}
                {countLabel ? <span className="font-semibold opacity-80">{countLabel}</span> : null}
              </span>
            )}
          </div>
          {subtitle ? (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {actions ? (
        // Actions stretch to full width on phones so they stay easy to tap.
        <div className="flex flex-wrap items-center gap-2 max-sm:[&>*]:flex-1 sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export default PageHeader;
