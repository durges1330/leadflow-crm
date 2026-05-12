import Common "common";

module {
  public type ActivityType = {
    #StatusChange;
    #NoteAdded;
    #TaskCreated;
    #TaskCompleted;
    #DocumentUploaded;
    #AiSummary;
    #LeadCreated;
    #LeadUpdated;
    #Called;
    #EmailSent;
    #WhatsappSent;
  };

  public type ActivityEntry = {
    id : Common.ActivityId;
    leadId : Common.LeadId;
    activityType : ActivityType;
    content : Text;
    createdAt : Common.Timestamp;
    createdBy : Common.UserId;
  };
};
