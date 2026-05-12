import Map "mo:core/Map";
import Common "../types/common";
import LeadTypes "../types/leads";
import TaskTypes "../types/tasks";
import DashboardLib "../lib/dashboard";
import UserTypes "../types/users";

mixin (
  users : Map.Map<Common.UserId, UserTypes.UserProfile>,
  leads : Map.Map<Common.LeadId, LeadTypes.Lead>,
  tasks : Map.Map<Common.TaskId, TaskTypes.FollowUpTask>,
) {
  public query ({ caller }) func getDashboardStats() : async DashboardLib.LeadStats {
    DashboardLib.getLeadStats(leads);
  };

  public query ({ caller }) func getTotalLeads() : async Nat {
    DashboardLib.getTotalLeads(leads);
  };

  public query ({ caller }) func getLeadsByStatusCounts() : async [(LeadTypes.LeadStatus, Nat)] {
    DashboardLib.getLeadsByStatus(leads);
  };

  public query ({ caller }) func getLeadsBySourceCounts() : async [(LeadTypes.LeadSource, Nat)] {
    DashboardLib.getLeadsBySource(leads);
  };

  public query ({ caller }) func getLeadsCreatedInPeriod(fromDate : Common.Timestamp, toDate : Common.Timestamp) : async Nat {
    DashboardLib.getLeadsCreatedInPeriod(leads, fromDate, toDate);
  };

  public query ({ caller }) func getConversionFunnel() : async [DashboardLib.FunnelStage] {
    DashboardLib.getConversionFunnel(leads);
  };

  public query ({ caller }) func getCounselorStats() : async [DashboardLib.CounselorStats] {
    DashboardLib.getCounselorStats(leads, tasks);
  };
};
