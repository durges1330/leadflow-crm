import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import Types "../types/leads";

module {
  public type State = {
    leads : Map.Map<Common.LeadId, Types.Lead>;
    counters : { var nextLeadId : Nat };
  };

  public func toPublic(lead : Types.Lead) : Types.LeadPublic {
    {
      id = lead.id;
      name = lead.name;
      phone = lead.phone;
      email = lead.email;
      courseInterest = lead.courseInterest;
      source = lead.source;
      campaign = lead.campaign;
      status = lead.status;
      assignedUserId = lead.assignedUserId;
      notes = lead.notes;
      tags = lead.tags;
      dealValue = lead.dealValue;
      createdAt = lead.createdAt;
      updatedAt = lead.updatedAt;
      statusHistory = lead.statusHistory;
    };
  };

  public func createLead(
    state : State,
    caller : Common.UserId,
    input : Types.CreateLeadInput,
  ) : Types.LeadPublic {
    let id = state.counters.nextLeadId;
    state.counters.nextLeadId += 1;
    let now = Time.now();
    let lead : Types.Lead = {
      id;
      name = input.name;
      phone = input.phone;
      email = input.email;
      courseInterest = input.courseInterest;
      source = input.source;
      campaign = input.campaign;
      var status = #NewLead;
      var assignedUserId = input.assignedUserId;
      var notes = input.notes;
      var tags = input.tags;
      var dealValue = input.dealValue;
      createdAt = now;
      var updatedAt = now;
      var statusHistory = [{ status = #NewLead; changedAt = now; changedBy = caller }];
    };
    state.leads.add(id, lead);
    toPublic(lead);
  };

  public func getLead(state : State, id : Common.LeadId) : ?Types.LeadPublic {
    switch (state.leads.get(id)) {
      case (?lead) ?toPublic(lead);
      case null null;
    };
  };

  public func updateLead(
    state : State,
    _caller : Common.UserId,
    id : Common.LeadId,
    input : Types.CreateLeadInput,
  ) : Types.LeadPublic {
    let lead = switch (state.leads.get(id)) {
      case (?l) l;
      case null Runtime.trap("Lead not found");
    };
    lead.notes := input.notes;
    lead.tags := input.tags;
    lead.dealValue := input.dealValue;
    lead.assignedUserId := input.assignedUserId;
    lead.updatedAt := Time.now();
    toPublic(lead);
  };

  public func updateLeadStatus(
    state : State,
    caller : Common.UserId,
    id : Common.LeadId,
    newStatus : Types.LeadStatus,
  ) : Types.LeadPublic {
    let lead = switch (state.leads.get(id)) {
      case (?l) l;
      case null Runtime.trap("Lead not found");
    };
    let now = Time.now();
    lead.status := newStatus;
    lead.updatedAt := now;
    let entry : Types.StatusHistoryEntry = { status = newStatus; changedAt = now; changedBy = caller };
    lead.statusHistory := lead.statusHistory.concat([entry]);
    toPublic(lead);
  };

  public func assignLead(
    state : State,
    id : Common.LeadId,
    assignedUserId : ?Common.UserId,
  ) : Types.LeadPublic {
    let lead = switch (state.leads.get(id)) {
      case (?l) l;
      case null Runtime.trap("Lead not found");
    };
    lead.assignedUserId := assignedUserId;
    lead.updatedAt := Time.now();
    toPublic(lead);
  };

  public func updateNotes(
    state : State,
    _caller : Common.UserId,
    id : Common.LeadId,
    notes : Text,
  ) : Types.LeadPublic {
    let lead = switch (state.leads.get(id)) {
      case (?l) l;
      case null Runtime.trap("Lead not found");
    };
    lead.notes := notes;
    lead.updatedAt := Time.now();
    toPublic(lead);
  };

  public func updateTags(
    state : State,
    id : Common.LeadId,
    tags : [Text],
  ) : Types.LeadPublic {
    let lead = switch (state.leads.get(id)) {
      case (?l) l;
      case null Runtime.trap("Lead not found");
    };
    lead.tags := tags;
    lead.updatedAt := Time.now();
    toPublic(lead);
  };

  public func deleteLead(state : State, id : Common.LeadId) : Bool {
    switch (state.leads.get(id)) {
      case (?_) {
        state.leads.remove(id);
        true;
      };
      case null false;
    };
  };

  public func listLeads(state : State) : [Types.LeadPublic] {
    state.leads.values().map<Types.Lead, Types.LeadPublic>(toPublic).toArray();
  };

  public func filterLeads(state : State, filter : Types.LeadFilter) : [Types.LeadPublic] {
    state.leads.values().filter(func(lead : Types.Lead) : Bool {
      let matchSource = switch (filter.source) {
        case (?s) lead.source == s;
        case null true;
      };
      let matchStatus = switch (filter.status) {
        case (?s) lead.status == s;
        case null true;
      };
      let matchAssigned = switch (filter.assignedUserId) {
        case (?uid) lead.assignedUserId == ?uid;
        case null true;
      };
      let matchCampaign = switch (filter.campaign) {
        case (?c) lead.campaign == c;
        case null true;
      };
      let matchTag = switch (filter.tag) {
        case (?t) lead.tags.any(func(tag : Text) : Bool { tag == t });
        case null true;
      };
      let matchFrom = switch (filter.fromDate) {
        case (?f) lead.createdAt >= f;
        case null true;
      };
      let matchTo = switch (filter.toDate) {
        case (?t) lead.createdAt <= t;
        case null true;
      };
      matchSource and matchStatus and matchAssigned and matchCampaign and matchTag and matchFrom and matchTo;
    }).map<Types.Lead, Types.LeadPublic>(toPublic).toArray();
  };

  public func getLeadsByStatus(state : State, status : Types.LeadStatus) : [Types.LeadPublic] {
    state.leads.values().filter(func(lead : Types.Lead) : Bool {
      lead.status == status;
    }).map<Types.Lead, Types.LeadPublic>(toPublic).toArray();
  };

  public func getLeadsByAssignee(state : State, userId : Common.UserId) : [Types.LeadPublic] {
    state.leads.values().filter(func(lead : Types.Lead) : Bool {
      lead.assignedUserId == ?userId;
    }).map<Types.Lead, Types.LeadPublic>(toPublic).toArray();
  };

  public func importLeads(
    state : State,
    caller : Common.UserId,
    inputs : [Types.CreateLeadInput],
  ) : Nat {
    var count = 0;
    for (input in inputs.values()) {
      ignore createLead(state, caller, input);
      count += 1;
    };
    count;
  };
};
