import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  accentColor?: string;
  loading?: boolean;
  "data-ocid"?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  accentColor = "border-primary",
  loading = false,
  "data-ocid": dataOcid,
}) => {
  return (
    <div
      data-ocid={dataOcid}
      className={cn(
        "bg-card border border-border rounded-xl p-5 border-l-4 shadow-sm hover:shadow-md transition-shadow duration-200",
        accentColor,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 truncate">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {value}
            </p>
          )}
          {change && !loading && (
            <p
              className={cn(
                "text-xs mt-1.5 font-medium",
                changeType === "positive" &&
                  "text-emerald-600 dark:text-emerald-400",
                changeType === "negative" && "text-red-500 dark:text-red-400",
                changeType === "neutral" && "text-muted-foreground",
              )}
            >
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};
