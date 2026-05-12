import Common "common";

module {
  public type Document = {
    id : Common.DocumentId;
    leadId : Common.LeadId;
    filename : Text;
    storageUrl : Text;
    fileType : Text;
    fileSize : Nat;
    uploadedAt : Common.Timestamp;
    uploadedBy : Common.UserId;
  };
};
