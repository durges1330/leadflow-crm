import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, Plus, RefreshCw, Upload, Users } from "lucide-react";
import type React from "react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BulkActionBar } from "../components/leads/BulkActionBar";
import { LeadFilters } from "../components/leads/LeadFilters";
import { LeadFormModal } from "../components/leads/LeadFormModal";
import { LeadTable } from "../components/leads/LeadTable";
import { EmptyState } from "../components/shared/EmptyState";
import { SearchBar } from "../components/shared/SearchBar";
import {
  useDeleteLead,
  useFilterLeads,
  useGetMyProfile,
  useImportLeads,
  useListAllUsers,
  useUpdateLeadStatus,
} from "../hooks/useQueries";
import type { Lead, LeadFilter, LeadStatus, UserProfile } from "../types";

// Count active filter fields (excluding searchQuery which is shown inline)
function countActiveFilters(f: LeadFilter): number {
  let n = 0;
  if (f.status) n++;
  if (f.source) n++;
  if (f.assignedTo) n++;
  if (f.campaign) n++;
  if (f.dateFrom) n++;
  if (f.dateTo) n++;
  if (f.tags?.length) n++;
  return n;
}

export const LeadsPage: React.FC<{ onOpenLead?: (id: string) => void }> = ({
  onOpenLead,
}) => {
  const [filter, setFilter] = useState<LeadFilter>({});
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  // Merge search into filter for backend query
  const activeFilter = useMemo<LeadFilter>(
    () => (search ? { ...filter, searchQuery: search } : filter),
    [filter, search],
  );

  const {
    data: leads = [],
    isLoading,
    refetch,
    isFetching,
  } = useFilterLeads(activeFilter);
  const { data: users = [] } = useListAllUsers();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateLeadStatus();
  const { mutate: deleteLead } = useDeleteLead();
  const { mutate: importLeads, isPending: isImporting } = useImportLeads();

  // Role guard: expose full role to LeadTable.
  // Without a passed profile prop, default to Admin so all actions are visible.
  const { data: myProfile } = useGetMyProfile();

  const activeFilterCount = countActiveFilters(filter);
  const showingCount = leads.length;

  // Bulk status change
  const handleBulkStatusChange = (status: LeadStatus) => {
    const ids = Array.from(selectedIds);
    let completed = 0;
    let failed = 0;
    for (const id of ids) {
      updateStatus(
        { id, status },
        {
          onSuccess: () => {
            completed++;
            if (completed + failed === ids.length) {
              toast.success(
                `Updated ${completed} lead${completed !== 1 ? "s" : ""} to ${status.replace(/([A-Z])/g, " $1").trim()}`,
              );
              setSelectedIds(new Set());
            }
          },
          onError: () => {
            failed++;
          },
        },
      );
    }
  };

  const handleDelete = (lead: Lead) => {
    deleteLead(lead.id, {
      onSuccess: () => {
        toast.success(`"${lead.name}" deleted`);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(lead.id);
          return next;
        });
      },
      onError: (err) => toast.error(`Delete failed: ${err.message}`),
    });
  };

  const handleExport = () => {
    if (!leads.length) {
      toast.info("No leads to export");
      return;
    }
    const header = [
      "Name",
      "Phone",
      "Email",
      "Course",
      "Source",
      "Campaign",
      "Status",
      "Assigned To",
      "Tags",
      "AI Score",
      "Created",
    ].join(",");
    const rows = leads.map((l) =>
      [
        `"${l.name}"`,
        l.phone,
        l.email,
        `"${l.courseInterest}"`,
        l.source,
        `"${l.campaign}"`,
        l.status,
        `"${l.assignedToName}"`,
        `"${l.tags.join("; ")}"`,
        l.aiScore,
        new Date(Number(l.createdAt) / 1_000_000).toISOString().slice(0, 10),
      ].join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${leads.length} leads`);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split("\n").filter(Boolean);
      const parsed: Lead[] = [];
      for (const line of lines.slice(1)) {
        const cols = line.split(",");
        if (cols.length < 3) continue;
        parsed.push({
          id: "",
          name: cols[0]?.replace(/"/g, "").trim() ?? "",
          phone: cols[1]?.trim() ?? "",
          email: cols[2]?.trim() ?? "",
          courseInterest: cols[3]?.replace(/"/g, "").trim() ?? "",
          source: "CsvUpload",
          campaign: cols[5]?.replace(/"/g, "").trim() ?? "",
          status: "NewLead",
          assignedTo: "",
          assignedToName: "",
          notes: "",
          tags: [],
          dealValue: BigInt(0),
          aiScore: 0,
          aiSentiment: "",
          aiNextAction: "",
          createdAt: BigInt(Date.now() * 1_000_000),
          updatedAt: BigInt(Date.now() * 1_000_000),
        });
      }
      if (!parsed.length) {
        toast.error("No valid leads found in CSV");
        return;
      }
      importLeads(parsed, {
        onSuccess: (result) =>
          toast.success(`Imported ${(result as Lead[]).length} leads`),
        onError: (err) => toast.error(`Import failed: ${err.message}`),
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleView = (lead: Lead) => {
    if (onOpenLead) onOpenLead(lead.id);
    else toast.info(`Opening ${lead.name}'s profile…`);
  };

  const hasSelection = selectedIds.size > 0;

  return (
    <div className="space-y-4" data-ocid="leads.page">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Leads
          </h1>
          <p
            className={cn(
              "text-sm mt-0.5 transition-colors",
              isFetching ? "text-muted-foreground/50" : "text-muted-foreground",
            )}
            data-ocid="leads.count_label"
          >
            Showing {showingCount}{" "}
            {activeFilterCount > 0 || search
              ? `filtered result${showingCount !== 1 ? "s" : ""}`
              : `total lead${showingCount !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => refetch()}
            aria-label="Refresh leads"
            data-ocid="leads.refresh_button"
            disabled={isFetching}
          >
            <RefreshCw
              className={cn("w-4 h-4", isFetching && "animate-spin")}
            />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 text-sm"
            onClick={() => importRef.current?.click()}
            disabled={isImporting}
            data-ocid="leads.import_button"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            {isImporting ? "Importing..." : "Import"}
          </Button>
          <input
            ref={importRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportFile}
            aria-label="Import CSV file"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 text-sm"
            onClick={handleExport}
            data-ocid="leads.export_button"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>

          <Button
            type="button"
            size="sm"
            className="h-9 text-sm"
            onClick={() => setShowAddModal(true)}
            data-ocid="leads.add_button"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setSelectedIds(new Set());
          }}
          placeholder="Search by name, phone, or email…"
          data-ocid="leads.search_input"
        />
      </div>

      {/* Collapsible filters */}
      <LeadFilters
        filter={filter}
        onChange={(f) => {
          setFilter(f);
          setSelectedIds(new Set());
        }}
        users={users}
        activeFilterCount={activeFilterCount}
      />

      {/* Bulk action bar */}
      {hasSelection && (
        <BulkActionBar
          count={selectedIds.size}
          onClearSelection={() => setSelectedIds(new Set())}
          onBulkStatusChange={handleBulkStatusChange}
          isPending={isUpdatingStatus}
        />
      )}

      {/* Data table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {!isLoading && leads.length === 0 ? (
          <EmptyState
            icon={Users}
            title={
              activeFilterCount > 0 || search
                ? "No leads match your filters"
                : "No leads yet"
            }
            description={
              activeFilterCount > 0 || search
                ? "Try adjusting your search or clearing the filters."
                : "Add your first lead to start tracking your pipeline."
            }
            action={
              !activeFilterCount && !search
                ? { label: "Add Lead", onClick: () => setShowAddModal(true) }
                : undefined
            }
            data-ocid="leads.empty_state"
          />
        ) : (
          <LeadTable
            leads={leads}
            isLoading={isLoading}
            role={(myProfile?.role ?? "Admin") as UserProfile["role"]}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onView={handleView}
            onEdit={(lead) => setEditLead(lead)}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Add / Edit form modal */}
      <LeadFormModal
        open={showAddModal || !!editLead}
        onOpenChange={(v) => {
          if (!v) {
            setShowAddModal(false);
            setEditLead(null);
          }
        }}
        editLead={editLead}
        users={users}
      />
    </div>
  );
};
