import { BarChart3, Loader2 } from "lucide-react";
import type React from "react";

export const LoadingScreen: React.FC = () => (
  <div className="h-dvh flex flex-col items-center justify-center bg-background gap-4">
    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
      <BarChart3 className="w-6 h-6 text-primary-foreground" />
    </div>
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Loading Atlas CRM...</span>
    </div>
  </div>
);
