import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ActivityIcon,
  ArrowLeftIcon,
  BotIcon,
  CalendarIcon,
  ChevronDownIcon,
  ClipboardListIcon,
  FileIcon,
  FileTextIcon,
  MailIcon,
  MessageSquareIcon,
  PhoneIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
  ZapIcon,
} from "lucide-react";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "../components/shared/StatusBadge";
import { TagBadge } from "../components/shared/TagBadge";
import {
  LEAD_SOURCE_CONFIG,
  LEAD_STATUSES,
  LEAD_STATUS_CONFIG,
  TASK_TYPE_CONFIG,
} from "../constants";
import {
  useAddDocument,
  useAssignLead,
  useCompleteFollowUpTask,
  useCreateFollowUpTask,
  useDeleteDocument,
  useDeleteFollowUpTask,
  useDeleteLead,
  useGetDocumentsByLead,
  useGetLead,
  useGetTasksByLead,
  useLeadTimeline,
  useListAllUsers,
  useUpdateLeadNotes,
  useUpdateLeadStatus,
  useUpdateLeadTags,
} from "../hooks/useQueries";
import type {
  ActivityEntry,
  Document,
  FollowUpTask,
  LeadStatus,
  TaskType,
} from "../types";

interface LeadDetailPageProps {
  leadId: string;
  onBack: () => void;
}

export const LeadDetailPage: React.FC<LeadDetailPageProps> = ({
  leadId,
  onBack,
}) => {
  const { data: lead, isLoading } = useGetLead(leadId);
  const { data: tasks = [] } = useGetTasksByLead(leadId);
  const { data: rawTimeline = [] } = useLeadTimeline(leadId);
  const { data: rawDocuments = [] } = useGetDocumentsByLead(leadId);
  const { data: allUsers = [] } = useListAllUsers();

  const timeline = rawTimeline as ActivityEntry[];
  const documents = rawDocuments as Document[];

  const updateStatus = useUpdateLeadStatus();
  const updateNotes = useUpdateLeadNotes();
  const updateTags = useUpdateLeadTags();
  const assignLead = useAssignLead();
  const deleteLead = useDeleteLead();
  const completeTask = useCompleteFollowUpTask();
  const deleteTask = useDeleteFollowUpTask();
  const addDocument = useAddDocument();
  const deleteDoc = useDeleteDocument();
  const createTask = useCreateFollowUpTask();

  // UI state
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiModalContent, setAiModalContent] = useState("");
  const [aiModalTitle, setAiModalTitle] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("Call");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskDesc, setTaskDesc] = useState("");

  const handleStatusChange = (status: LeadStatus) => {
    updateStatus.mutate(
      { id: leadId, status },
      { onSuccess: () => toast.success("Status updated") },
    );
  };

  const handleNotesSave = () => {
    updateNotes.mutate(
      { id: leadId, notes: notesValue },
      {
        onSuccess: () => {
          setEditingNotes(false);
          toast.success("Notes saved");
        },
      },
    );
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim() && lead) {
      const tags = [...lead.tags, newTag.trim()];
      updateTags.mutate(
        { id: leadId, tags },
        { onSuccess: () => setNewTag("") },
      );
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (!lead) return;
    updateTags.mutate({ id: leadId, tags: lead.tags.filter((t) => t !== tag) });
  };

  const handleAssign = (userId: string) => {
    assignLead.mutate(
      { id: leadId, userId },
      { onSuccess: () => toast.success("Lead assigned") },
    );
  };

  const handleDelete = () => {
    deleteLead.mutate(leadId, {
      onSuccess: () => {
        toast.success("Lead deleted");
        onBack();
      },
    });
  };

  const handleCreateTask = () => {
    if (!taskTitle || !taskDueDate) return;
    createTask.mutate(
      {
        leadId,
        title: taskTitle,
        description: taskDesc,
        taskType,
        dueDate: BigInt(new Date(taskDueDate).getTime()) * BigInt(1_000_000),
        assignedTo: lead?.assignedTo ?? "",
      },
      {
        onSuccess: () => {
          setShowTaskModal(false);
          setTaskTitle("");
          setTaskDesc("");
          setTaskDueDate("");
          toast.success("Task created");
        },
      },
    );
  };

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      // In a real app, upload to object storage and get URL
      const mockUrl = `https://storage.example.com/${leadId}/${file.name}`;
      addDocument.mutate(
        { leadId, name: file.name, fileType: file.type, url: mockUrl },
        { onSuccess: () => toast.success("Document uploaded") },
      );
    },
    [leadId, addDocument],
  );

  const simulateAi = async (type: "followup" | "summarize") => {
    setAiLoading(true);
    if (type === "followup") {
      setAiModalTitle("Generated Follow-up Message");
      await new Promise((r) => setTimeout(r, 1200));
      setAiModalContent(
        `Hi ${lead?.name?.split(" ")[0] ?? "there"},\n\nI hope you\'re doing well! I wanted to follow up regarding your interest in ${lead?.courseInterest ?? "our programs"}.\n\nWe have some exciting updates that I think would be very relevant to your goals. Would you be available for a quick 15-minute call this week to discuss how we can best support your learning journey?\n\nLooking forward to hearing from you!\n\nBest regards`,
      );
    } else {
      setAiModalTitle("AI Notes Summary");
      await new Promise((r) => setTimeout(r, 1200));
      setAiModalContent(
        `**Lead Summary for ${lead?.name ?? "Lead"}**\n\nThis lead is showing ${lead?.aiSentiment ?? "positive"} sentiment with a conversion likelihood score of ${lead?.aiScore ?? 72}/100. The primary interest is in ${lead?.courseInterest ?? "our courses"}. Based on the notes and activity history, the recommended next action is: ${lead?.aiNextAction ?? "Schedule a discovery call to understand their timeline and budget constraints."} The lead has been in the pipeline for a meaningful period and would benefit from personalized outreach.`,
      );
    }
    setAiLoading(false);
    setShowAiModal(true);
  };

  const formatDate = (ts: bigint | null | undefined) => {
    if (!ts) return "—";
    return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (ts: bigint) => {
    return new Date(Number(ts) / 1_000_000).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <LeadDetailSkeleton />;
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FileIcon className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground text-lg">Lead not found</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Leads
        </Button>
      </div>
    );
  }

  const scoreColor =
    lead.aiScore >= 70
      ? "text-emerald-600"
      : lead.aiScore >= 40
        ? "text-amber-600"
        : "text-red-600";

  const scoreBarClass =
    lead.aiScore >= 70
      ? "[&>div]:bg-emerald-500"
      : lead.aiScore >= 40
        ? "[&>div]:bg-amber-500"
        : "[&>div]:bg-red-500";

  return (
    <div className="flex flex-col gap-0 min-h-full">
      {/* Page Header */}
      <div className="bg-card border-b px-6 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-foreground transition-colors"
            data-ocid="lead.back_button"
          >
            Leads
          </button>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {lead.name}
          </span>
        </div>

        {/* Title row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                {lead.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {/* Status dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1 group"
                      data-ocid="lead.status_dropdown"
                    >
                      <StatusBadge status={lead.status} size="md" />
                      <ChevronDownIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    {LEAD_STATUSES.map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className="flex items-center gap-2"
                        data-ocid={`lead.status_option.${s.toLowerCase()}`}
                      >
                        <StatusBadge status={s} size="sm" />
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {lead.campaign && (
                  <Badge variant="outline" className="text-xs">
                    {lead.campaign}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              asChild
              data-ocid="lead.call_button"
            >
              <a href={`tel:${lead.phone}`}>
                <PhoneIcon className="h-3.5 w-3.5 mr-1.5" />
                Call
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              data-ocid="lead.email_button"
            >
              <a href={`mailto:${lead.email}`}>
                <MailIcon className="h-3.5 w-3.5 mr-1.5" />
                Email
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              data-ocid="lead.whatsapp_button"
            >
              <a
                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageSquareIcon className="h-3.5 w-3.5 mr-1.5" />
                WhatsApp
              </a>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              data-ocid="lead.delete_button"
            >
              <TrashIcon className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Body: Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6 p-6 flex-1 min-h-0">
        {/* Main content - 2/3 */}
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4 bg-muted/60" data-ocid="lead.tabs">
              <TabsTrigger value="overview" data-ocid="lead.tab.overview">
                <UserIcon className="h-3.5 w-3.5 mr-1.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="timeline" data-ocid="lead.tab.timeline">
                <ActivityIcon className="h-3.5 w-3.5 mr-1.5" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="tasks" data-ocid="lead.tab.tasks">
                <ClipboardListIcon className="h-3.5 w-3.5 mr-1.5" />
                Tasks
                {tasks.length > 0 && (
                  <span className="ml-1.5 bg-primary/10 text-primary text-xs rounded-full px-1.5 py-0.5 font-medium">
                    {tasks.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="documents" data-ocid="lead.tab.documents">
                <FileTextIcon className="h-3.5 w-3.5 mr-1.5" />
                Documents
                {documents.length > 0 && (
                  <span className="ml-1.5 bg-primary/10 text-primary text-xs rounded-full px-1.5 py-0.5 font-medium">
                    {documents.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0">
              <OverviewTab
                lead={lead}
                editingNotes={editingNotes}
                notesValue={notesValue}
                newTag={newTag}
                onStartEditNotes={() => {
                  setNotesValue(lead.notes);
                  setEditingNotes(true);
                }}
                onNotesSave={handleNotesSave}
                onNotesCancel={() => setEditingNotes(false)}
                onNotesChange={setNotesValue}
                onNewTagChange={setNewTag}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                formatDate={formatDate}
              />
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-0">
              <TimelineTab
                timeline={timeline}
                formatDateTime={formatDateTime}
              />
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="mt-0">
              <TasksTab
                tasks={tasks as FollowUpTask[]}
                onCreateTask={() => setShowTaskModal(true)}
                onComplete={(id) =>
                  completeTask.mutate(id, {
                    onSuccess: () => toast.success("Task completed"),
                  })
                }
                onDelete={(id) =>
                  deleteTask.mutate(id, {
                    onSuccess: () => toast.success("Task deleted"),
                  })
                }
                formatDate={formatDate}
              />
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-0">
              <DocumentsTab
                documents={documents as Document[]}
                dragOver={dragOver}
                fileInputRef={fileInputRef}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFileUpload(e.dataTransfer.files);
                }}
                onFileChange={(e) => handleFileUpload(e.target.files)}
                onDelete={(docId) =>
                  deleteDoc.mutate(
                    { docId, leadId },
                    { onSuccess: () => toast.success("Document deleted") },
                  )
                }
                formatDate={formatDate}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - 1/3 */}
        <div className="lg:w-80 xl:w-96 flex flex-col gap-4 shrink-0">
          {/* AI Assistant Panel */}
          <AiPanel
            lead={lead}
            aiLoading={aiLoading}
            onGenerateFollowup={() => simulateAi("followup")}
            onSummarize={() => simulateAi("summarize")}
            scoreColor={scoreColor}
            scoreBarClass={scoreBarClass}
          />

          {/* Assign Lead */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                Assigned To
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Select value={lead.assignedTo} onValueChange={handleAssign}>
                <SelectTrigger
                  className="w-full"
                  data-ocid="lead.assign_select"
                >
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {lead.assignedToName && (
                <p className="text-xs text-muted-foreground mt-2">
                  Currently: {lead.assignedToName}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Lead Meta */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold">Details</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <MetaRow
                label="Source"
                value={
                  <span className="flex items-center gap-1">
                    <span>{LEAD_SOURCE_CONFIG[lead.source]?.icon}</span>
                    {LEAD_SOURCE_CONFIG[lead.source]?.label ?? lead.source}
                  </span>
                }
              />
              <MetaRow label="Campaign" value={lead.campaign || "—"} />
              <MetaRow label="Created" value={formatDate(lead.createdAt)} />
              <MetaRow label="Updated" value={formatDate(lead.updatedAt)} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent data-ocid="lead.delete_dialog">
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{lead.name}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              data-ocid="lead.delete_cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLead.isPending}
              data-ocid="lead.delete_confirm_button"
            >
              {deleteLead.isPending ? "Deleting..." : "Delete Lead"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Task Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent data-ocid="lead.create_task_dialog">
          <DialogHeader>
            <DialogTitle>Create Follow-Up Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                placeholder="Task title..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                data-ocid="lead.task_title_input"
              />
            </div>
            <div>
              <Label htmlFor="task-type">Type</Label>
              <Select
                value={taskType}
                onValueChange={(v) => setTaskType(v as TaskType)}
              >
                <SelectTrigger id="task-type" data-ocid="lead.task_type_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TASK_TYPE_CONFIG) as TaskType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TASK_TYPE_CONFIG[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="task-due">Due Date</Label>
              <Input
                id="task-due"
                type="datetime-local"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                data-ocid="lead.task_due_input"
              />
            </div>
            <div>
              <Label htmlFor="task-desc">Description (optional)</Label>
              <Textarea
                id="task-desc"
                placeholder="Add details..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                rows={3}
                data-ocid="lead.task_desc_input"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowTaskModal(false)}
              data-ocid="lead.task_cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!taskTitle || !taskDueDate || createTask.isPending}
              data-ocid="lead.task_submit_button"
            >
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Modal */}
      <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
        <DialogContent className="max-w-lg" data-ocid="lead.ai_modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-primary" />
              {aiModalTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <Textarea
              value={aiModalContent}
              onChange={(e) => setAiModalContent(e.target.value)}
              rows={10}
              className="font-mono text-sm resize-none"
              data-ocid="lead.ai_message_textarea"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(aiModalContent);
                toast.success("Copied to clipboard");
              }}
              data-ocid="lead.ai_copy_button"
            >
              Copy
            </Button>
            <Button
              onClick={() => setShowAiModal(false)}
              data-ocid="lead.ai_close_button"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ==================== Sub-components ====================

const MetaRow: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm gap-2">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className="text-foreground font-medium text-right">{value}</span>
  </div>
);

// ---- Overview Tab ----
const OverviewTab: React.FC<{
  lead: import("../types").Lead;
  editingNotes: boolean;
  notesValue: string;
  newTag: string;
  onStartEditNotes: () => void;
  onNotesSave: () => void;
  onNotesCancel: () => void;
  onNotesChange: (v: string) => void;
  onNewTagChange: (v: string) => void;
  onAddTag: (e: React.KeyboardEvent) => void;
  onRemoveTag: (tag: string) => void;
  formatDate: (ts: bigint | null | undefined) => string;
}> = ({
  lead,
  editingNotes,
  notesValue,
  newTag,
  onStartEditNotes,
  onNotesSave,
  onNotesCancel,
  onNotesChange,
  onNewTagChange,
  onAddTag,
  onRemoveTag,
  formatDate,
}) => (
  <div className="space-y-4">
    {/* Contact Info */}
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <InfoField label="Full Name" value={lead.name} />
          <InfoField
            label="Phone"
            value={
              <a
                href={`tel:${lead.phone}`}
                className="text-primary hover:underline"
              >
                {lead.phone}
              </a>
            }
          />
          <InfoField
            label="Email"
            value={
              <a
                href={`mailto:${lead.email}`}
                className="text-primary hover:underline truncate block max-w-[200px]"
              >
                {lead.email}
              </a>
            }
          />
          <InfoField label="Course Interest" value={lead.courseInterest} />
          <InfoField
            label="Source"
            value={
              <span className="flex items-center gap-1">
                <span>{LEAD_SOURCE_CONFIG[lead.source]?.icon}</span>
                {LEAD_SOURCE_CONFIG[lead.source]?.label ?? lead.source}
              </span>
            }
          />
          <InfoField label="Campaign" value={lead.campaign || "—"} />
          <InfoField
            label="Assigned To"
            value={lead.assignedToName || "Unassigned"}
          />
          <InfoField label="Created" value={formatDate(lead.createdAt)} />
        </div>
      </CardContent>
    </Card>

    {/* Tags */}
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {lead.tags.length === 0 ? (
            <span className="text-sm text-muted-foreground">No tags yet</span>
          ) : (
            lead.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} onRemove={() => onRemoveTag(tag)} />
            ))
          )}
        </div>
        <Input
          placeholder="Add tag, press Enter"
          value={newTag}
          onChange={(e) => onNewTagChange(e.target.value)}
          onKeyDown={onAddTag}
          className="h-8 text-sm"
          data-ocid="lead.tag_input"
        />
      </CardContent>
    </Card>

    {/* Notes */}
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Notes
        </CardTitle>
        {!editingNotes && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onStartEditNotes}
            data-ocid="lead.edit_notes_button"
          >
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {editingNotes ? (
          <div className="space-y-2">
            <Textarea
              value={notesValue}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={5}
              className="resize-none"
              autoFocus
              data-ocid="lead.notes_textarea"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onNotesCancel}
                data-ocid="lead.notes_cancel_button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onNotesSave}
                data-ocid="lead.notes_save_button"
              >
                Save Notes
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="w-full text-left cursor-text"
            onClick={onStartEditNotes}
            data-ocid="lead.notes_display"
          >
            {lead.notes ? (
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {lead.notes}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Click to add notes...
              </p>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  </div>
);

const InfoField: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <dt className="text-xs text-muted-foreground mb-0.5">{label}</dt>
    <dd className="text-sm font-medium text-foreground">{value}</dd>
  </div>
);

// ---- Timeline Tab ----
const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  status_change: <ZapIcon className="h-3.5 w-3.5 text-amber-500" />,
  note: <MessageSquareIcon className="h-3.5 w-3.5 text-blue-500" />,
  task_created: <ClipboardListIcon className="h-3.5 w-3.5 text-violet-500" />,
  task_completed: (
    <ClipboardListIcon className="h-3.5 w-3.5 text-emerald-500" />
  ),
  document: <FileTextIcon className="h-3.5 w-3.5 text-slate-500" />,
  ai_summary: <SparklesIcon className="h-3.5 w-3.5 text-primary" />,
  email: <MailIcon className="h-3.5 w-3.5 text-indigo-500" />,
  call: <PhoneIcon className="h-3.5 w-3.5 text-cyan-500" />,
};

const TimelineTab: React.FC<{
  timeline: ActivityEntry[];
  formatDateTime: (ts: bigint) => string;
}> = ({ timeline, formatDateTime }) => {
  if (timeline.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        data-ocid="timeline.empty_state"
      >
        <ActivityIcon className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No activity yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Activity will appear here as you interact with this lead
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1" data-ocid="timeline.list">
      {timeline.map((entry, i) => (
        <div
          key={entry.id}
          className="flex gap-3 py-3 px-4 bg-card rounded-lg border border-border"
          data-ocid={`timeline.item.${i + 1}`}
        >
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
            {ACTIVITY_ICONS[entry.activityType] ?? (
              <ActivityIcon className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{entry.description}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {entry.userName}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(entry.timestamp)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ---- Tasks Tab ----
const TasksTab: React.FC<{
  tasks: FollowUpTask[];
  onCreateTask: () => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (ts: bigint | null | undefined) => string;
}> = ({ tasks, onCreateTask, onComplete, onDelete, formatDate }) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <p className="text-sm text-muted-foreground">
        {tasks.length} task{tasks.length !== 1 ? "s" : ""}
      </p>
      <Button
        size="sm"
        onClick={onCreateTask}
        data-ocid="lead.create_task_button"
      >
        <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
        Add Task
      </Button>
    </div>

    {tasks.length === 0 ? (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        data-ocid="tasks.empty_state"
      >
        <ClipboardListIcon className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No tasks yet</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={onCreateTask}
          data-ocid="tasks.add_first_button"
        >
          <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
          Add First Task
        </Button>
      </div>
    ) : (
      <div className="space-y-2" data-ocid="tasks.list">
        {tasks.map((task, i) => (
          <TaskRow
            key={task.id}
            task={task}
            index={i + 1}
            onComplete={onComplete}
            onDelete={onDelete}
            formatDate={formatDate}
          />
        ))}
      </div>
    )}
  </div>
);

const TaskRow: React.FC<{
  task: FollowUpTask;
  index: number;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (ts: bigint | null | undefined) => string;
}> = ({ task, index, onComplete, onDelete, formatDate }) => {
  const isOverdue =
    task.status === "Pending" && Number(task.dueDate) / 1_000_000 < Date.now();
  const typeConfig = TASK_TYPE_CONFIG[task.taskType];

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        task.status === "Completed"
          ? "bg-muted/30 border-border opacity-60"
          : isOverdue
            ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
            : "bg-card border-border",
      )}
      data-ocid={`tasks.item.${index}`}
    >
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
        <ClipboardListIcon className={cn("h-4 w-4", typeConfig?.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            task.status === "Completed" && "line-through text-muted-foreground",
          )}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="outline" className={cn("text-xs", typeConfig?.color)}>
            {typeConfig?.label ?? task.taskType}
          </Badge>
          <span
            className={cn(
              "text-xs",
              isOverdue ? "text-red-600 font-medium" : "text-muted-foreground",
            )}
          >
            <CalendarIcon className="inline h-3 w-3 mr-0.5" />
            {formatDate(task.dueDate)}
          </span>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              Overdue
            </Badge>
          )}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        {task.status !== "Completed" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            onClick={() => onComplete(task.id)}
            title="Mark complete"
            data-ocid={`tasks.complete_button.${index}`}
          >
            ✓
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(task.id)}
          title="Delete task"
          data-ocid={`tasks.delete_button.${index}`}
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

// ---- Documents Tab ----
const DocumentsTab: React.FC<{
  documents: Document[];
  dragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (docId: string) => void;
  formatDate: (ts: bigint | null | undefined) => string;
}> = ({
  documents,
  dragOver,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onDelete,
  formatDate,
}) => (
  <div className="space-y-4">
    {/* Upload area */}
    <button
      type="button"
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors w-full",
        dragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
      data-ocid="documents.dropzone"
    >
      <UploadIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
      <p className="text-sm font-medium text-foreground">
        Drop files here or click to upload
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        PDF, Word, Excel, images up to 10MB
      </p>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={onFileChange}
        data-ocid="documents.upload_button"
      />
    </button>

    {/* Document list */}
    {documents.length === 0 ? (
      <div
        className="text-center py-8 text-muted-foreground text-sm"
        data-ocid="documents.empty_state"
      >
        No documents uploaded yet
      </div>
    ) : (
      <div className="space-y-2" data-ocid="documents.list">
        {documents.map((doc, i) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
            data-ocid={`documents.item.${i + 1}`}
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{doc.name}</p>
              <p className="text-xs text-muted-foreground">
                {doc.uploadedByName} · {formatDate(doc.createdAt)}
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <a href={doc.url} target="_blank" rel="noreferrer">
                  Download
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(doc.id)}
                data-ocid={`documents.delete_button.${i + 1}`}
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ---- AI Panel ----
const AiPanel: React.FC<{
  lead: import("../types").Lead;
  aiLoading: boolean;
  onGenerateFollowup: () => void;
  onSummarize: () => void;
  scoreColor: string;
  scoreBarClass: string;
}> = ({
  lead,
  aiLoading,
  onGenerateFollowup,
  onSummarize,
  scoreColor,
  scoreBarClass,
}) => (
  <Card className="border-border shadow-sm bg-gradient-to-br from-card to-primary/5">
    <CardHeader className="pb-2 pt-4 px-4">
      <CardTitle className="text-sm font-semibold flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
          <BotIcon className="h-3.5 w-3.5 text-primary" />
        </div>
        AI Assistant
      </CardTitle>
    </CardHeader>
    <CardContent className="px-4 pb-4 space-y-4">
      {/* Lead Score */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">Lead Score</span>
          <span className={cn("text-lg font-bold", scoreColor)}>
            {lead.aiScore}
            <span className="text-xs text-muted-foreground font-normal">
              /100
            </span>
          </span>
        </div>
        <Progress value={lead.aiScore} className={cn("h-2", scoreBarClass)} />
      </div>

      {/* Sentiment */}
      {lead.aiSentiment && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Sentiment</span>
          <Badge variant="outline" className="text-xs capitalize">
            {lead.aiSentiment}
          </Badge>
        </div>
      )}

      {/* Next Action */}
      {lead.aiNextAction && (
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1 font-medium">
            Recommended Next Action
          </p>
          <p className="text-xs text-foreground leading-relaxed">
            {lead.aiNextAction}
          </p>
        </div>
      )}

      {/* AI Actions */}
      <div className="space-y-2 pt-1">
        <Button
          className="w-full"
          size="sm"
          variant="outline"
          disabled={aiLoading}
          onClick={onGenerateFollowup}
          data-ocid="ai.generate_followup_button"
        >
          <SparklesIcon className="h-3.5 w-3.5 mr-1.5" />
          {aiLoading ? "Generating..." : "Generate Follow-up"}
        </Button>
        <Button
          className="w-full"
          size="sm"
          variant="outline"
          disabled={aiLoading}
          onClick={onSummarize}
          data-ocid="ai.summarize_button"
        >
          <BotIcon className="h-3.5 w-3.5 mr-1.5" />
          {aiLoading ? "Summarizing..." : "Summarize Notes"}
        </Button>
      </div>
    </CardContent>
  </Card>
);

// ---- Loading Skeleton ----
const LeadDetailSkeleton: React.FC = () => (
  <div className="flex flex-col gap-0 min-h-full">
    <div className="bg-card border-b px-6 py-4">
      <Skeleton className="h-4 w-32 mb-3" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
    <div className="flex gap-6 p-6">
      <div className="flex-1 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="w-80 space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  </div>
);
