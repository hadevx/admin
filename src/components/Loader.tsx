import clsx from "clsx";

/**
 * Centred loading indicator. Flows in the page instead of covering it, so it
 * no longer overlaps the sidebar and top bar.
 */
const Loader = ({ className, label }: { className?: string; label?: string }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        "flex min-h-[50vh] w-full flex-col items-center justify-center gap-4",
        className,
      )}>
      <div className="relative size-12">
        <div className="absolute inset-0 rounded-full border-[3px] border-border" />
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-foreground" />
        <div
          className="absolute inset-1.5 animate-spin rounded-full border-[3px] border-transparent border-b-muted-foreground/50"
          style={{ animationDirection: "reverse", animationDuration: "1.4s" }}
        />
      </div>

      <p className="text-sm font-semibold text-muted-foreground">{label ?? "Loading…"}</p>
    </div>
  );
};

export default Loader;
