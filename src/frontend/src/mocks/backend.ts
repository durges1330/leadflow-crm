import type { backendInterface, LeadPublic, UserProfilePublic, FollowUpTaskPublic, ActivityEntry, LeadStats, FunnelStage, CounselorStats, Document } from "../backend.d";
import { ActivityType, LeadStatus, RecurringType, Role, TaskStatus, TaskType } from "../backend.d";
import { Principal } from "@icp-sdk/core/principal";

const mockPrincipal = Principal.fromText("2vxsx-fae");
const now = BigInt(Date.now()) * BigInt(1_000_000);

const sampleLeads: LeadPublic[] = [
  {
    id: BigInt(1),
    name: "Eleanor Pena",
    email: "eleanor.pena@globexcorp.com",
    phone: "+1-555-0101",
    status: LeadStatus.NewLead,
    source: { __kind__: "Website", Website: null },
    campaign: "Spring Campaign",
    courseInterest: "MBA Program",
    notes: "Very interested in the MBA program. Has 5 years of work experience.",
    dealValue: BigInt(5000),
    tags: ["high-value", "mba"],
    assignedUserId: mockPrincipal,
    createdAt: now - BigInt(7 * 24 * 60 * 60 * 1_000_000_000),
    updatedAt: now - BigInt(2 * 24 * 60 * 60 * 1_000_000_000),
    statusHistory: [
      { status: LeadStatus.NewLead, changedAt: now - BigInt(7 * 24 * 60 * 60 * 1_000_000_000), changedBy: mockPrincipal }
    ]
  },
  {
    id: BigInt(2),
    name: "Marvin McKinney",
    email: "marvin.mckinney@initech.com",
    phone: "+1-555-0202",
    status: LeadStatus.Contacted,
    source: { __kind__: "GoogleAds", GoogleAds: null },
    campaign: "Google Search Q1",
    courseInterest: "Data Science Bootcamp",
    notes: "Called twice. Interested but needs to discuss with family.",
    dealValue: BigInt(3500),
    tags: ["follow-up", "data-science"],
    assignedUserId: mockPrincipal,
    createdAt: now - BigInt(5 * 24 * 60 * 60 * 1_000_000_000),
    updatedAt: now - BigInt(1 * 24 * 60 * 60 * 1_000_000_000),
    statusHistory: [
      { status: LeadStatus.NewLead, changedAt: now - BigInt(5 * 24 * 60 * 60 * 1_000_000_000), changedBy: mockPrincipal },
      { status: LeadStatus.Contacted, changedAt: now - BigInt(3 * 24 * 60 * 60 * 1_000_000_000), changedBy: mockPrincipal }
    ]
  },
  {
    id: BigInt(3),
    name: "Sarah McKinney",
    email: "sarah.mckinney@initech.com",
    phone: "+1-555-0303",
    status: LeadStatus.Interested,
    source: { __kind__: "FacebookAds", FacebookAds: null },
    campaign: "Facebook Lead Gen",
    courseInterest: "Full Stack Development",
    notes: "Highly engaged on social media. Ready to enroll soon.",
    dealValue: BigInt(4200),
    tags: ["hot-lead", "tech"],
    assignedUserId: mockPrincipal,
    createdAt: now - BigInt(10 * 24 * 60 * 60 * 1_000_000_000),
    updatedAt: now - BigInt(1 * 24 * 60 * 60 * 1_000_000_000),
    statusHistory: [
      { status: LeadStatus.NewLead, changedAt: now - BigInt(10 * 24 * 60 * 60 * 1_000_000_000), changedBy: mockPrincipal },
      { status: LeadStatus.Interested, changedAt: now - BigInt(4 * 24 * 60 * 60 * 1_000_000_000), changedBy: mockPrincipal }
    ]
  },
  {
    id: BigInt(4),
    name: "James Cooper",
    email: "james.cooper@globexcorp.com",
    phone: "+1-555-0404",
    status: LeadStatus.Qualified,
    source: { __kind__: "Referral", Referral: null },
    campaign: "Referral Program",
    courseInterest: "Project Management",
    notes: "Referred by existing student. Strong candidate.",
    dealValue: BigInt(6000),
    tags: ["referral", "qualified"],
    assignedUserId: mockPrincipal,
    createdAt: now - BigInt(15 * 24 * 60 * 60 * 1_000_000_000),
    updatedAt: now - BigInt(3 * 24 * 60 * 60 * 1_000_000_000),
    statusHistory: [
      { status: LeadStatus.NewLead, changedAt: now - BigInt(15 * 24 * 60 * 60 * 1_000_000_000), changedBy: mockPrincipal },
      { status: LeadStatus.Qualified, changedAt: now - BigInt(5 * 24 * 60 * 60 * 1_000_000_000), changedBy: mockPrincipal }
    ]
  },
  {
    id: BigInt(5),
    name: "Amanda Rodriguez",
    email: "amanda.rodriguez@acme.com",
    phone: "+1-555-0505",
    status: LeadStatus.Won,
    source: { __kind__: "LandingPage", LandingPage: null },
    campaign: "Summer Enrollment",
    courseInterest: "Digital Marketing",
    notes: "Enrolled and paid in full.",
    dealValue: BigInt(3800),
    tags: ["enrolled", "won"],
    assignedUserId: mockPrincipal,
    createdAt: now - BigInt(20 * 24 * 60 * 60 * 1_000_000_000),
    updatedAt: now - BigInt(2 * 24 * 60 * 60 * 1_000_000_000),
    statusHistory: [
      { status: LeadStatus.NewLead, changedAt: now - BigInt(20 * 24 * 60 * 60 * 1_000_000_000), changedBy: mockPrincipal },
      { status: LeadStatus.Won, changedAt: now - BigInt(2 * 24 * 60 * 60 * 1_000_000_000), changedBy: mockPrincipal }
    ]
  }
];

const sampleUser: UserProfilePublic = {
  id: mockPrincipal,
  name: "Sarah Jenkins",
  email: "sarah.jenkins@atlascrm.com",
  role: Role.Admin,
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
  createdAt: now - BigInt(90 * 24 * 60 * 60 * 1_000_000_000)
};

const sampleTasks: FollowUpTaskPublic[] = [
  {
    id: BigInt(1),
    title: "Follow up call with Eleanor",
    assignedTo: mockPrincipal,
    createdAt: now - BigInt(2 * 24 * 60 * 60 * 1_000_000_000),
    createdBy: mockPrincipal,
    recurring: RecurringType.None,
    dueDate: now + BigInt(1 * 24 * 60 * 60 * 1_000_000_000),
    taskStatus: TaskStatus.Pending,
    taskType: TaskType.Call,
    leadId: BigInt(1)
  },
  {
    id: BigInt(2),
    title: "Send proposal to James Cooper",
    assignedTo: mockPrincipal,
    createdAt: now - BigInt(3 * 24 * 60 * 60 * 1_000_000_000),
    createdBy: mockPrincipal,
    recurring: RecurringType.None,
    dueDate: now - BigInt(1 * 24 * 60 * 60 * 1_000_000_000),
    taskStatus: TaskStatus.Overdue,
    taskType: TaskType.Email,
    leadId: BigInt(4)
  }
];

const sampleActivities: ActivityEntry[] = [
  {
    id: BigInt(1),
    activityType: ActivityType.LeadCreated,
    content: "Lead created from website form",
    createdAt: now - BigInt(7 * 24 * 60 * 60 * 1_000_000_000),
    createdBy: mockPrincipal,
    leadId: BigInt(1)
  },
  {
    id: BigInt(2),
    activityType: ActivityType.Called,
    content: "Called and discussed program options. Very interested.",
    createdAt: now - BigInt(2 * 24 * 60 * 60 * 1_000_000_000),
    createdBy: mockPrincipal,
    leadId: BigInt(2)
  },
  {
    id: BigInt(3),
    activityType: ActivityType.EmailSent,
    content: "Sent detailed brochure via email",
    createdAt: now - BigInt(1 * 24 * 60 * 60 * 1_000_000_000),
    createdBy: mockPrincipal,
    leadId: BigInt(3)
  }
];

export const mockBackend: backendInterface = {
  addDocument: async (leadId, filename, storageUrl, fileType, fileSize) => ({
    id: BigInt(1),
    leadId,
    filename,
    storageUrl,
    fileType,
    fileSize,
    uploadedAt: now,
    uploadedBy: mockPrincipal
  }),

  assignLead: async (id, assignedUserId) => {
    const lead = sampleLeads.find(l => l.id === id) ?? sampleLeads[0];
    return { ...lead, assignedUserId: assignedUserId ?? undefined };
  },

  completeFollowUpTask: async (id) => {
    const task = sampleTasks.find(t => t.id === id) ?? sampleTasks[0];
    return { ...task, taskStatus: TaskStatus.Completed };
  },

  createFollowUpTask: async (input) => ({
    id: BigInt(99),
    title: input.title,
    assignedTo: input.assignedTo,
    createdAt: now,
    createdBy: mockPrincipal,
    recurring: input.recurring,
    dueDate: input.dueDate,
    taskStatus: TaskStatus.Pending,
    taskType: input.taskType,
    leadId: input.leadId
  }),

  createLead: async (input) => ({
    id: BigInt(99),
    name: input.name,
    email: input.email,
    phone: input.phone,
    status: LeadStatus.NewLead,
    source: input.source,
    campaign: input.campaign,
    courseInterest: input.courseInterest,
    notes: input.notes,
    dealValue: input.dealValue,
    tags: input.tags,
    assignedUserId: input.assignedUserId,
    createdAt: now,
    updatedAt: now,
    statusHistory: [{ status: LeadStatus.NewLead, changedAt: now, changedBy: mockPrincipal }]
  }),

  deleteDocument: async () => true,
  deleteFollowUpTask: async () => true,
  deleteLead: async () => true,

  filterLeads: async (filter) => sampleLeads,

  generateSampleData: async () => BigInt(5),

  getConversionFunnel: async (): Promise<FunnelStage[]> => [
    { status: LeadStatus.NewLead, count: BigInt(248) },
    { status: LeadStatus.Contacted, count: BigInt(185) },
    { status: LeadStatus.Interested, count: BigInt(142) },
    { status: LeadStatus.Qualified, count: BigInt(98) },
    { status: LeadStatus.ProposalSent, count: BigInt(67) },
    { status: LeadStatus.Won, count: BigInt(45) }
  ],

  getCounselorStats: async (): Promise<CounselorStats[]> => [
    { userId: mockPrincipal, totalAssigned: BigInt(45), totalFollowedUp: BigInt(38), totalConverted: BigInt(12) }
  ],

  getDashboardStats: async (): Promise<LeadStats> => ({
    totalLeads: BigInt(1248),
    totalDealValue: BigInt(145200),
    wonLeads: BigInt(89),
    conversionRate: BigInt(7),
    byStatus: [
      [LeadStatus.NewLead, BigInt(248)],
      [LeadStatus.Contacted, BigInt(185)],
      [LeadStatus.Interested, BigInt(142)],
      [LeadStatus.Qualified, BigInt(98)],
      [LeadStatus.Won, BigInt(89)],
      [LeadStatus.Lost, BigInt(45)]
    ],
    bySource: [
      [{ __kind__: "Website", Website: null }, BigInt(320)],
      [{ __kind__: "GoogleAds", GoogleAds: null }, BigInt(280)],
      [{ __kind__: "FacebookAds", FacebookAds: null }, BigInt(220)],
      [{ __kind__: "Referral", Referral: null }, BigInt(180)],
      [{ __kind__: "LandingPage", LandingPage: null }, BigInt(148)],
      [{ __kind__: "ManualEntry", ManualEntry: null }, BigInt(100)]
    ]
  }),

  getDocumentsByLead: async (): Promise<Document[]> => [],

  getFollowUpTask: async (id) => sampleTasks.find(t => t.id === id) ?? null,

  getLead: async (id) => sampleLeads.find(l => l.id === id) ?? null,

  getLeadTimeline: async (): Promise<ActivityEntry[]> => sampleActivities,

  getLeadsBySourceCounts: async () => [
    [{ __kind__: "Website", Website: null }, BigInt(320)],
    [{ __kind__: "GoogleAds", GoogleAds: null }, BigInt(280)],
    [{ __kind__: "FacebookAds", FacebookAds: null }, BigInt(220)]
  ],

  getLeadsByStatus: async (status) => sampleLeads.filter(l => l.status === status),

  getLeadsByStatusCounts: async () => [
    [LeadStatus.NewLead, BigInt(248)],
    [LeadStatus.Contacted, BigInt(185)],
    [LeadStatus.Interested, BigInt(142)],
    [LeadStatus.Qualified, BigInt(98)],
    [LeadStatus.Won, BigInt(89)],
    [LeadStatus.Lost, BigInt(45)]
  ],

  getLeadsCreatedInPeriod: async () => BigInt(124),

  getMyActivities: async () => sampleActivities,

  getMyLeads: async () => sampleLeads,

  getMyProfile: async () => sampleUser,

  getMyTasks: async () => sampleTasks,

  getOverdueTasks: async () => sampleTasks.filter(t => t.taskStatus === TaskStatus.Overdue),

  getRecentActivities: async () => sampleActivities,

  getTasksByLead: async () => sampleTasks,

  getTotalLeads: async () => BigInt(1248),

  importLeads: async () => BigInt(0),

  listAllUsers: async () => [sampleUser],

  listLeads: async () => sampleLeads,

  registerProfile: async (name, email, role, avatar) => ({
    id: mockPrincipal,
    name,
    email,
    role,
    avatar,
    createdAt: now
  }),

  setMyAiApiKey: async () => undefined,

  setUserRole: async (targetUser, role) => ({ ...sampleUser, id: targetUser, role }),

  updateLead: async (id, input) => {
    const lead = sampleLeads.find(l => l.id === id) ?? sampleLeads[0];
    return { ...lead, ...input, id, updatedAt: now };
  },

  updateLeadNotes: async (id, notes) => {
    const lead = sampleLeads.find(l => l.id === id) ?? sampleLeads[0];
    return { ...lead, notes, updatedAt: now };
  },

  updateLeadStatus: async (id, newStatus) => {
    const lead = sampleLeads.find(l => l.id === id) ?? sampleLeads[0];
    return { ...lead, status: newStatus, updatedAt: now };
  },

  updateLeadTags: async (id, tags) => {
    const lead = sampleLeads.find(l => l.id === id) ?? sampleLeads[0];
    return { ...lead, tags, updatedAt: now };
  },

  updateMyProfile: async (name, email, avatar) => ({ ...sampleUser, name, email, avatar })
};
