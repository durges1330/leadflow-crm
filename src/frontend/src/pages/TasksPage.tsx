import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  Video,
  X,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/shared/EmptyState";
import { PageCard } from "../components/shared/PageCard";
import { TASK_TYPE_CONFIG } from "../constants";
import {
  useCompleteFollowUpTask,
  useCreateFollowUpTask,
  useDeleteFollowUpTask,
  useGetMyTasks,
  useGetOverdueTasks,
  useListAllUsers,
  useListLeads,
} from "../hooks/useQueries";
import type { FollowUpTask, TaskType } from "../types";

// ─── helpers ───────────────────────────────────────────────────────────────

const msToDate = (ts: bigint) => new Date(Number(ts) / 1_000_000);
const now = () => new Date();

const isOverdue = (task: FollowUpTask) =>
  task.status !== "Completed" && msToDate(task.dueDate) < now();

const isToday = (d: Date) => {
  const t = now();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
};

const isTomorrow = (d: Date) => {
  const t = new Date(now());
  t.setDate(t.getDate() + 1);
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
};

const isThisWeek = (d: Date) => {
  const t = now();
  const end = new Date(t);
  end.setDate(t.getDate() + 7);
  return d >= t && d <= end;
};

const TASK_TYPES: TaskType[] = [
  "Call",
  "Email",
  "WhatsApp",
  "Meeting",
  "FollowUp",
  "Other",
];

const TASK_TYPE_ICONS: Record<
  TaskType,
  React.ComponentType<{ className?: string }>
> = {
  Call: Phone,
  Email: Mail,
  WhatsApp: MessageCircle,
  Meeting: Video,
  FollowUp: RefreshCw,
  Other: Target,
};

const TASK_TYPE_BADGE_STYLE: Record<TaskType, string> = {
  Call: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Email:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  WhatsApp:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  Meeting:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  FollowUp:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Other: "bg-muted text-muted-foreground",
};

const TASK_STATUS_STYLE: Record<string, string> = {
  Pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  Overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

// ─── components ────────────────────────────────────────────────────────────

const TaskTypeBadge: React.FC<{ type: TaskType }> = ({ type }) => {
  const Icon = TASK_TYPE_ICONS[type] ?? Target;
  const style = TASK_TYPE_BADGE_STYLE[type] ?? TASK_TYPE_BADGE_STYLE.Other;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        style,
      )}
    >
      <Icon className="w-3 h-3" />
      {TASK_TYPE_CONFIG[type]?.label ?? type}
    </span>
  );
};

const TaskStatusBadge: React.FC<{ task: FollowUpTask }> = ({ task }) => {
  const key = isOverdue(task)
    ? "Overdue"
    : task.status === "Completed"
      ? "Completed"
      : "Pending";
  const style = TASK_STATUS_STYLE[key];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        style,
      )}
    >
      {key}
    </span>
  );
};

const ActionLinks: React.FC<{ task: FollowUpTask }> = ({ task }) => {
  return (
    <div className="flex items-center gap-1">
      {task.taskType === "Call" && (
        <a
          href="tel:"
          title="Call"
          aria-label="Call"
          className="p-1.5 rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
        </a>
      )}
      {task.taskType === "Email" && (
        <a
          href="mailto:"
          title="Email"
          aria-label="Email"
          className="p-1.5 rounded-md text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
        </a>
      )}
      {task.taskType === "WhatsApp" && (
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noreferrer"
          title="WhatsApp"
          aria-label="WhatsApp"
          className="p-1.5 rounded-md text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
};

const TaskRow: React.FC<{
  task: FollowUpTask;
  index: number;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigateLead?: (leadId: string) => void;
  completing?: boolean;
}> = ({ task, index, onComplete, onDelete, onNavigateLead, completing }) => {
  const dueDate = msToDate(task.dueDate);
  const overdue = isOverdue(task);

  return (
    <div
      data-ocid={`tasks.item.${index}`}
      className={cn(
        "group flex items-start gap-3 p-3 md:p-4 rounded-lg border transition-colors",
        overdue
          ? "border-red-200 bg-red-50/60 dark:border-red-900/30 dark:bg-red-900/10"
          : task.status === "Completed"
            ? "border-border bg-muted/30 opacity-70"
            : "border-border bg-card hover:border-primary/30 hover:bg-primary/5",
      )}
    >
      {/* Checkbox quick complete */}
      <div className="flex-shrink-0 mt-0.5">
        <Checkbox
          checked={task.status === "Completed"}
          disabled={task.status === "Completed" || completing}
          onCheckedChange={() => onComplete(task.id)}
          data-ocid={`tasks.checkbox.${index}`}
          className="w-4 h-4"
          aria-label="Mark complete"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span
            className={cn(
              "text-sm font-semibold truncate",
              task.status === "Completed"
                ? "line-through text-muted-foreground"
                : "text-foreground",
            )}
          >
            {task.title}
          </span>
          <TaskTypeBadge type={task.taskType as TaskType} />
          <TaskStatusBadge task={task} />
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {task.leadName && (
            <button
              type="button"
              onClick={() => onNavigateLead?.(task.leadId)}
              className="text-xs text-primary hover:underline font-medium truncate"
              data-ocid={`tasks.lead_link.${index}`}
            >
              {task.leadName}
            </button>
          )}
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              overdue
                ? "text-red-600 dark:text-red-400 font-medium"
                : "text-muted-foreground",
            )}
          >
            <Clock className="w-3 h-3 flex-shrink-0" />
            {dueDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year:
                dueDate.getFullYear() !== now().getFullYear()
                  ? "numeric"
                  : undefined,
            })}
            {isToday(dueDate) && " — Today"}
            {isTomorrow(dueDate) && " — Tomorrow"}
            {overdue && " — Overdue"}
          </span>
          {task.assignedToName && (
            <span className="text-xs text-muted-foreground truncate">
              {task.assignedToName}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <ActionLinks task={task} />
        {task.status !== "Completed" && (
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
            data-ocid={`tasks.delete_button.${index}`}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

const TaskGroupSection: React.FC<{
  label: string;
  tasks: FollowUpTask[];
  startIndex: number;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  completingId?: string;
  defaultOpen?: boolean;
}> = ({
  label,
  tasks,
  startIndex,
  onComplete,
  onDelete,
  completingId,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  if (tasks.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        {open ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        {label}
        <span className="ml-1 text-muted-foreground/60 font-normal normal-case tracking-normal">
          ({tasks.length})
        </span>
      </button>
      {open && (
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <TaskRow
              key={task.id}
              task={task}
              index={startIndex + i + 1}
              onComplete={onComplete}
              onDelete={onDelete}
              completing={completingId === task.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Create Task Modal ─────────────────────────────────────────────────────

const CreateTaskModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const { data: leads = [] } = useListLeads();
  const { data: users = [] } = useListAllUsers();
  const { mutate: createTask, isPending } = useCreateFollowUpTask();

  const [form, setForm] = useState({
    title: "",
    description: "",
    taskType: "Call" as TaskType,
    leadId: "",
    dueDate: "",
    assignedTo: "",
  });

  const [leadSearch, setLeadSearch] = useState("");

  const filteredLeads = leads.filter((l) =>
    l.name.toLowerCase().includes(leadSearch.toLowerCase()),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) {
      toast.error("Title and due date are required");
      return;
    }
    const dueDateMs = BigInt(new Date(form.dueDate).getTime()) * 1_000_000n;
    createTask(
      {
        leadId: form.leadId,
        title: form.title,
        description: form.description,
        taskType: form.taskType,
        dueDate: dueDateMs,
        assignedTo: form.assignedTo,
      },
      {
        onSuccess: () => {
          toast.success("Task created successfully");
          onClose();
          setForm({
            title: "",
            description: "",
            taskType: "Call",
            leadId: "",
            dueDate: "",
            assignedTo: "",
          });
          setLeadSearch("");
        },
        onError: (e) => toast.error(`Failed: ${e.message}`),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg" data-ocid="tasks.create_task.dialog">
        <DialogHeader>
          <DialogTitle>Create Follow-Up Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title *</Label>
            <Input
              id="task-title"
              placeholder="e.g. Follow up re: MBA program"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              data-ocid="tasks.create_task.title_input"
              required
            />
          </div>

          {/* Task Type */}
          <div className="space-y-1.5">
            <Label>Task Type</Label>
            <Select
              value={form.taskType}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, taskType: v as TaskType }))
              }
            >
              <SelectTrigger data-ocid="tasks.create_task.type_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-2">
                      {TASK_TYPE_CONFIG[t]?.label ?? t}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lead Search */}
          <div className="space-y-1.5">
            <Label htmlFor="task-lead">Linked Lead</Label>
            <div className="relative">
              <Input
                id="task-lead"
                placeholder="Search lead by name…"
                value={leadSearch}
                onChange={(e) => {
                  setLeadSearch(e.target.value);
                  if (!e.target.value) setForm((f) => ({ ...f, leadId: "" }));
                }}
                data-ocid="tasks.create_task.lead_search_input"
              />
              {leadSearch && filteredLeads.length > 0 && (
                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-lg shadow-md max-h-40 overflow-y-auto">
                  {filteredLeads.slice(0, 8).map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => {
                        setForm((f) => ({ ...f, leadId: l.id }));
                        setLeadSearch(l.name);
                      }}
                    >
                      <span className="font-medium">{l.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        {l.courseInterest}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="task-due">Due Date *</Label>
            <Input
              id="task-due"
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, dueDate: e.target.value }))
              }
              data-ocid="tasks.create_task.due_date_input"
              required
            />
          </div>

          {/* Assigned To */}
          <div className="space-y-1.5">
            <Label>Assign To</Label>
            <Select
              value={form.assignedTo}
              onValueChange={(v) => setForm((f) => ({ ...f, assignedTo: v }))}
            >
              <SelectTrigger data-ocid="tasks.create_task.assigned_select">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Notes</Label>
            <Input
              id="task-desc"
              placeholder="Optional notes…"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              data-ocid="tasks.create_task.description_input"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="tasks.create_task.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="tasks.create_task.submit_button"
            >
              {isPending ? "Creating…" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Tab & filter definitions ──────────────────────────────────────────────

type TabKey = "all" | "mine" | "overdue" | "today" | "week";
type SortKey = "dueDate" | "lead" | "type";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All Tasks" },
  { key: "mine", label: "My Tasks" },
  { key: "overdue", label: "Overdue" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
];

// ─── Main page ─────────────────────────────────────────────────────────────

export const TasksPage: React.FC = () => {
  const { data: myTasks = [], isLoading } = useGetMyTasks();
  const { data: overdueTasks = [] } = useGetOverdueTasks();
  const {
    mutate: completeTask,
    isPending: isCompleting,
    variables: completingId,
  } = useCompleteFollowUpTask();
  const { mutate: deleteTask } = useDeleteFollowUpTask();

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [typeFilter, setTypeFilter] = useState<TaskType | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortAsc, setSortAsc] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [overdueFilterActive, setOverdueFilterActive] = useState(false);

  const overdueSet = useMemo(
    () => new Set(overdueTasks.map((t) => t.id)),
    [overdueTasks],
  );

  // Tab filter
  const tabFiltered = useMemo(() => {
    let base = myTasks;
    if (activeTab === "overdue" || overdueFilterActive) {
      base = base.filter((t) => overdueSet.has(t.id));
    } else if (activeTab === "today") {
      base = base.filter((t) => isToday(msToDate(t.dueDate)));
    } else if (activeTab === "week") {
      base = base.filter((t) => isThisWeek(msToDate(t.dueDate)));
    }
    // mine = all since we use getMyTasks already
    return base;
  }, [myTasks, activeTab, overdueSet, overdueFilterActive]);

  // Type filter
  const typeFiltered = useMemo(() => {
    if (typeFilter === "All") return tabFiltered;
    return tabFiltered.filter((t) => t.taskType === typeFilter);
  }, [tabFiltered, typeFilter]);

  // Sort
  const sorted = useMemo(() => {
    const copy = [...typeFiltered];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "dueDate") cmp = Number(a.dueDate - b.dueDate);
      else if (sortKey === "lead") cmp = a.leadName.localeCompare(b.leadName);
      else if (sortKey === "type") cmp = a.taskType.localeCompare(b.taskType);
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [typeFiltered, sortKey, sortAsc]);

  // Group by due date
  const grouped = useMemo(() => {
    const todayList: FollowUpTask[] = [];
    const tomorrowList: FollowUpTask[] = [];
    const weekList: FollowUpTask[] = [];
    const laterList: FollowUpTask[] = [];
    const overdueList: FollowUpTask[] = [];
    const completedList: FollowUpTask[] = [];

    for (const t of sorted) {
      if (t.status === "Completed") {
        completedList.push(t);
        continue;
      }
      const d = msToDate(t.dueDate);
      if (isOverdue(t)) {
        overdueList.push(t);
        continue;
      }
      if (isToday(d)) {
        todayList.push(t);
        continue;
      }
      if (isTomorrow(d)) {
        tomorrowList.push(t);
        continue;
      }
      if (isThisWeek(d)) {
        weekList.push(t);
        continue;
      }
      laterList.push(t);
    }
    return {
      overdueList,
      todayList,
      tomorrowList,
      weekList,
      laterList,
      completedList,
    };
  }, [sorted]);

  const handleComplete = (id: string) =>
    completeTask(id, {
      onSuccess: () => toast.success("Task marked complete"),
      onError: (e) => toast.error(`Failed: ${e.message}`),
    });

  const handleDelete = (id: string) =>
    deleteTask(id, {
      onSuccess: () => toast.success("Task deleted"),
      onError: (e) => toast.error(`Failed: ${e.message}`),
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const pendingCount = myTasks.filter((t) => t.status !== "Completed").length;

  return (
    <div className="space-y-5" data-ocid="tasks.page">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pendingCount} pending · {overdueTasks.length} overdue
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowCreate(true)}
          data-ocid="tasks.create_task.open_modal_button"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* ── Overdue alert banner ── */}
      {overdueTasks.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setOverdueFilterActive((v) => !v);
            setActiveTab("overdue");
          }}
          data-ocid="tasks.overdue_alert_banner"
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
            overdueFilterActive
              ? "bg-red-600 border-red-600 text-white"
              : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
          )}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold text-sm">
            {overdueTasks.length} overdue task
            {overdueTasks.length !== 1 ? "s" : ""} need your attention
          </span>
          <span className="text-sm opacity-70 hidden sm:inline">
            — Click to filter
          </span>
          {overdueFilterActive && (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium">
              <X className="w-3.5 h-3.5" /> Clear filter
            </span>
          )}
        </button>
      )}

      {/* ── Tabs + filters toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              data-ocid={`tasks.filter.${tab.key}.tab`}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key !== "overdue") setOverdueFilterActive(false);
                if (tab.key === "overdue") setOverdueFilterActive(true);
              }}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                activeTab === tab.key
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
                tab.key === "overdue" &&
                  overdueTasks.length > 0 &&
                  activeTab !== "overdue"
                  ? "text-red-600 dark:text-red-400"
                  : "",
              )}
            >
              {tab.label}
              {tab.key === "overdue" && overdueTasks.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                  {overdueTasks.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Type filter */}
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as TaskType | "All")}
          >
            <SelectTrigger
              className="h-8 text-xs w-[130px]"
              data-ocid="tasks.type_filter.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              {TASK_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {TASK_TYPE_CONFIG[t]?.label ?? t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpDown className="w-3.5 h-3.5" />
            {(["dueDate", "lead", "type"] as SortKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => toggleSort(k)}
                data-ocid={`tasks.sort.${k}.toggle`}
                className={cn(
                  "px-2 py-1 rounded text-xs transition-colors",
                  sortKey === k
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted",
                )}
              >
                {k === "dueDate" ? "Due Date" : k === "lead" ? "Lead" : "Type"}
                {sortKey === k && (
                  <span className="ml-0.5">{sortAsc ? " ↑" : " ↓"}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Task list ── */}
      {isLoading ? (
        <PageCard padding="md">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <Skeleton className="w-4 h-4 rounded mt-0.5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </PageCard>
      ) : sorted.length === 0 ? (
        <PageCard>
          <EmptyState
            icon={Calendar}
            title="No tasks found"
            description="Create your first follow-up task to stay on top of your leads."
            action={{
              label: "Create Task",
              onClick: () => setShowCreate(true),
            }}
            data-ocid="tasks.empty_state"
          />
        </PageCard>
      ) : (
        <PageCard padding="md">
          <div className="space-y-5">
            <TaskGroupSection
              label="Overdue"
              tasks={grouped.overdueList}
              startIndex={0}
              onComplete={handleComplete}
              onDelete={handleDelete}
              completingId={isCompleting ? (completingId as string) : undefined}
            />
            <TaskGroupSection
              label="Today"
              tasks={grouped.todayList}
              startIndex={grouped.overdueList.length}
              onComplete={handleComplete}
              onDelete={handleDelete}
              completingId={isCompleting ? (completingId as string) : undefined}
            />
            <TaskGroupSection
              label="Tomorrow"
              tasks={grouped.tomorrowList}
              startIndex={grouped.overdueList.length + grouped.todayList.length}
              onComplete={handleComplete}
              onDelete={handleDelete}
              completingId={isCompleting ? (completingId as string) : undefined}
            />
            <TaskGroupSection
              label="This Week"
              tasks={grouped.weekList}
              startIndex={
                grouped.overdueList.length +
                grouped.todayList.length +
                grouped.tomorrowList.length
              }
              onComplete={handleComplete}
              onDelete={handleDelete}
              completingId={isCompleting ? (completingId as string) : undefined}
            />
            <TaskGroupSection
              label="Later"
              tasks={grouped.laterList}
              startIndex={
                grouped.overdueList.length +
                grouped.todayList.length +
                grouped.tomorrowList.length +
                grouped.weekList.length
              }
              onComplete={handleComplete}
              onDelete={handleDelete}
              completingId={isCompleting ? (completingId as string) : undefined}
            />
            <TaskGroupSection
              label="Completed"
              tasks={grouped.completedList}
              startIndex={
                grouped.overdueList.length +
                grouped.todayList.length +
                grouped.tomorrowList.length +
                grouped.weekList.length +
                grouped.laterList.length
              }
              onComplete={handleComplete}
              onDelete={handleDelete}
              defaultOpen={false}
            />
          </div>
        </PageCard>
      )}

      {/* Stats footer bar */}
      {!isLoading && myTasks.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {pendingCount} Pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {overdueTasks.length} Overdue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {myTasks.filter((t) => t.status === "Completed").length} Completed
          </span>
          <span className="ml-auto">
            {sorted.length} of {myTasks.length} tasks shown
          </span>
        </div>
      )}

      <CreateTaskModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
};
