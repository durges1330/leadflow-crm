import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import Types "../types/activities";
import Array "mo:core/Array";

module {
  public type State = {
    activities : List.List<Types.ActivityEntry>;
    counters : { var nextActivityId : Nat };
  };

  public func logActivity(
    state : State,
    caller : Common.UserId,
    leadId : Common.LeadId,
    activityType : Types.ActivityType,
    content : Text,
  ) : Types.ActivityEntry {
    let id = state.counters.nextActivityId;
    state.counters.nextActivityId += 1;
    let entry : Types.ActivityEntry = {
      id;
      leadId;
      activityType;
      content;
      createdAt = Time.now();
      createdBy = caller;
    };
    state.activities.add(entry);
    entry;
  };

  public func getActivitiesByLead(state : State, leadId : Common.LeadId) : [Types.ActivityEntry] {
    state.activities.filter(func(a : Types.ActivityEntry) : Bool {
      a.leadId == leadId;
    }).toArray();
  };

  public func getRecentActivities(state : State, limit : Nat) : [Types.ActivityEntry] {
    let all = state.activities.toArray();
    let size = all.size();
    if (size <= limit) {
      all;
    } else {
      Array.tabulate<Types.ActivityEntry>(limit, func(i) { all[size - limit + i] });
    };
  };

  public func getActivitiesByUser(state : State, userId : Common.UserId) : [Types.ActivityEntry] {
    state.activities.filter(func(a : Types.ActivityEntry) : Bool {
      a.createdBy == userId;
    }).toArray();
  };
};
