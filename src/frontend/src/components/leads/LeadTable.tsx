import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Edit2,
  Eye,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { LEAD_SOURCE_CONFIG, LEAD_STATUS_CONFIG } from "../../constants";
import type { Lead, LeadStatus, Role } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";
import { TagBadge } from "../shared/TagBadge";

type SortField = "name" | "status" | "createdAt";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

function formatDate(ts: bigint): string {
  const d = new Date(Number(ts) / 1_000_000);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface ColumnHeaderProps {
  label: string;
  field?: SortField;
  sortField: SortField | null;
  sortDir: SortDir;
  onSort?: (f: SortField) => void;
  className?: string;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  label,
  field,
  sortField,
  sortDir,
  onSort,
  className,
}) => {
  const isActive = sortField === field;
  return (
    <th
      className={cn(
        "text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3",
        className,
      )}
    >
      {field && onSort ? (
        <button
          type="button"
          onClick={() => onSort(field)}
          className={cn(
            "flex items-center gap-1 group hover:text-foreground transition-colors",
            isActive && "text-foreground",
          )}
        >
          {label}
          {isActive ? (
            sortDir === "asc" ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          )}
        </button>
      ) : (
        label
      )}
    </th>
  );
};

interface LeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  role: Role;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  isLoading,
  role,
  selectedIds,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const [sortField, setSortField] = useState<SortField | null>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);

  // Sort
  const sorted = [...leads].sort((a, b) => {
    if (!sortField) return 0;
    let cmp = 0;
    if (sortField === "name") cmp = a.name.localeCompare(b.name);
    else if (sortField === "status") {
      cmp = LEAD_STATUS_CONFIG[a.status].label.localeCompare(
        LEAD_STATUS_CONFIG[b.status].label,
      );
    } else if (sortField === "createdAt") {
      cmp = Number(a.createdAt) - Number(b.createdAt);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(page, totalPages);
  const paginated = sorted.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const isAllSelected =
    paginated.length > 0 && paginated.every((l) => selectedIds.has(l.id));

  const toggleAll = () => {
    if (isAllSelected) {
      const next = new Set(selectedIds);
      for (const l of paginated) next.delete(l.id);
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      for (const l of paginated) next.add(l.id);
      onSelectionChange(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const canDelete = role === "Admin" || role === "SalesManager";
  const canEdit = role !== "Telecaller";

  if (isLoading) {
    return (
      <div className="divide-y divide-border">
        {Array.from({ length: 8 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24 ml-auto hidden sm:block" />
            <Skeleton className="h-5 w-20 hidden md:block" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="px-4 py-3 w-10">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                  data-ocid="leads.select_all.checkbox"
                />
              </th>
              <ColumnHeader
                label="Name"
                field="name"
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <ColumnHeader
                label="Phone / Email"
                sortField={sortField}
                sortDir={sortDir}
                className="hidden sm:table-cell"
              />
              <ColumnHeader
                label="Course"
                sortField={sortField}
                sortDir={sortDir}
                className="hidden md:table-cell"
              />
              <ColumnHeader
                label="Status"
                field="status"
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <ColumnHeader
                label="Source"
                sortField={sortField}
                sortDir={sortDir}
                className="hidden lg:table-cell"
              />
              <ColumnHeader
                label="Assigned To"
                sortField={sortField}
                sortDir={sortDir}
                className="hidden xl:table-cell"
              />
              <ColumnHeader
                label="Created"
                field="createdAt"
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
                className="hidden xl:table-cell"
              />
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {paginated.map((lead, i) => {
              const rowIdx = (safeCurrentPage - 1) * PAGE_SIZE + i + 1;
              const selected = selectedIds.has(lead.id);
              return (
                <tr
                  key={lead.id}
                  data-ocid={`leads.item.${rowIdx}`}
                  className={cn(
                    "group transition-colors hover:bg-muted/30",
                    selected && "bg-primary/5",
                  )}
                >
                  <td className="px-4 py-3 w-10">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleOne(lead.id)}
                      aria-label={`Select ${lead.name}`}
                      data-ocid={`leads.checkbox.${rowIdx}`}
                    />
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3">
                    <div>
                      <button
                        type="button"
                        onClick={() => onView(lead)}
                        className="font-medium text-foreground hover:text-primary transition-colors text-left"
                        data-ocid={`leads.view_link.${rowIdx}`}
                      >
                        {lead.name}
                      </button>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {lead.tags.slice(0, 2).map((t) => (
                          <TagBadge key={t} tag={t} />
                        ))}
                        {lead.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{lead.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Phone/Email */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="space-y-0.5">
                      <p className="text-sm text-foreground">
                        {lead.phone || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {lead.email || "—"}
                      </p>
                    </div>
                  </td>

                  {/* Course */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground line-clamp-1 max-w-[120px]">
                      {lead.courseInterest || "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {LEAD_SOURCE_CONFIG[lead.source]?.icon}{" "}
                      {LEAD_SOURCE_CONFIG[lead.source]?.label ?? lead.source}
                    </span>
                  </td>

                  {/* Assigned To */}
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-xs text-foreground">
                      {lead.assignedToName || "—"}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatDate(lead.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onView(lead)}
                        aria-label={`View ${lead.name}`}
                        data-ocid={`leads.view_button.${rowIdx}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      {canEdit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEdit(lead)}
                          aria-label={`Edit ${lead.name}`}
                          data-ocid={`leads.edit_button.${rowIdx}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      {canDelete && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(lead)}
                          aria-label={`Delete ${lead.name}`}
                          data-ocid={`leads.delete_button.${rowIdx}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Page {safeCurrentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={safeCurrentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
              data-ocid="leads.pagination_prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p =
                totalPages <= 7
                  ? i + 1
                  : safeCurrentPage <= 4
                    ? i + 1
                    : safeCurrentPage >= totalPages - 3
                      ? totalPages - 6 + i
                      : safeCurrentPage - 3 + i;
              return (
                <Button
                  type="button"
                  key={p}
                  variant={safeCurrentPage === p ? "default" : "ghost"}
                  size="icon"
                  className="h-7 w-7 text-xs"
                  onClick={() => setPage(p)}
                  data-ocid={`leads.page.${p}`}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
              data-ocid="leads.pagination_next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="leads.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone and all associated tasks and notes will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteTarget(null)}
              data-ocid="leads.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  onDelete(deleteTarget);
                  setDeleteTarget(null);
                }
              }}
              data-ocid="leads.delete.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
