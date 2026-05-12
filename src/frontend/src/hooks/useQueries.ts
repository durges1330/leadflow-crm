import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ActivityEntry } from "../types";
import type {
  CounselorStat,
  DashboardStats,
  FollowUpTask,
  Lead,
  LeadFilter,
  LeadSource,
  LeadStatus,
  Role,
  UserProfile,
} from "../types";

// ==================== Profile Hooks ====================

export function useGetMyProfile() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserProfile | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<UserProfile | null>
        >
      ).getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    UserProfile,
    Error,
    { name: string; email: string; phone: string; role: Role }
  >({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Actor not available");
      const roleVariant: Role = data.role;
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<UserProfile>
        >
      ).registerProfile(data.name, data.email, roleVariant, "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useUpdateMyProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    UserProfile,
    Error,
    { name: string; email: string; phone: string }
  >({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<UserProfile>
        >
      ).updateMyProfile(data.name, data.email, data.phone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useSetMyAiApiKey() {
  const { actor } = useActor(createActor);
  return useMutation<boolean, Error, { apiKey: string }>({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<boolean>
        >
      ).setMyAiApiKey(data.apiKey);
    },
  });
}
export function useSetUserRole() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<UserProfile, Error, { userId: string; role: Role }>({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<UserProfile>
        >
      ).setUserRole(data.userId, data.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useListAllUsers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserProfile[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<UserProfile[]>
        >
      ).listAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

// ==================== Lead Hooks ====================

export function useListLeads() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Lead[]>
        >
      ).listLeads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLead(id: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Lead | null>({
    queryKey: ["lead", id],
    queryFn: async () => {
      if (!actor) return null;
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Lead | null>
        >
      ).getLead(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useFilterLeads(filter: LeadFilter) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Lead[]>({
    queryKey: ["leads", "filter", JSON.stringify(filter)],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Lead[]>
        >
      ).filterLeads(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyLeads() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Lead[]>({
    queryKey: ["myLeads"],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Lead[]>
        >
      ).getMyLeads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLeadsByStatus(status: LeadStatus) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Lead[]>({
    queryKey: ["leads", "status", status],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Lead[]>
        >
      ).getLeadsByStatus(status);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateLead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    Lead,
    Error,
    {
      name: string;
      phone: string;
      email: string;
      courseInterest: string;
      source: LeadSource;
      campaign: string;
      dealValue?: bigint;
    }
  >({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Lead>
        >
      ).createLead(
        data.name,
        data.phone,
        data.email,
        data.courseInterest,
        data.source,
        data.campaign,
        data.dealValue ?? BigInt(0),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateLead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    Lead,
    Error,
    Partial<Lead> & { id: string; dealValue?: bigint }
  >({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Lead>
        >
      ).updateLead(data.id, data);
    },
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
    },
  });
}

export function useUpdateLeadStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<Lead, Error, { id: string; status: LeadStatus }>({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Lead>
        >
      ).updateLeadStatus(data.id, data.status);
    },
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useAssignLead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<Lead, Error, { id: string; userId: string }>({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Lead>
        >
      ).assignLead(data.id, data.userId);
    },
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
    },
  });
}

export function useUpdateLeadNotes() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<Lead, Error, { id: string; notes: string }>({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Lead>
        >
      ).updateLeadNotes(data.id, data.notes);
    },
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
    },
  });
}

export function useUpdateLeadTags() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<Lead, Error, { id: string; tags: string[] }>({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Lead>
        >
      ).updateLeadTags(data.id, data.tags);
    },
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
    },
  });
}

export function useDeleteLead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<boolean>
        >
      ).deleteLead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useImportLeads() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<Lead[], Error, Lead[]>({
    mutationFn: async (leads) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Lead[]>
        >
      ).importLeads(leads);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

// ==================== Task Hooks ====================

export function useGetMyTasks() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<FollowUpTask[]>({
    queryKey: ["myTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<FollowUpTask[]>
        >
      ).getMyTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOverdueTasks() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<FollowUpTask[]>({
    queryKey: ["overdueTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<FollowUpTask[]>
        >
      ).getOverdueTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTasksByLead(leadId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<FollowUpTask[]>({
    queryKey: ["tasks", "lead", leadId],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<FollowUpTask[]>
        >
      ).getTasksByLead(leadId);
    },
    enabled: !!actor && !isFetching && !!leadId,
  });
}

export function useCreateFollowUpTask() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    FollowUpTask,
    Error,
    {
      leadId: string;
      title: string;
      description: string;
      taskType: string;
      dueDate: bigint;
      assignedTo: string;
    }
  >({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<FollowUpTask>
        >
      ).createFollowUpTask(
        data.leadId,
        data.title,
        data.description,
        data.taskType,
        data.dueDate,
        data.assignedTo,
      );
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ["myTasks"] });
      queryClient.invalidateQueries({
        queryKey: ["tasks", "lead", task.leadId],
      });
      queryClient.invalidateQueries({ queryKey: ["overdueTasks"] });
    },
  });
}

export function useCompleteFollowUpTask() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<FollowUpTask, Error, string>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<FollowUpTask>
        >
      ).completeFollowUpTask(id);
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ["myTasks"] });
      queryClient.invalidateQueries({
        queryKey: ["tasks", "lead", task.leadId],
      });
      queryClient.invalidateQueries({ queryKey: ["overdueTasks"] });
    },
  });
}

export function useDeleteFollowUpTask() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<boolean>
        >
      ).deleteFollowUpTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTasks"] });
      queryClient.invalidateQueries({ queryKey: ["overdueTasks"] });
    },
  });
}

// ==================== Timeline / Activities ====================

export function useLeadTimeline(leadId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["timeline", leadId],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown[]>
        >
      ).getLeadTimeline(leadId);
    },
    enabled: !!actor && !isFetching && !!leadId,
  });
}

// ==================== Documents ====================

export function useGetDocumentsByLead(leadId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["documents", leadId],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown[]>
        >
      ).getDocumentsByLead(leadId);
    },
    enabled: !!actor && !isFetching && !!leadId,
  });
}

export function useAddDocument() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    Error,
    { leadId: string; name: string; fileType: string; url: string }
  >({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown>
        >
      ).addDocument(data.leadId, data.name, data.fileType, data.url);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["documents", vars.leadId] });
    },
  });
}

export function useDeleteDocument() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, { docId: string; leadId: string }>({
    mutationFn: async (data) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<boolean>
        >
      ).deleteDocument(data.docId);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["documents", vars.leadId] });
    },
  });
}

// ==================== Dashboard & Analytics ====================

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor)
        return {
          totalLeads: 0,
          qualifiedLeads: 0,
          conversions: 0,
          revenue: 0,
          followUpsDue: 0,
          overdueTasks: 0,
          activeLeads: 0,
          lostLeads: 0,
        };
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<DashboardStats>
        >
      ).getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLeadsByStatusCounts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Record<string, number>>({
    queryKey: ["leadsByStatusCounts"],
    queryFn: async () => {
      if (!actor) return {};
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Record<string, number>>
        >
      ).getLeadsByStatusCounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLeadsBySourceCounts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Record<string, number>>({
    queryKey: ["leadsBySourceCounts"],
    queryFn: async () => {
      if (!actor) return {};
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Record<string, number>>
        >
      ).getLeadsBySourceCounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetConversionFunnel() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["conversionFunnel"],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown[]>
        >
      ).getConversionFunnel();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCounselorStats() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CounselorStat[]>({
    queryKey: ["counselorStats"],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<CounselorStat[]>
        >
      ).getCounselorStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRecentActivities() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ActivityEntry[]>({
    queryKey: ["recentActivities"],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<ActivityEntry[]>
        >
      ).getRecentActivities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateSampleData() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<unknown, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<unknown>
        >
      ).generateSampleData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["myTasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}
