import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  LEAD_SOURCES,
  LEAD_SOURCE_CONFIG,
  LEAD_STATUSES,
  LEAD_STATUS_CONFIG,
} from "../../constants";
import { useCreateLead, useUpdateLead } from "../../hooks/useQueries";
import type { Lead, LeadSource, LeadStatus, UserProfile } from "../../types";
import { TagBadge } from "../shared/TagBadge";

interface LeadFormData {
  name: string;
  phone: string;
  email: string;
  courseInterest: string;
  source: LeadSource;
  campaign: string;
  status: LeadStatus;
  assignedUserId: string;
  notes: string;
  tags: string[];
  dealValue: string;
}

const EMPTY_FORM: LeadFormData = {
  name: "",
  phone: "",
  email: "",
  courseInterest: "",
  source: "Website",
  campaign: "",
  status: "NewLead",
  assignedUserId: "",
  notes: "",
  tags: [],
  dealValue: "",
};

interface LeadFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editLead?: Lead | null;
  users: UserProfile[];
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  open,
  onOpenChange,
  editLead,
  users,
}) => {
  const { mutate: createLead, isPending: isCreating } = useCreateLead();
  const { mutate: updateLead, isPending: isUpdating } = useUpdateLead();
  const isPending = isCreating || isUpdating;

  const [form, setForm] = useState<LeadFormData>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (editLead) {
      setForm({
        name: editLead.name,
        phone: editLead.phone,
        email: editLead.email,
        courseInterest: editLead.courseInterest,
        source: editLead.source,
        campaign: editLead.campaign,
        status: editLead.status,
        assignedUserId: editLead.assignedTo,
        notes: editLead.notes,
        tags: editLead.tags,
        dealValue: editLead.dealValue ? String(editLead.dealValue) : "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setTagInput("");
  }, [editLead]);

  const set = <K extends keyof LeadFormData>(k: K, v: LeadFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || form.tags.includes(t)) return;
    set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Lead name is required");
      return;
    }

    if (editLead) {
      updateLead(
        {
          id: editLead.id,
          name: form.name,
          phone: form.phone,
          email: form.email,
          courseInterest: form.courseInterest,
          source: form.source,
          campaign: form.campaign,
          status: form.status,
          assignedTo: form.assignedUserId,
          notes: form.notes,
          tags: form.tags,
          dealValue: form.dealValue
            ? BigInt(Math.round(Number(form.dealValue)))
            : undefined,
        },
        {
          onSuccess: () => {
            toast.success("Lead updated");
            onOpenChange(false);
          },
          onError: (err) => toast.error(`Failed: ${err.message}`),
        },
      );
    } else {
      createLead(
        {
          name: form.name,
          phone: form.phone,
          email: form.email,
          courseInterest: form.courseInterest,
          source: form.source,
          campaign: form.campaign,
          dealValue: form.dealValue
            ? BigInt(Math.round(Number(form.dealValue)))
            : undefined,
        },
        {
          onSuccess: () => {
            toast.success("Lead created successfully");
            onOpenChange(false);
            setForm(EMPTY_FORM);
          },
          onError: (err) => toast.error(`Failed: ${err.message}`),
        },
      );
    }
  };

  const isEditing = !!editLead;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid={
          isEditing ? "leads.edit_lead.dialog" : "leads.add_lead.dialog"
        }
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Lead" : "Add New Lead"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {/* Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="lf-name">Full Name *</Label>
              <Input
                id="lf-name"
                placeholder="Priya Sharma"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                data-ocid="leads.form_name.input"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="lf-phone">Phone</Label>
              <Input
                id="lf-phone"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                data-ocid="leads.form_phone.input"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="lf-email">Email</Label>
              <Input
                id="lf-email"
                type="email"
                placeholder="priya@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                data-ocid="leads.form_email.input"
              />
            </div>

            {/* Course Interest */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="lf-course">Course / Program Interest</Label>
              <Input
                id="lf-course"
                placeholder="MBA, Full Stack Engineering, Data Science..."
                value={form.courseInterest}
                onChange={(e) => set("courseInterest", e.target.value)}
                data-ocid="leads.form_course.input"
              />
            </div>

            {/* Source */}
            <div className="space-y-1.5">
              <Label>Lead Source</Label>
              <Select
                value={form.source}
                onValueChange={(v) => set("source", v as LeadSource)}
              >
                <SelectTrigger data-ocid="leads.form_source.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LEAD_SOURCE_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campaign */}
            <div className="space-y-1.5">
              <Label htmlFor="lf-campaign">Campaign</Label>
              <Input
                id="lf-campaign"
                placeholder="Summer Promo 2026"
                value={form.campaign}
                onChange={(e) => set("campaign", e.target.value)}
                data-ocid="leads.form_campaign.input"
              />
            </div>

            {/* Status (edit only) */}
            {isEditing && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => set("status", v as LeadStatus)}
                >
                  <SelectTrigger data-ocid="leads.form_status.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {LEAD_STATUS_CONFIG[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Assigned To */}
            {users.length > 0 && (
              <div className="space-y-1.5">
                <Label>Assigned To</Label>
                <Select
                  value={form.assignedUserId}
                  onValueChange={(v) => set("assignedUserId", v)}
                >
                  <SelectTrigger data-ocid="leads.form_assigned.select">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1"
                  data-ocid="leads.form_tag.input"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  data-ocid="leads.form_tag.add_button"
                >
                  Add
                </Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.tags.map((t) => (
                    <TagBadge
                      key={t}
                      tag={t}
                      onRemove={() =>
                        set(
                          "tags",
                          form.tags.filter((tag) => tag !== t),
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="lf-notes">Notes</Label>
              <Textarea
                id="lf-notes"
                placeholder="Any initial notes about this lead..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
                data-ocid="leads.form_notes.textarea"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="leads.form.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="leads.form.submit_button"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
