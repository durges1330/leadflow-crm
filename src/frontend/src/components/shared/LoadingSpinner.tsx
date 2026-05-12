import { Loader2 } from "lucide-react";
import type React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  label,
  className,
}) => {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }[size];

  return (
    <div
      className={`flex items-center justify-center gap-2 ${className ?? ""}`}
    >
      <Loader2 className={`${sizeClass} animate-spin text-muted-foreground`} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
};
