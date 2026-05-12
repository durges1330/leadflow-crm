import Common "common";

module {
  public type LeadStatus = {
    #NewLead;
    #Contacted;
    #Interested;
    #FollowUpScheduled;
    #Qualified;
    #ProposalSent;
    #Won;
    #Lost;
    #NotInterested;
  };

  public type LeadSource = {
    #Website;
    #LandingPage;
    #ManualEntry;
    #CsvUpload;
    #ApiIntegration;
    #FacebookAds;
    #GoogleAds;
    #Referral;
    #Other : Text;
  };

  public type StatusHistoryEntry = {
    status : LeadStatus;
    changedAt : Common.Timestamp;
    changedBy : Common.UserId;
  };

  public type Lead = {
    id : Common.LeadId;
    name : Text;
    phone : Text;
    email : Text;
    courseInterest : Text;
    source : LeadSource;
    campaign : Text;
    var status : LeadStatus;
    var assignedUserId : ?Common.UserId;
    var notes : Text;
    var tags : [Text];
    var dealValue : Nat;
    createdAt : Common.Timestamp;
    var updatedAt : Common.Timestamp;
    var statusHistory : [StatusHistoryEntry];
  };

  public type LeadPublic = {
    id : Common.LeadId;
    name : Text;
    phone : Text;
    email : Text;
    courseInterest : Text;
    source : LeadSource;
    campaign : Text;
    status : LeadStatus;
    assignedUserId : ?Common.UserId;
    notes : Text;
    tags : [Text];
    dealValue : Nat;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
    statusHistory : [StatusHistoryEntry];
  };

  public type LeadFilter = {
    source : ?LeadSource;
    status : ?LeadStatus;
    assignedUserId : ?Common.UserId;
    campaign : ?Text;
    tag : ?Text;
    fromDate : ?Common.Timestamp;
    toDate : ?Common.Timestamp;
  };

  public type CreateLeadInput = {
    name : Text;
    phone : Text;
    email : Text;
    courseInterest : Text;
    source : LeadSource;
    campaign : Text;
    assignedUserId : ?Common.UserId;
    notes : Text;
    tags : [Text];
    dealValue : Nat;
  };
};
