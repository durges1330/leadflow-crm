import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import Types "../types/tasks";

module {
  public type State = {
    tasks : Map.Map<Common.TaskId, Types.FollowUpTask>;
    counters : { var nextTaskId : Nat };
  };

  // Nanoseconds per unit for recurring tasks
  let DAY_NS : Int = 86_400_000_000_000;
  let WEEK_NS : Int = 604_800_000_000_000;   // 7 days
  let MONTH_NS : Int = 2_592_000_000_000_000; // 30 days

  public func toPublic(task : Types.FollowUpTask) : Types.FollowUpTaskPublic {
    {
      id = task.id;
      leadId = task.leadId;
      taskType = task.taskType;
      title = task.title;
      dueDate = task.dueDate;
      assignedTo = task.assignedTo;
      taskStatus = task.taskStatus;
      recurring = task.recurring;
      nextRunDate = task.nextRunDate;
      createdAt = task.createdAt;
      createdBy = task.createdBy;
    };
  };

  public func createTask(
    state : State,
    caller : Common.UserId,
    input : Types.CreateTaskInput,
  ) : Types.FollowUpTaskPublic {
    let id = state.counters.nextTaskId;
    state.counters.nextTaskId += 1;
    let now = Time.now();
    let nextRunDate : ?Common.Timestamp = switch (input.recurring) {
      case (#None) null;
      case (#Daily) ?(input.dueDate + DAY_NS);
      case (#Weekly) ?(input.dueDate + WEEK_NS);
      case (#Monthly) ?(input.dueDate + MONTH_NS);
    };
    let task : Types.FollowUpTask = {
      id;
      leadId = input.leadId;
      taskType = input.taskType;
      title = input.title;
      dueDate = input.dueDate;
      assignedTo = input.assignedTo;
      var taskStatus = #Pending;
      recurring = input.recurring;
      var nextRunDate;
      createdAt = now;
      createdBy = caller;
    };
    state.tasks.add(id, task);
    toPublic(task);
  };

  public func getTask(state : State, id : Common.TaskId) : ?Types.FollowUpTaskPublic {
    switch (state.tasks.get(id)) {
      case (?t) ?toPublic(t);
      case null null;
    };
  };

  public func completeTask(
    state : State,
    _caller : Common.UserId,
    id : Common.TaskId,
  ) : Types.FollowUpTaskPublic {
    let task = switch (state.tasks.get(id)) {
      case (?t) t;
      case null Runtime.trap("Task not found");
    };
    task.taskStatus := #Completed;
    // If recurring, spawn the next occurrence
    switch (task.nextRunDate) {
      case (?nextDate) {
        let newId = state.counters.nextTaskId;
        state.counters.nextTaskId += 1;
        let newNextRunDate : ?Common.Timestamp = switch (task.recurring) {
          case (#None) null;
          case (#Daily) ?(nextDate + DAY_NS);
          case (#Weekly) ?(nextDate + WEEK_NS);
          case (#Monthly) ?(nextDate + MONTH_NS);
        };
        let newTask : Types.FollowUpTask = {
          id = newId;
          leadId = task.leadId;
          taskType = task.taskType;
          title = task.title;
          dueDate = nextDate;
          assignedTo = task.assignedTo;
          var taskStatus = #Pending;
          recurring = task.recurring;
          var nextRunDate = newNextRunDate;
          createdAt = Time.now();
          createdBy = task.createdBy;
        };
        state.tasks.add(newId, newTask);
      };
      case null {};
    };
    toPublic(task);
  };

  public func deleteTask(state : State, id : Common.TaskId) : Bool {
    switch (state.tasks.get(id)) {
      case (?_) {
        state.tasks.remove(id);
        true;
      };
      case null false;
    };
  };

  public func getTasksByLead(state : State, leadId : Common.LeadId) : [Types.FollowUpTaskPublic] {
    state.tasks.values().filter(func(t : Types.FollowUpTask) : Bool {
      t.leadId == leadId;
    }).map<Types.FollowUpTask, Types.FollowUpTaskPublic>(toPublic).toArray();
  };

  public func getTasksByAssignee(state : State, userId : Common.UserId) : [Types.FollowUpTaskPublic] {
    state.tasks.values().filter(func(t : Types.FollowUpTask) : Bool {
      t.assignedTo == userId;
    }).map<Types.FollowUpTask, Types.FollowUpTaskPublic>(toPublic).toArray();
  };

  public func getOverdueTasks(state : State) : [Types.FollowUpTaskPublic] {
    let now = Time.now();
    state.tasks.values().filter(func(t : Types.FollowUpTask) : Bool {
      t.taskStatus == #Overdue or (t.taskStatus == #Pending and t.dueDate < now);
    }).map<Types.FollowUpTask, Types.FollowUpTaskPublic>(toPublic).toArray();
  };

  public func getPendingTasks(state : State, userId : Common.UserId) : [Types.FollowUpTaskPublic] {
    state.tasks.values().filter(func(t : Types.FollowUpTask) : Bool {
      t.assignedTo == userId and t.taskStatus == #Pending;
    }).map<Types.FollowUpTask, Types.FollowUpTaskPublic>(toPublic).toArray();
  };

  // Mark past-due pending tasks as Overdue
  public func tickOverdue(state : State) {
    let now = Time.now();
    state.tasks.values().forEach(func(t : Types.FollowUpTask) {
      if (t.taskStatus == #Pending and t.dueDate < now) {
        t.taskStatus := #Overdue;
      };
    });
  };
};
