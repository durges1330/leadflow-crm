import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { LEAD_STATUSES, LEAD_STATUS_CONFIG } from "../../constants";
import type { LeadStatus } from "../../types";

interface BulkActionBarProps {
  count: number;
  onClearSelection: () => void;
  onBulkStatusChange: (status: LeadStatus) => void;
  isPending: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  count,
  onClearSelection,
  onBulkStatusChange,
  isPending,
}) => {
  const [bulkStatus, setBulkStatus] = useState<LeadStatus | "">("");

  const handleApply = () => {
    if (!bulkStatus) return;
    onBulkStatusChange(bulkStatus);
    setBulkStatus("");
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-xl"
      data-ocid="leads.bulk_action_bar"
    >
      <span className="text-sm font-medium text-primary">
        {count} lead{count !== 1 ? "s" : ""} selected
      </span>

      <div className="flex items-center gap-2 ml-auto">
        <Select
          value={bulkStatus}
          onValueChange={(v) => setBulkStatus(v as LeadStatus)}
        >
          <SelectTrigger
            className="h-8 text-xs w-44"
            data-ocid="leads.bulk_status.select"
          >
            <SelectValue placeholder="Change status…" />
          </SelectTrigger>
          <SelectContent>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {LEAD_STATUS_CONFIG[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          size="sm"
          className="h-8 text-xs"
          disabled={!bulkStatus || isPending}
          onClick={handleApply}
          data-ocid="leads.bulk_apply.button"
        >
          {isPending ? "Applying..." : "Apply"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClearSelection}
          aria-label="Clear selection"
          data-ocid="leads.bulk_clear.button"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
