import { CircleCheck, TriangleAlert, Lightbulb, Crown, Clock } from "lucide-react";
import { twMerge } from "tailwind-merge";

type BadgeVariant = "success" | "danger" | "pending" | "primary" | "admin" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
}

const variantConfig: Record<BadgeVariant, { classes: string; icon: React.ReactNode }> = {
  success: {
    classes:
      "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/25",
    icon: <CircleCheck strokeWidth={2} size={16} />,
  },
  danger: {
    classes:
      "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-500/10 dark:border-rose-500/25",
    icon: <TriangleAlert strokeWidth={2} size={16} />,
  },
  pending: {
    classes:
      "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/25",
    icon: <Clock strokeWidth={2} size={16} />,
  },
  primary: {
    classes:
      "text-foreground bg-[var(--surface-muted)] border-border dark:bg-white/5",
    icon: <Lightbulb strokeWidth={2} size={16} />,
  },
  admin: {
    classes:
      "text-amber-800 bg-gradient-to-b from-amber-100 to-amber-200 border-amber-300 dark:text-amber-200 dark:from-amber-500/15 dark:to-amber-500/10 dark:border-amber-500/30",
    icon: <Crown strokeWidth={2} size={16} />,
  },
  neutral: {
    classes: "text-muted-foreground bg-muted border-border",
    icon: <Lightbulb strokeWidth={2} size={16} />,
  },
};

function Badge({ variant = "primary", children, icon = true, className }: BadgeProps) {
  const config = variantConfig[variant] ?? variantConfig.primary;

  const defaultClasses = `inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold ${config.classes}`;

  // Merge default classes with className, letting className override conflicts
  const finalClassName = twMerge(defaultClasses, className);

  return (
    <div className={finalClassName}>
      {icon && config.icon}
      {children}
    </div>
  );
}

export default Badge;
