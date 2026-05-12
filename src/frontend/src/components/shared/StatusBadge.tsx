import { cn } from "@/lib/utils";
import type React from "react";
import { LEAD_STATUS_CONFIG } from "../../constants";
import type { LeadStatus } from "../../types";

interface StatusBadgeProps {
  status: LeadStatus;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "sm",
}) => {
  const config = LEAD_STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        config.bgColor,
        config.textColor,
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1",
      )}
    >
      {config.label}
    </span>
  );
};
