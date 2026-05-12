// Shared CRM types matching backend contracts

export type Role = "Admin" | "SalesManager" | "Counselor" | "Telecaller";

export type LeadStatus =
  | "NewLead"
  | "Contacted"
  | "Interested"
  | "FollowUpScheduled"
  | "Qualified"
  | "ProposalSent"
  | "Won"
  | "Lost"
  | "NotInterested";

export type LeadSource =
  | "Website"
  | "LandingPage"
  | "ManualEntry"
  | "CsvUpload"
  | "Api"
  | "FacebookAds"
  | "GoogleAds"
  | "Referral"
  | "WhatsApp"
  | "Other";

export type TaskType =
  | "Call"
  | "Email"
  | "WhatsApp"
  | "Meeting"
  | "FollowUp"
  | "Other";

export type TaskStatus = "Pending" | "Completed" | "Overdue";

export interface UserProfile {
  id: string;
  principal: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  courseInterest: string;
  source: LeadSource;
  campaign: string;
  status: LeadStatus;
  assignedTo: string;
  assignedToName: string;
  notes: string;
  tags: string[];
  dealValue: bigint;
  aiScore: number;
  aiSentiment: string;
  aiNextAction: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface FollowUpTask {
  id: string;
  leadId: string;
  leadName: string;
  title: string;
  description: string;
  taskType: TaskType;
  status: TaskStatus;
  dueDate: bigint;
  assignedTo: string;
  assignedToName: string;
  createdAt: bigint;
  completedAt: bigint | null;
}

export interface ActivityEntry {
  id: string;
  leadId: string;
  leadName: string;
  userId: string;
  userName: string;
  activityType: string;
  description: string;
  metadata: string;
  timestamp: bigint;
}

export interface Document {
  id: string;
  leadId: string;
  name: string;
  fileType: string;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: bigint;
}

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  conversions: number;
  revenue: number;
  followUpsDue: number;
  overdueTasks: number;
  activeLeads: number;
  lostLeads: number;
}

export interface LeadFilter {
  status?: LeadStatus;
  source?: LeadSource;
  assignedTo?: string;
  campaign?: string;
  tags?: string[];
  dateFrom?: bigint;
  dateTo?: bigint;
  searchQuery?: string;
}

export interface CounselorStat {
  userId: string;
  userName: string;
  totalLeads: number;
  qualifiedLeads: number;
  conversions: number;
  followUpsCompleted: number;
  followUpsPending: number;
}

export interface ConversionFunnelStage {
  stage: LeadStatus;
  count: number;
  percentage: number;
}

export type RouteId =
  | "dashboard"
  | "leads"
  | "lead-detail"
  | "pipeline"
  | "tasks"
  | "documents"
  | "ai-insights"
  | "settings";
