import type { LeadSource, LeadStatus, Role, RouteId, TaskType } from "./types";

export type { RouteId };

// ==================== Lead Status Config ====================
export const LEAD_STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  NewLead: {
    label: "New Lead",
    color: "#6366f1",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    textColor: "text-indigo-700 dark:text-indigo-300",
  },
  Contacted: {
    label: "Contacted",
    color: "#06b6d4",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    textColor: "text-cyan-700 dark:text-cyan-300",
  },
  Interested: {
    label: "Interested",
    color: "#f59e0b",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  FollowUpScheduled: {
    label: "Follow-Up Scheduled",
    color: "#8b5cf6",
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
    textColor: "text-violet-700 dark:text-violet-300",
  },
  Qualified: {
    label: "Qualified",
    color: "#10b981",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  ProposalSent: {
    label: "Proposal Sent",
    color: "#3b82f6",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  Won: {
    label: "Won",
    color: "#10b981",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  Lost: {
    label: "Lost",
    color: "#ef4444",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-700 dark:text-red-300",
  },
  NotInterested: {
    label: "Not Interested",
    color: "#94a3b8",
    bgColor: "bg-slate-100 dark:bg-slate-700/30",
    textColor: "text-slate-600 dark:text-slate-400",
  },
};

export const LEAD_STATUSES = Object.keys(LEAD_STATUS_CONFIG) as LeadStatus[];

// ==================== Lead Source Config ====================
export const LEAD_SOURCE_CONFIG: Record<
  LeadSource,
  { label: string; icon: string }
> = {
  Website: { label: "Website", icon: "🌐" },
  LandingPage: { label: "Landing Page", icon: "📄" },
  ManualEntry: { label: "Manual Entry", icon: "✏️" },
  CsvUpload: { label: "CSV Upload", icon: "📊" },
  Api: { label: "API", icon: "🔌" },
  FacebookAds: { label: "Facebook Ads", icon: "📱" },
  GoogleAds: { label: "Google Ads", icon: "🔍" },
  Referral: { label: "Referral", icon: "👥" },
  WhatsApp: { label: "WhatsApp", icon: "💬" },
  Other: { label: "Other", icon: "📌" },
};

export const LEAD_SOURCES = Object.keys(LEAD_SOURCE_CONFIG) as LeadSource[];

// ==================== Task Type Config ====================
export const TASK_TYPE_CONFIG: Record<
  TaskType,
  { label: string; color: string }
> = {
  Call: { label: "Call", color: "text-blue-600" },
  Email: { label: "Email", color: "text-indigo-600" },
  WhatsApp: { label: "WhatsApp", color: "text-emerald-600" },
  Meeting: { label: "Meeting", color: "text-violet-600" },
  FollowUp: { label: "Follow-Up", color: "text-amber-600" },
  Other: { label: "Other", color: "text-slate-600" },
};

// ==================== Role Config ====================
export const ROLE_CONFIG: Record<
  Role,
  { label: string; color: string; bgColor: string }
> = {
  Admin: {
    label: "Admin",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  SalesManager: {
    label: "Sales Manager",
    color: "text-violet-700 dark:text-violet-300",
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
  },
  Counselor: {
    label: "Counselor",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  Telecaller: {
    label: "Telecaller",
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
};

// ==================== Navigation ====================
export interface NavItem {
  id: RouteId;
  label: string;
  path: string;
  section?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/", section: "main" },
  { id: "leads", label: "Leads", path: "/leads", section: "main" },
  { id: "pipeline", label: "Pipeline", path: "/pipeline", section: "main" },
  { id: "tasks", label: "Tasks", path: "/tasks", section: "main" },
  { id: "documents", label: "Documents", path: "/documents", section: "main" },
  {
    id: "ai-insights",
    label: "AI Insights",
    path: "/ai-insights",
    section: "tools",
  },
  { id: "settings", label: "Settings", path: "/settings", section: "tools" },
];

// ==================== Pipeline Stages (ordered) ====================
export const PIPELINE_STAGES: LeadStatus[] = [
  "NewLead",
  "Contacted",
  "Interested",
  "FollowUpScheduled",
  "Qualified",
  "ProposalSent",
  "Won",
  "Lost",
  "NotInterested",
];
