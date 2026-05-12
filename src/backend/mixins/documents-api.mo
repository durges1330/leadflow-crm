import Map "mo:core/Map";
import List "mo:core/List";
import Common "../types/common";
import DocumentTypes "../types/documents";
import ActivityTypes "../types/activities";
import UserTypes "../types/users";
import DocumentsLib "../lib/documents";
import ActivitiesLib "../lib/activities";

mixin (
  users : Map.Map<Common.UserId, UserTypes.UserProfile>,
  documents : Map.Map<Common.DocumentId, DocumentTypes.Document>,
  activities : List.List<ActivityTypes.ActivityEntry>,
  state : { var nextLeadId : Nat; var nextTaskId : Nat; var nextActivityId : Nat; var nextDocumentId : Nat },
) {
  func documentsStateWithCounters() : DocumentsLib.State {
    { documents; counters = state };
  };

  public shared ({ caller }) func addDocument(
    leadId : Common.LeadId,
    filename : Text,
    storageUrl : Text,
    fileType : Text,
    fileSize : Nat,
  ) : async DocumentTypes.Document {
    let result = DocumentsLib.addDocument(documentsStateWithCounters(), caller, leadId, filename, storageUrl, fileType, fileSize);
    ignore ActivitiesLib.logActivity({ activities; counters = state }, caller, leadId, #DocumentUploaded, "Document uploaded: " # filename);
    result;
  };

  public query ({ caller }) func getDocumentsByLead(leadId : Common.LeadId) : async [DocumentTypes.Document] {
    DocumentsLib.getDocumentsByLead({ documents; counters = state }, leadId);
  };

  public shared ({ caller }) func deleteDocument(id : Common.DocumentId) : async Bool {
    DocumentsLib.deleteDocument(documentsStateWithCounters(), id, caller);
  };
};
