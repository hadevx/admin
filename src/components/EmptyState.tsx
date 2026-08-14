import { Inbox, type LucideIcon } from "lucide-react";
import clsx from "clsx";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

/** Friendly placeholder for "no results" / "nothing here yet" states. */
function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
        className,
      )}>
      <span className="grid size-14 place-items-center rounded-2xl border border-border bg-muted text-muted-foreground">
        <Icon className="size-6" strokeWidth={1.6} />
      </span>

      <div>
        <p className="text-sm font-bold text-foreground">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {action}
    </div>
  );
}

export default EmptyState;
