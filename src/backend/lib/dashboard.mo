import Map "mo:core/Map";
import List "mo:core/List";
import Common "../types/common";
import LeadTypes "../types/leads";
import TaskTypes "../types/tasks";
import UserTypes "../types/users";

module {
  public type LeadStats = {
    totalLeads : Nat;
    byStatus : [(LeadTypes.LeadStatus, Nat)];
    bySource : [(LeadTypes.LeadSource, Nat)];
    wonLeads : Nat;
    totalDealValue : Nat;
    conversionRate : Nat;
  };

  public type CounselorStats = {
    userId : Common.UserId;
    totalAssigned : Nat;
    totalFollowedUp : Nat;
    totalConverted : Nat;
  };

  public type FunnelStage = {
    status : LeadTypes.LeadStatus;
    count : Nat;
  };

  public func getTotalLeads(leads : Map.Map<Common.LeadId, LeadTypes.Lead>) : Nat {
    leads.size();
  };

  public func getLeadsByStatus(
    leads : Map.Map<Common.LeadId, LeadTypes.Lead>
  ) : [(LeadTypes.LeadStatus, Nat)] {
    let statuses : [LeadTypes.LeadStatus] = [
      #NewLead, #Contacted, #Interested, #FollowUpScheduled, #Qualified,
      #ProposalSent, #Won, #Lost, #NotInterested,
    ];
    statuses.map<LeadTypes.LeadStatus, (LeadTypes.LeadStatus, Nat)>(func(s) {
      let count = leads.values().filter(func(l : LeadTypes.Lead) : Bool { l.status == s }).size();
      (s, count);
    });
  };

  public func getLeadsBySource(
    leads : Map.Map<Common.LeadId, LeadTypes.Lead>
  ) : [(LeadTypes.LeadSource, Nat)] {
    let sources : [LeadTypes.LeadSource] = [
      #Website, #LandingPage, #ManualEntry, #CsvUpload,
      #ApiIntegration, #FacebookAds, #GoogleAds, #Referral,
    ];
    sources.map<LeadTypes.LeadSource, (LeadTypes.LeadSource, Nat)>(func(src) {
      let count = leads.values().filter(func(l : LeadTypes.Lead) : Bool { l.source == src }).size();
      (src, count);
    });
  };

  public func getLeadsCreatedInPeriod(
    leads : Map.Map<Common.LeadId, LeadTypes.Lead>,
    fromDate : Common.Timestamp,
    toDate : Common.Timestamp,
  ) : Nat {
    leads.values().filter(func(l : LeadTypes.Lead) : Bool {
      l.createdAt >= fromDate and l.createdAt <= toDate;
    }).size();
  };

  public func getLeadStats(leads : Map.Map<Common.LeadId, LeadTypes.Lead>) : LeadStats {
    let total = leads.size();
    var wonCount = 0;
    var totalDeal = 0;
    leads.values().forEach(func(l : LeadTypes.Lead) {
      if (l.status == #Won) wonCount += 1;
      totalDeal += l.dealValue;
    });
    let conversionRate = if (total == 0) 0 else (wonCount * 100) / total;
    {
      totalLeads = total;
      byStatus = getLeadsByStatus(leads);
      bySource = getLeadsBySource(leads);
      wonLeads = wonCount;
      totalDealValue = totalDeal;
      conversionRate;
    };
  };

  public func getConversionFunnel(
    leads : Map.Map<Common.LeadId, LeadTypes.Lead>
  ) : [FunnelStage] {
    let statuses : [LeadTypes.LeadStatus] = [
      #NewLead, #Contacted, #Interested, #FollowUpScheduled, #Qualified,
      #ProposalSent, #Won,
    ];
    statuses.map<LeadTypes.LeadStatus, FunnelStage>(func(s) {
      let count = leads.values().filter(func(l : LeadTypes.Lead) : Bool { l.status == s }).size();
      { status = s; count };
    });
  };

  public func getCounselorStats(
    leads : Map.Map<Common.LeadId, LeadTypes.Lead>,
    tasks : Map.Map<Common.TaskId, TaskTypes.FollowUpTask>,
  ) : [CounselorStats] {
    // Gather unique assigned user IDs
    let counselorIds = List.empty<Common.UserId>();
    leads.values().forEach(func(l : LeadTypes.Lead) {
      switch (l.assignedUserId) {
        case (?uid) {
          if (not counselorIds.any(func(id : Common.UserId) : Bool { id == uid })) {
            counselorIds.add(uid);
          };
        };
        case null {};
      };
    });
    counselorIds.map<Common.UserId, CounselorStats>(func(uid) {
      let totalAssigned = leads.values().filter(func(l : LeadTypes.Lead) : Bool {
        l.assignedUserId == ?uid;
      }).size();
      let totalConverted = leads.values().filter(func(l : LeadTypes.Lead) : Bool {
        l.assignedUserId == ?uid and l.status == #Won;
      }).size();
      let totalFollowedUp = tasks.values().filter(func(t : TaskTypes.FollowUpTask) : Bool {
        t.assignedTo == uid and t.taskStatus == #Completed;
      }).size();
      { userId = uid; totalAssigned; totalFollowedUp; totalConverted };
    }).toArray();
  };
};
