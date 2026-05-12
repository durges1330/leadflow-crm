import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export type LeadId = bigint;
export interface CreateLeadInput {
    source: LeadSource;
    campaign: string;
    name: string;
    tags: Array<string>;
    email: string;
    courseInterest: string;
    notes: string;
    dealValue: bigint;
    phone: string;
    assignedUserId?: UserId;
}
export interface LeadPublic {
    id: LeadId;
    status: LeadStatus;
    source: LeadSource;
    campaign: string;
    name: string;
    createdAt: Timestamp;
    tags: Array<string>;
    statusHistory: Array<StatusHistoryEntry>;
    email: string;
    updatedAt: Timestamp;
    courseInterest: string;
    notes: string;
    dealValue: bigint;
    phone: string;
    assignedUserId?: UserId;
}
export interface FollowUpTaskPublic {
    id: TaskId;
    title: string;
    assignedTo: UserId;
    createdAt: Timestamp;
    createdBy: UserId;
    recurring: RecurringType;
    dueDate: Timestamp;
    taskStatus: TaskStatus;
    taskType: TaskType;
    leadId: LeadId;
    nextRunDate?: Timestamp;
}
export interface Document {
    id: DocumentId;
    fileSize: bigint;
    fileType: string;
    filename: string;
    leadId: LeadId;
    storageUrl: string;
    uploadedAt: Timestamp;
    uploadedBy: UserId;
}
export interface FunnelStage {
    status: LeadStatus;
    count: bigint;
}
export type LeadSource = {
    __kind__: "Website";
    Website: null;
} | {
    __kind__: "ManualEntry";
    ManualEntry: null;
} | {
    __kind__: "LandingPage";
    LandingPage: null;
} | {
    __kind__: "FacebookAds";
    FacebookAds: null;
} | {
    __kind__: "Other";
    Other: string;
} | {
    __kind__: "CsvUpload";
    CsvUpload: null;
} | {
    __kind__: "ApiIntegration";
    ApiIntegration: null;
} | {
    __kind__: "Referral";
    Referral: null;
} | {
    __kind__: "GoogleAds";
    GoogleAds: null;
};
export interface CreateTaskInput {
    title: string;
    assignedTo: UserId;
    recurring: RecurringType;
    dueDate: Timestamp;
    taskType: TaskType;
    leadId: LeadId;
}
export interface LeadFilter {
    tag?: string;
    status?: LeadStatus;
    source?: LeadSource;
    campaign?: string;
    toDate?: Timestamp;
    fromDate?: Timestamp;
    assignedUserId?: UserId;
}
export interface UserProfilePublic {
    id: UserId;
    name: string;
    createdAt: Timestamp;
    role: Role;
    email: string;
    avatar: string;
}
export interface StatusHistoryEntry {
    status: LeadStatus;
    changedAt: Timestamp;
    changedBy: UserId;
}
export type UserId = Principal;
export interface LeadStats {
    totalLeads: bigint;
    totalDealValue: bigint;
    wonLeads: bigint;
    conversionRate: bigint;
    byStatus: Array<[LeadStatus, bigint]>;
    bySource: Array<[LeadSource, bigint]>;
}
export type ActivityId = bigint;
export type TaskId = bigint;
export type DocumentId = bigint;
export interface CounselorStats {
    userId: UserId;
    totalAssigned: bigint;
    totalFollowedUp: bigint;
    totalConverted: bigint;
}
export interface ActivityEntry {
    id: ActivityId;
    activityType: ActivityType;
    content: string;
    createdAt: Timestamp;
    createdBy: UserId;
    leadId: LeadId;
}
export enum ActivityType {
    TaskCompleted = "TaskCompleted",
    WhatsappSent = "WhatsappSent",
    DocumentUploaded = "DocumentUploaded",
    LeadCreated = "LeadCreated",
    AiSummary = "AiSummary",
    EmailSent = "EmailSent",
    TaskCreated = "TaskCreated",
    LeadUpdated = "LeadUpdated",
    StatusChange = "StatusChange",
    Called = "Called",
    NoteAdded = "NoteAdded"
}
export enum LeadStatus {
    Won = "Won",
    Lost = "Lost",
    ProposalSent = "ProposalSent",
    Contacted = "Contacted",
    Qualified = "Qualified",
    FollowUpScheduled = "FollowUpScheduled",
    NewLead = "NewLead",
    Interested = "Interested",
    NotInterested = "NotInterested"
}
export enum RecurringType {
    Weekly = "Weekly",
    None = "None",
    Daily = "Daily",
    Monthly = "Monthly"
}
export enum Role {
    SalesManager = "SalesManager",
    Counselor = "Counselor",
    Telecaller = "Telecaller",
    Admin = "Admin"
}
export enum TaskStatus {
    Overdue = "Overdue",
    Completed = "Completed",
    Pending = "Pending"
}
export enum TaskType {
    Sms = "Sms",
    Email = "Email",
    Call = "Call",
    Whatsapp = "Whatsapp",
    Meeting = "Meeting"
}
export interface backendInterface {
    addDocument(leadId: LeadId, filename: string, storageUrl: string, fileType: string, fileSize: bigint): Promise<Document>;
    assignLead(id: LeadId, assignedUserId: UserId | null): Promise<LeadPublic>;
    completeFollowUpTask(id: TaskId): Promise<FollowUpTaskPublic>;
    createFollowUpTask(input: CreateTaskInput): Promise<FollowUpTaskPublic>;
    createLead(input: CreateLeadInput): Promise<LeadPublic>;
    deleteDocument(id: DocumentId): Promise<boolean>;
    deleteFollowUpTask(id: TaskId): Promise<boolean>;
    deleteLead(id: LeadId): Promise<boolean>;
    filterLeads(filter: LeadFilter): Promise<Array<LeadPublic>>;
    generateSampleData(): Promise<bigint>;
    getConversionFunnel(): Promise<Array<FunnelStage>>;
    getCounselorStats(): Promise<Array<CounselorStats>>;
    getDashboardStats(): Promise<LeadStats>;
    getDocumentsByLead(leadId: LeadId): Promise<Array<Document>>;
    getFollowUpTask(id: TaskId): Promise<FollowUpTaskPublic | null>;
    getLead(id: LeadId): Promise<LeadPublic | null>;
    getLeadTimeline(leadId: LeadId): Promise<Array<ActivityEntry>>;
    getLeadsBySourceCounts(): Promise<Array<[LeadSource, bigint]>>;
    getLeadsByStatus(status: LeadStatus): Promise<Array<LeadPublic>>;
    getLeadsByStatusCounts(): Promise<Array<[LeadStatus, bigint]>>;
    getLeadsCreatedInPeriod(fromDate: Timestamp, toDate: Timestamp): Promise<bigint>;
    getMyActivities(): Promise<Array<ActivityEntry>>;
    getMyLeads(): Promise<Array<LeadPublic>>;
    getMyProfile(): Promise<UserProfilePublic | null>;
    getMyTasks(): Promise<Array<FollowUpTaskPublic>>;
    getOverdueTasks(): Promise<Array<FollowUpTaskPublic>>;
    getRecentActivities(limit: bigint): Promise<Array<ActivityEntry>>;
    getTasksByLead(leadId: LeadId): Promise<Array<FollowUpTaskPublic>>;
    getTotalLeads(): Promise<bigint>;
    importLeads(inputs: Array<CreateLeadInput>): Promise<bigint>;
    listAllUsers(): Promise<Array<UserProfilePublic>>;
    listLeads(): Promise<Array<LeadPublic>>;
    registerProfile(name: string, email: string, role: Role, avatar: string): Promise<UserProfilePublic>;
    setMyAiApiKey(apiKey: string): Promise<void>;
    setUserRole(targetUser: UserId, role: Role): Promise<UserProfilePublic>;
    updateLead(id: LeadId, input: CreateLeadInput): Promise<LeadPublic>;
    updateLeadNotes(id: LeadId, notes: string): Promise<LeadPublic>;
    updateLeadStatus(id: LeadId, newStatus: LeadStatus): Promise<LeadPublic>;
    updateLeadTags(id: LeadId, tags: Array<string>): Promise<LeadPublic>;
    updateMyProfile(name: string, email: string, avatar: string): Promise<UserProfilePublic>;
}
