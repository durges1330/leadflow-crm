import Map "mo:core/Map";
import List "mo:core/List";
import Common "../types/common";
import TaskTypes "../types/tasks";
import ActivityTypes "../types/activities";
import UserTypes "../types/users";
import TasksLib "../lib/tasks";
import ActivitiesLib "../lib/activities";

mixin (
  users : Map.Map<Common.UserId, UserTypes.UserProfile>,
  tasks : Map.Map<Common.TaskId, TaskTypes.FollowUpTask>,
  activities : List.List<ActivityTypes.ActivityEntry>,
  state : { var nextLeadId : Nat; var nextTaskId : Nat; var nextActivityId : Nat; var nextDocumentId : Nat },
) {
  func tasksStateWithCounters() : TasksLib.State {
    { tasks; counters = state };
  };

  public shared ({ caller }) func createFollowUpTask(input : TaskTypes.CreateTaskInput) : async TaskTypes.FollowUpTaskPublic {
    let result = TasksLib.createTask(tasksStateWithCounters(), caller, input);
    ignore ActivitiesLib.logActivity({ activities; counters = state }, caller, result.leadId, #TaskCreated, "Task created: " # result.title);
    result;
  };

  public query ({ caller }) func getFollowUpTask(id : Common.TaskId) : async ?TaskTypes.FollowUpTaskPublic {
    TasksLib.getTask({ tasks; counters = state }, id);
  };

  public shared ({ caller }) func completeFollowUpTask(id : Common.TaskId) : async TaskTypes.FollowUpTaskPublic {
    let result = TasksLib.completeTask(tasksStateWithCounters(), caller, id);
    ignore ActivitiesLib.logActivity({ activities; counters = state }, caller, result.leadId, #TaskCompleted, "Task completed: " # result.title);
    result;
  };

  public shared ({ caller }) func deleteFollowUpTask(id : Common.TaskId) : async Bool {
    TasksLib.deleteTask(tasksStateWithCounters(), id);
  };

  public query ({ caller }) func getTasksByLead(leadId : Common.LeadId) : async [TaskTypes.FollowUpTaskPublic] {
    TasksLib.getTasksByLead({ tasks; counters = state }, leadId);
  };

  public query ({ caller }) func getMyTasks() : async [TaskTypes.FollowUpTaskPublic] {
    TasksLib.getTasksByAssignee({ tasks; counters = state }, caller);
  };

  public query ({ caller }) func getOverdueTasks() : async [TaskTypes.FollowUpTaskPublic] {
    TasksLib.getOverdueTasks({ tasks; counters = state });
  };
};
