import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Filter, Kanban, Phone, Search, X } from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  LEAD_SOURCE_CONFIG,
  LEAD_STATUS_CONFIG,
  PIPELINE_STAGES,
} from "../constants";
import {
  useFilterLeads,
  useListAllUsers,
  useUpdateLeadStatus,
} from "../hooks/useQueries";
import type { Lead, LeadSource, LeadStatus } from "../types";

// ===================== Lead Card =====================

const SOURCE_COLORS: Record<string, string> = {
  Website: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  LandingPage:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  FacebookAds:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  GoogleAds:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Referral:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  WhatsApp:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  ManualEntry:
    "bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400",
  CsvUpload:
    "bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400",
  Api: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  Other: "bg-muted text-muted-foreground",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-blue-500",
  "bg-pink-500",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface LeadCardProps {
  lead: Lead;
  index: number;
  accentColor: string;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onClick: () => void;
}

const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  index,
  accentColor,
  onDragStart,
  onClick,
}) => {
  const MAX_TAGS = 3;
  const visibleTags = lead.tags.slice(0, MAX_TAGS);
  const overflowCount = lead.tags.length - MAX_TAGS;
  const sourceCfg = LEAD_SOURCE_CONFIG[lead.source as LeadSource];
  const sourceLabel = sourceCfg?.label ?? lead.source;
  const sourceColorClass =
    SOURCE_COLORS[lead.source] ?? "bg-muted text-muted-foreground";
  const initials = getInitials(lead.assignedToName || lead.name);
  const bgColor = avatarColor(lead.assignedToName || lead.name);

  return (
    <button
      type="button"
      data-ocid={`pipeline.lead_card.${index}`}
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="group relative w-full text-left bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing select-none"
      style={{ borderLeft: `3px solid ${accentColor}` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate leading-tight">
            {lead.name}
          </p>
          {lead.courseInterest && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {lead.courseInterest}
            </p>
          )}
        </div>
        {/* Assigned user avatar */}
        <div
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold",
            bgColor,
          )}
          title={lead.assignedToName || "Unassigned"}
        >
          {initials}
        </div>
      </div>

      {/* Phone */}
      {lead.phone && (
        <div className="flex items-center gap-1 mt-2">
          <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate font-mono">
            {lead.phone}
          </span>
        </div>
      )}

      {/* Source badge + AI score */}
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center text-[10px] font-medium rounded-full px-1.5 py-0.5",
            sourceColorClass,
          )}
        >
          {sourceCfg?.icon && <span className="mr-0.5">{sourceCfg.icon}</span>}
          {sourceLabel}
        </span>
        {lead.aiScore > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
            ✦ {lead.aiScore}
          </span>
        )}
      </div>

      {/* Tags row */}
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center text-[10px] font-medium bg-muted text-muted-foreground rounded-full px-1.5 py-0.5"
            >
              {tag}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="inline-flex items-center text-[10px] font-bold bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">
              +{overflowCount}
            </span>
          )}
        </div>
      )}

      {/* Footer: date + deal value */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground">
          {new Date(Number(lead.createdAt) / 1_000_000).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
            },
          )}
        </span>
        {lead.campaign && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
            {lead.campaign}
          </span>
        )}
      </div>
    </button>
  );
};

// ===================== Drop Zone Overlay =====================

interface ColumnDropZoneProps {
  active: boolean;
}

const ColumnDropZone: React.FC<ColumnDropZoneProps> = ({ active }) => (
  <div
    className={cn(
      "min-h-12 rounded-lg border-2 border-dashed transition-colors duration-150",
      active ? "border-primary/60 bg-primary/5" : "border-border/50",
    )}
  >
    {active && (
      <p className="text-xs text-primary/70 text-center py-3 font-medium">
        Drop here
      </p>
    )}
  </div>
);

// ===================== Kanban Column =====================

interface PipelineColumnProps {
  status: LeadStatus;
  leads: Lead[];
  colIndex: number;
  isDragTarget: boolean;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragOver: (e: React.DragEvent, status: LeadStatus) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, status: LeadStatus) => void;
  onClickLead: (leadId: string) => void;
}

const PipelineColumn: React.FC<PipelineColumnProps> = ({
  status,
  leads,
  colIndex,
  isDragTarget,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onClickLead,
}) => {
  const config = LEAD_STATUS_CONFIG[status];

  // Column header variant based on stage semantics
  const isWon = status === "Won";
  const isLost = status === "Lost";
  const isNotInterested = status === "NotInterested";
  const isTerminal = isWon || isLost || isNotInterested;

  return (
    <div
      data-ocid={`pipeline.column.${colIndex}`}
      className={cn(
        "flex-shrink-0 w-[260px] flex flex-col rounded-xl transition-colors duration-150 snap-start",
        isWon
          ? "bg-emerald-50/60 dark:bg-emerald-950/20"
          : isLost
            ? "bg-red-50/60 dark:bg-red-950/20"
            : isNotInterested
              ? "bg-slate-100/60 dark:bg-slate-800/20"
              : "bg-muted/30 dark:bg-muted/10",
        isDragTarget && "ring-2 ring-primary/40",
      )}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Column header */}
      <div
        className="px-3 pt-3 pb-2 rounded-t-xl"
        style={{ borderTop: `3px solid ${config.color}` }}
      >
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-xs font-bold uppercase tracking-wide",
              isWon
                ? "text-emerald-700 dark:text-emerald-400"
                : isLost
                  ? "text-red-600 dark:text-red-400"
                  : isNotInterested
                    ? "text-slate-500 dark:text-slate-400"
                    : "text-foreground",
            )}
          >
            {config.label}
          </span>
          <span
            className={cn(
              "text-xs font-bold rounded-full px-2 py-0.5 min-w-[22px] text-center",
              isWon
                ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800/40 dark:text-emerald-300"
                : isLost
                  ? "bg-red-200 text-red-800 dark:bg-red-800/40 dark:text-red-300"
                  : isNotInterested
                    ? "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    : "bg-primary/15 text-primary",
            )}
          >
            {leads.length}
          </span>
        </div>
        {isTerminal && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {isWon ? "Converted" : isLost ? "Lost deals" : "Disqualified"}
          </p>
        )}
      </div>

      {/* Cards list */}
      <div className="flex-1 px-2 pb-3 overflow-y-auto max-h-[calc(100vh-220px)] space-y-2 scrollbar-thin">
        {leads.map((lead, i) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            index={i + 1}
            accentColor={config.color}
            onDragStart={onDragStart}
            onClick={() => onClickLead(lead.id)}
          />
        ))}
        <ColumnDropZone active={isDragTarget} />
      </div>
    </div>
  );
};

// ===================== Pipeline Page =====================

export const PipelinePage: React.FC<{ onOpenLead?: (id: string) => void }> = ({
  onOpenLead,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [dragLeadId, setDragLeadId] = useState<string | null>(null);
  const [dragTargetStatus, setDragTargetStatus] = useState<LeadStatus | null>(
    null,
  );
  const [optimisticMoves, setOptimisticMoves] = useState<
    Record<string, LeadStatus>
  >({});
  const boardRef = useRef<HTMLDivElement>(null);

  const filter = useMemo(
    () => ({
      searchQuery: searchQuery || undefined,
      source: sourceFilter !== "all" ? (sourceFilter as LeadSource) : undefined,
      assignedTo: userFilter !== "all" ? userFilter : undefined,
    }),
    [searchQuery, sourceFilter, userFilter],
  );

  const { data: rawLeads = [], isLoading } = useFilterLeads(filter);
  const { data: users = [] } = useListAllUsers();
  const { mutate: updateStatus } = useUpdateLeadStatus();

  // Apply optimistic moves on top of server data
  const leads = useMemo(
    () =>
      rawLeads.map((l) =>
        optimisticMoves[l.id] ? { ...l, status: optimisticMoves[l.id] } : l,
      ),
    [rawLeads, optimisticMoves],
  );

  const leadsByStatus = useMemo(
    () =>
      PIPELINE_STAGES.reduce(
        (acc, stage) => {
          acc[stage] = leads.filter((l) => l.status === stage);
          return acc;
        },
        {} as Record<LeadStatus, Lead[]>,
      ),
    [leads],
  );

  const hasFilters =
    searchQuery || sourceFilter !== "all" || userFilter !== "all";

  const handleDragStart = useCallback((e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
    e.dataTransfer.effectAllowed = "move";
    setDragLeadId(leadId);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, status: LeadStatus) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragTargetStatus(status);
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setDragTargetStatus(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, status: LeadStatus) => {
      e.preventDefault();
      const leadId = e.dataTransfer.getData("leadId");
      setDragLeadId(null);
      setDragTargetStatus(null);
      if (!leadId) return;

      const lead = leads.find((l) => l.id === leadId);
      if (!lead || lead.status === status) return;

      // Optimistic move
      setOptimisticMoves((prev) => ({ ...prev, [leadId]: status }));

      updateStatus(
        { id: leadId, status },
        {
          onSuccess: () => {
            setOptimisticMoves((prev) => {
              const next = { ...prev };
              delete next[leadId];
              return next;
            });
            toast.success(`Moved to ${LEAD_STATUS_CONFIG[status].label}`);
          },
          onError: (err) => {
            // Revert optimistic
            setOptimisticMoves((prev) => {
              const next = { ...prev };
              delete next[leadId];
              return next;
            });
            toast.error(`Failed to move lead: ${err.message}`);
          },
        },
      );
    },
    [leads, updateStatus],
  );

  const handleClickLead = useCallback(
    (leadId: string) => {
      if (onOpenLead) {
        onOpenLead(leadId);
      } else {
        toast.info("Lead detail view coming soon");
      }
    },
    [onOpenLead],
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSourceFilter("all");
    setUserFilter("all");
  };

  const totalLeads = leads.length;

  return (
    <div className="flex flex-col h-full" data-ocid="pipeline.page">
      {/* Page header */}
      <div className="flex flex-col gap-3 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Kanban className="w-6 h-6 text-primary" />
              Pipeline
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {isLoading
                ? "Loading…"
                : `${totalLeads} lead${totalLeads !== 1 ? "s" : ""} across ${PIPELINE_STAGES.length} stages`}
            </p>
          </div>

          {/* Stage summary pills */}
          <div className="hidden lg:flex items-center gap-1.5 flex-wrap justify-end">
            {PIPELINE_STAGES.map((stage) => (
              <Badge
                key={stage}
                variant="outline"
                className="text-[10px] px-2 py-0.5 gap-1"
                style={{
                  borderColor: LEAD_STATUS_CONFIG[stage].color,
                  color: LEAD_STATUS_CONFIG[stage].color,
                }}
              >
                {LEAD_STATUS_CONFIG[stage].label}
                <span className="font-bold">
                  {leadsByStatus[stage]?.length ?? 0}
                </span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div
          className="flex flex-wrap items-center gap-2"
          data-ocid="pipeline.filter_bar"
        >
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              data-ocid="pipeline.search_input"
              placeholder="Search leads…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger
              data-ocid="pipeline.source_filter.select"
              className="w-36 h-8 text-xs"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {Object.entries(LEAD_SOURCE_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.icon} {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger
              data-ocid="pipeline.user_filter.select"
              className="w-40 h-8 text-xs"
            >
              <SelectValue placeholder="Assigned to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              data-ocid="pipeline.clear_filters_button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Kanban board */}
      <div
        ref={boardRef}
        className="flex-1 overflow-x-auto pb-4 -mx-1 px-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {isLoading ? (
          <div className="flex gap-4 min-w-max">
            {PIPELINE_STAGES.map((stage) => (
              <div
                key={stage}
                className="flex-shrink-0 w-[260px] h-64 rounded-xl bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            className="flex gap-3 min-w-max"
            onDragEnd={() => {
              setDragLeadId(null);
              setDragTargetStatus(null);
            }}
          >
            {PIPELINE_STAGES.map((stage, i) => (
              <PipelineColumn
                key={stage}
                status={stage}
                leads={leadsByStatus[stage] ?? []}
                colIndex={i + 1}
                isDragTarget={dragTargetStatus === stage && dragLeadId !== null}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClickLead={handleClickLead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
