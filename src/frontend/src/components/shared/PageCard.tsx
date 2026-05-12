import { cn } from "@/lib/utils";
import type React from "react";

interface PageCardProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md";
}

export const PageCard: React.FC<PageCardProps> = ({
  title,
  description,
  actions,
  children,
  className,
  padding = "md",
}) => {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl shadow-sm",
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      )}
      <div
        className={cn(
          padding === "md" && "p-5",
          padding === "sm" && "p-3",
          padding === "none" && "",
        )}
      >
        {children}
      </div>
    </div>
  );
};
