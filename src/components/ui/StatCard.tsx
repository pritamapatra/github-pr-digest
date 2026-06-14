import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "warning" | "danger" | "success";
}

const variantStyles = {
  default: {
    container: "bg-white border-zinc-100",
    icon: "bg-zinc-50 text-zinc-500",
    value: "text-zinc-900",
  },
  warning: {
    container: "bg-white border-zinc-100",
    icon: "bg-amber-50 text-amber-600",
    value: "text-amber-600",
  },
  danger: {
    container: "bg-white border-zinc-100",
    icon: "bg-red-50 text-red-500",
    value: "text-red-500",
  },
  success: {
    container: "bg-white border-zinc-100",
    icon: "bg-emerald-50 text-emerald-600",
    value: "text-emerald-600",
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  description,
  variant = "default",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-2 sm:gap-4 transition-all duration-200 hover:shadow-sm",
        styles.container
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-medium text-zinc-500 tracking-tight leading-tight">
          {label}
        </span>
        <div className={cn("p-1.5 sm:p-2 rounded-xl shrink-0", styles.icon)}>
          <Icon size={14} strokeWidth={1.75} />
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className={cn("text-2xl sm:text-3xl font-semibold tracking-tight", styles.value)}>
          {value.toLocaleString()}
        </span>
        {description && (
          <span className="text-xs text-zinc-400 font-normal hidden sm:block">
            {description}
          </span>
        )}
      </div>
    </div>
  );
}