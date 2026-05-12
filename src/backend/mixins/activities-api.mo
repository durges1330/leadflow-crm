import List "mo:core/List";
import Map "mo:core/Map";
import Common "../types/common";
import ActivityTypes "../types/activities";
import UserTypes "../types/users";
import ActivitiesLib "../lib/activities";

mixin (
  users : Map.Map<Common.UserId, UserTypes.UserProfile>,
  activities : List.List<ActivityTypes.ActivityEntry>,
  state : { var nextLeadId : Nat; var nextTaskId : Nat; var nextActivityId : Nat; var nextDocumentId : Nat },
) {
  func activitiesStateWithCounters() : ActivitiesLib.State {
    { activities; counters = state };
  };

  public query ({ caller }) func getLeadTimeline(leadId : Common.LeadId) : async [ActivityTypes.ActivityEntry] {
    ActivitiesLib.getActivitiesByLead(activitiesStateWithCounters(), leadId);
  };

  public query ({ caller }) func getRecentActivities(limit : Nat) : async [ActivityTypes.ActivityEntry] {
    ActivitiesLib.getRecentActivities(activitiesStateWithCounters(), limit);
  };

  public query ({ caller }) func getMyActivities() : async [ActivityTypes.ActivityEntry] {
    ActivitiesLib.getActivitiesByUser(activitiesStateWithCounters(), caller);
  };
};
