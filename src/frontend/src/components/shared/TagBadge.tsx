import { cn } from "@/lib/utils";
import type React from "react";

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  onRemove,
  className,
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 bg-muted text-muted-foreground text-xs font-medium rounded-full px-2 py-0.5",
      className,
    )}
  >
    {tag}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-foreground transition-colors leading-none"
        aria-label={`Remove tag ${tag}`}
      >
        ×
      </button>
    )}
  </span>
);
