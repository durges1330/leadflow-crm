import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
  LEAD_SOURCES,
  LEAD_SOURCE_CONFIG,
  LEAD_STATUSES,
  LEAD_STATUS_CONFIG,
} from "../../constants";
import type {
  LeadFilter,
  LeadSource,
  LeadStatus,
  UserProfile,
} from "../../types";

interface LeadFiltersProps {
  filter: LeadFilter;
  onChange: (filter: LeadFilter) => void;
  users: UserProfile[];
  activeFilterCount: number;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  filter,
  onChange,
  users,
  activeFilterCount,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const set = <K extends keyof LeadFilter>(key: K, value: LeadFilter[K]) =>
    onChange({ ...filter, [key]: value });

  const clear = () => onChange({});

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    const tags = [...(filter.tags ?? []), t];
    onChange({ ...filter, tags });
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    onChange({ ...filter, tags: (filter.tags ?? []).filter((t) => t !== tag) });

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Toggle row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          data-ocid="leads.filter_toggle"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 min-w-5 px-1.5 text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>

        {activeFilterCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={clear}
            data-ocid="leads.filter_clear"
          >
            <X className="w-3 h-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Filter fields */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          expanded ? "max-h-[400px]" : "max-h-0",
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Status
            </Label>
            <Select
              value={filter.status ?? ""}
              onValueChange={(v) =>
                set("status", v ? (v as LeadStatus) : undefined)
              }
            >
              <SelectTrigger
                className="h-8 text-xs"
                data-ocid="leads.filter_status.select"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="" className="text-xs">
                  All statuses
                </SelectItem>
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {LEAD_STATUS_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Source
            </Label>
            <Select
              value={filter.source ?? ""}
              onValueChange={(v) =>
                set("source", v ? (v as LeadSource) : undefined)
              }
            >
              <SelectTrigger
                className="h-8 text-xs"
                data-ocid="leads.filter_source.select"
              >
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="" className="text-xs">
                  All sources
                </SelectItem>
                {LEAD_SOURCES.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {LEAD_SOURCE_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned counselor */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Assigned To
            </Label>
            <Select
              value={filter.assignedTo ?? ""}
              onValueChange={(v) => set("assignedTo", v || undefined)}
            >
              <SelectTrigger
                className="h-8 text-xs"
                data-ocid="leads.filter_assigned.select"
              >
                <SelectValue placeholder="Anyone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="" className="text-xs">
                  Anyone
                </SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="text-xs">
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campaign */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Campaign
            </Label>
            <Input
              value={filter.campaign ?? ""}
              onChange={(e) => set("campaign", e.target.value || undefined)}
              placeholder="Campaign name"
              className="h-8 text-xs"
              data-ocid="leads.filter_campaign.input"
            />
          </div>

          {/* Date from */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Date From
            </Label>
            <Input
              type="date"
              value={
                filter.dateFrom
                  ? new Date(Number(filter.dateFrom) / 1_000_000)
                      .toISOString()
                      .slice(0, 10)
                  : ""
              }
              onChange={(e) =>
                set(
                  "dateFrom",
                  e.target.value
                    ? BigInt(new Date(e.target.value).getTime() * 1_000_000)
                    : undefined,
                )
              }
              className="h-8 text-xs"
              data-ocid="leads.filter_date_from.input"
            />
          </div>

          {/* Date to */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Date To
            </Label>
            <Input
              type="date"
              value={
                filter.dateTo
                  ? new Date(Number(filter.dateTo) / 1_000_000)
                      .toISOString()
                      .slice(0, 10)
                  : ""
              }
              onChange={(e) =>
                set(
                  "dateTo",
                  e.target.value
                    ? BigInt(new Date(e.target.value).getTime() * 1_000_000)
                    : undefined,
                )
              }
              className="h-8 text-xs"
              data-ocid="leads.filter_date_to.input"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag and press Enter"
                className="h-8 text-xs flex-1"
                data-ocid="leads.filter_tag.input"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={addTag}
                data-ocid="leads.filter_tag.add_button"
              >
                Add
              </Button>
            </div>
            {(filter.tags ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {(filter.tags ?? []).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs gap-1 pl-2 pr-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive transition-colors"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
