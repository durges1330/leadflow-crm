import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import type React from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  "data-ocid"?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  "data-ocid": dataOcid,
}) => (
  <div
    data-ocid={dataOcid}
    className="flex flex-col items-center justify-center py-16 px-4 text-center"
  >
    {Icon && (
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
    )}
    <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
    {description && (
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    )}
    {action && (
      <Button type="button" size="sm" className="mt-5" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </div>
);
