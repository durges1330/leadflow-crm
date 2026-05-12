import Map "mo:core/Map";
import Time "mo:core/Time";
import Common "../types/common";
import Types "../types/documents";

module {
  public type State = {
    documents : Map.Map<Common.DocumentId, Types.Document>;
    counters : { var nextDocumentId : Nat };
  };

  public func addDocument(
    state : State,
    caller : Common.UserId,
    leadId : Common.LeadId,
    filename : Text,
    storageUrl : Text,
    fileType : Text,
    fileSize : Nat,
  ) : Types.Document {
    let id = state.counters.nextDocumentId;
    state.counters.nextDocumentId += 1;
    let doc : Types.Document = {
      id;
      leadId;
      filename;
      storageUrl;
      fileType;
      fileSize;
      uploadedAt = Time.now();
      uploadedBy = caller;
    };
    state.documents.add(id, doc);
    doc;
  };

  public func getDocumentsByLead(state : State, leadId : Common.LeadId) : [Types.Document] {
    state.documents.values().filter(func(d : Types.Document) : Bool {
      d.leadId == leadId;
    }).toArray();
  };

  public func deleteDocument(state : State, id : Common.DocumentId, caller : Common.UserId) : Bool {
    switch (state.documents.get(id)) {
      case (?d) {
        // Only the uploader can delete
        if (d.uploadedBy != caller) {
          false;
        } else {
          state.documents.remove(id);
          true;
        };
      };
      case null false;
    };
  };
};
