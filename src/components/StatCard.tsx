import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  hint?: string;
  /** Renders as a button and shows a selected ring. */
  active?: boolean;
  onClick?: () => void;
  className?: string;
  /**
   * CSS colour (usually a `var(--viz-n)` token) that tints the icon tile, the
   * top rule and the selected ring. Omit for the plain monochrome tile.
   */
  accent?: string;
};

/** Metric tile used across the dashboard and list headers. */
function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  active,
  onClick,
  className,
  accent,
}: StatCardProps) {
  const Tag = onClick ? "button" : "div";

  // Mixed against the card so the tint stays light in both themes.
  const tint = (pct: number) => `color-mix(in srgb, ${accent} ${pct}%, var(--card))`;

  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick } : {})}
      style={
        accent && active
          ? { borderColor: tint(55), boxShadow: `0 0 0 2px ${tint(22)}` }
          : undefined
      }
      className={clsx(
        // Compact side-by-side layout on phones, stacked tile from sm up.
        "ws-card group relative flex w-full items-center gap-3 overflow-hidden p-4 text-start transition-all duration-200",
        "sm:flex-col sm:items-stretch sm:gap-0 sm:p-5",
        onClick && "hover:-translate-y-0.5",
        onClick && !accent && "hover:border-foreground/25",
        active && !accent && "border-emphasis ring-2 ring-foreground/15",
        className,
      )}>
      {/* Colour rule along the top edge — the card reads as "this metric" even
          before you get to the icon. */}
      {accent ? (
        <span
          aria-hidden
          className={clsx(
            "absolute inset-x-0 top-0 h-1 transition-opacity duration-200",
            active ? "opacity-100" : "opacity-45 group-hover:opacity-80",
          )}
          style={{ backgroundColor: accent }}
        />
      ) : null}

      {Icon ? (
        <span
          className={clsx(
            "grid size-10 shrink-0 place-items-center rounded-xl border transition-transform duration-200 sm:size-11",
            !accent && "border-border bg-[var(--surface-muted)] text-foreground",
            onClick && "group-hover:scale-105",
          )}
          style={
            accent
              ? { backgroundColor: tint(12), borderColor: tint(30), color: accent }
              : undefined
          }>
          <Icon className="size-5" strokeWidth={2} />
        </span>
      ) : null}

      <div className="min-w-0 flex-1 sm:mt-4">
        <p className="truncate text-xl font-extrabold tracking-tight sm:text-[1.7rem]">{value}</p>
        <p className="truncate text-xs font-medium text-muted-foreground sm:mt-1 sm:text-sm">
          {label}
        </p>
      </div>

      {hint ? (
        <span className="absolute end-5 top-5 hidden text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:block">
          {hint}
        </span>
      ) : null}
    </Tag>
  );
}

export default StatCard;
