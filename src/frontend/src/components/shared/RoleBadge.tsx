import { cn } from "@/lib/utils";
import type React from "react";
import { ROLE_CONFIG } from "../../constants";
import type { Role } from "../../types";

interface RoleBadgeProps {
  role: Role;
  size?: "xs" | "sm";
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = "sm" }) => {
  const config = ROLE_CONFIG[role];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.bgColor,
        config.color,
        size === "xs" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5",
      )}
    >
      {config.label}
    </span>
  );
};
