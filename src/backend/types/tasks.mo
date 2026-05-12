import Common "common";

module {
  public type TaskType = {
    #Call;
    #Email;
    #Meeting;
    #Whatsapp;
    #Sms;
  };

  public type TaskStatus = {
    #Pending;
    #Completed;
    #Overdue;
  };

  public type RecurringType = {
    #None;
    #Daily;
    #Weekly;
    #Monthly;
  };

  public type FollowUpTask = {
    id : Common.TaskId;
    leadId : Common.LeadId;
    taskType : TaskType;
    title : Text;
    dueDate : Common.Timestamp;
    assignedTo : Common.UserId;
    var taskStatus : TaskStatus;
    recurring : RecurringType;
    var nextRunDate : ?Common.Timestamp;
    createdAt : Common.Timestamp;
    createdBy : Common.UserId;
  };

  public type FollowUpTaskPublic = {
    id : Common.TaskId;
    leadId : Common.LeadId;
    taskType : TaskType;
    title : Text;
    dueDate : Common.Timestamp;
    assignedTo : Common.UserId;
    taskStatus : TaskStatus;
    recurring : RecurringType;
    nextRunDate : ?Common.Timestamp;
    createdAt : Common.Timestamp;
    createdBy : Common.UserId;
  };

  public type CreateTaskInput = {
    leadId : Common.LeadId;
    taskType : TaskType;
    title : Text;
    dueDate : Common.Timestamp;
    assignedTo : Common.UserId;
    recurring : RecurringType;
  };
};
