import Map "mo:core/Map";
import List "mo:core/List";
import Common "../types/common";
import LeadTypes "../types/leads";
import TaskTypes "../types/tasks";
import ActivityTypes "../types/activities";
import UserTypes "../types/users";
import LeadsLib "../lib/leads";
import ActivitiesLib "../lib/activities";

mixin (
  users : Map.Map<Common.UserId, UserTypes.UserProfile>,
  leads : Map.Map<Common.LeadId, LeadTypes.Lead>,
  tasks : Map.Map<Common.TaskId, TaskTypes.FollowUpTask>,
  activities : List.List<ActivityTypes.ActivityEntry>,
  state : { var nextLeadId : Nat; var nextTaskId : Nat; var nextActivityId : Nat; var nextDocumentId : Nat },
) {
  func leadsStateWithCounters() : LeadsLib.State {
    { leads; counters = state };
  };

  public shared ({ caller }) func createLead(input : LeadTypes.CreateLeadInput) : async LeadTypes.LeadPublic {
    let result = LeadsLib.createLead(leadsStateWithCounters(), caller, input);
    ignore ActivitiesLib.logActivity({ activities; counters = state }, caller, result.id, #LeadCreated, "Lead created: " # result.name);
    result;
  };

  public query ({ caller }) func getLead(id : Common.LeadId) : async ?LeadTypes.LeadPublic {
    LeadsLib.getLead(leadsStateWithCounters(), id);
  };

  public shared ({ caller }) func updateLead(id : Common.LeadId, input : LeadTypes.CreateLeadInput) : async LeadTypes.LeadPublic {
    let result = LeadsLib.updateLead(leadsStateWithCounters(), caller, id, input);
    ignore ActivitiesLib.logActivity({ activities; counters = state }, caller, id, #LeadUpdated, "Lead updated");
    result;
  };

  public shared ({ caller }) func updateLeadStatus(id : Common.LeadId, newStatus : LeadTypes.LeadStatus) : async LeadTypes.LeadPublic {
    let result = LeadsLib.updateLeadStatus(leadsStateWithCounters(), caller, id, newStatus);
    ignore ActivitiesLib.logActivity({ activities; counters = state }, caller, id, #StatusChange, "Status changed");
    result;
  };

  public shared ({ caller }) func assignLead(id : Common.LeadId, assignedUserId : ?Common.UserId) : async LeadTypes.LeadPublic {
    LeadsLib.assignLead(leadsStateWithCounters(), id, assignedUserId);
  };

  public shared ({ caller }) func updateLeadNotes(id : Common.LeadId, notes : Text) : async LeadTypes.LeadPublic {
    let result = LeadsLib.updateNotes(leadsStateWithCounters(), caller, id, notes);
    ignore ActivitiesLib.logActivity({ activities; counters = state }, caller, id, #NoteAdded, "Notes updated");
    result;
  };

  public shared ({ caller }) func updateLeadTags(id : Common.LeadId, tags : [Text]) : async LeadTypes.LeadPublic {
    LeadsLib.updateTags(leadsStateWithCounters(), id, tags);
  };

  public shared ({ caller }) func deleteLead(id : Common.LeadId) : async Bool {
    LeadsLib.deleteLead(leadsStateWithCounters(), id);
  };

  public query ({ caller }) func listLeads() : async [LeadTypes.LeadPublic] {
    LeadsLib.listLeads({ leads; counters = state });
  };

  public query ({ caller }) func filterLeads(filter : LeadTypes.LeadFilter) : async [LeadTypes.LeadPublic] {
    LeadsLib.filterLeads({ leads; counters = state }, filter);
  };

  public query ({ caller }) func getLeadsByStatus(status : LeadTypes.LeadStatus) : async [LeadTypes.LeadPublic] {
    LeadsLib.getLeadsByStatus({ leads; counters = state }, status);
  };

  public query ({ caller }) func getMyLeads() : async [LeadTypes.LeadPublic] {
    LeadsLib.getLeadsByAssignee({ leads; counters = state }, caller);
  };

  public shared ({ caller }) func importLeads(inputs : [LeadTypes.CreateLeadInput]) : async Nat {
    LeadsLib.importLeads(leadsStateWithCounters(), caller, inputs);
  };

  public shared ({ caller }) func generateSampleData() : async Nat {
    let sampleInputs : [LeadTypes.CreateLeadInput] = [
      { name = "Arjun Sharma"; phone = "+91-98765-43210"; email = "arjun.sharma@email.com"; courseInterest = "MBA - Finance"; source = #Website; campaign = "Google SEO"; assignedUserId = null; notes = "Very interested, called twice"; tags = ["hot", "finance"]; dealValue = 150000 },
      { name = "Priya Patel"; phone = "+91-87654-32109"; email = "priya.patel@email.com"; courseInterest = "Data Science"; source = #FacebookAds; campaign = "FB Summer 2024"; assignedUserId = null; notes = "Saw our ad, asked about EMI"; tags = ["warm", "data"]; dealValue = 120000 },
      { name = "Rahul Gupta"; phone = "+91-76543-21098"; email = "rahul.g@gmail.com"; courseInterest = "Full Stack Development"; source = #GoogleAds; campaign = "Google Tech 2024"; assignedUserId = null; notes = "Applied online"; tags = ["tech"]; dealValue = 80000 },
      { name = "Sneha Reddy"; phone = "+91-65432-10987"; email = "sneha.reddy@email.com"; courseInterest = "Digital Marketing"; source = #LandingPage; campaign = "Landing Digital Q3"; assignedUserId = null; notes = "Filled form for digital marketing course"; tags = ["marketing"]; dealValue = 60000 },
      { name = "Vikram Singh"; phone = "+91-54321-09876"; email = "vikram.s@email.com"; courseInterest = "MBA - Marketing"; source = #Referral; campaign = "Alumni Referral"; assignedUserId = null; notes = "Referred by existing student"; tags = ["referral", "hot"]; dealValue = 145000 },
      { name = "Anjali Mehta"; phone = "+91-43210-98765"; email = "anjali.m@email.com"; courseInterest = "UX Design"; source = #Website; campaign = "Organic"; assignedUserId = null; notes = "Downloaded brochure"; tags = ["design"]; dealValue = 75000 },
      { name = "Karan Joshi"; phone = "+91-32109-87654"; email = "karan.j@email.com"; courseInterest = "Cyber Security"; source = #ApiIntegration; campaign = "Partner Portal"; assignedUserId = null; notes = "Lead from partner website"; tags = ["tech", "warm"]; dealValue = 95000 },
      { name = "Divya Nair"; phone = "+91-21098-76543"; email = "divya.nair@email.com"; courseInterest = "Data Science"; source = #FacebookAds; campaign = "FB Summer 2024"; assignedUserId = null; notes = "Interested in weekend batch"; tags = ["data", "weekend"]; dealValue = 120000 },
      { name = "Aditya Kumar"; phone = "+91-10987-65432"; email = "aditya.k@email.com"; courseInterest = "Cloud Computing"; source = #GoogleAds; campaign = "Google Tech 2024"; assignedUserId = null; notes = "AWS certification interest"; tags = ["tech", "cloud"]; dealValue = 85000 },
      { name = "Meera Iyer"; phone = "+91-09876-54321"; email = "meera.iyer@email.com"; courseInterest = "MBA - HR"; source = #Website; campaign = "Google SEO"; assignedUserId = null; notes = "HR professional upskilling"; tags = ["hr", "warm"]; dealValue = 140000 },
      { name = "Rohan Desai"; phone = "+91-98761-23456"; email = "rohan.desai@email.com"; courseInterest = "Product Management"; source = #LandingPage; campaign = "Landing PM Q3"; assignedUserId = null; notes = "Tech background, wants PM role"; tags = ["pm", "hot"]; dealValue = 90000 },
      { name = "Kavya Sharma"; phone = "+91-87652-34567"; email = "kavya.s@email.com"; courseInterest = "Business Analytics"; source = #Referral; campaign = "Alumni Referral"; assignedUserId = null; notes = "Friend recommended"; tags = ["analytics", "referral"]; dealValue = 110000 },
      { name = "Nikhil Verma"; phone = "+91-76543-45678"; email = "nikhil.v@email.com"; courseInterest = "Full Stack Development"; source = #CsvUpload; campaign = "Imported Batch Oct"; assignedUserId = null; notes = "Bulk import lead"; tags = ["tech"]; dealValue = 78000 },
      { name = "Pooja Agarwal"; phone = "+91-65434-56789"; email = "pooja.a@email.com"; courseInterest = "Digital Marketing"; source = #ManualEntry; campaign = "Walk-in"; assignedUserId = null; notes = "Walk-in enquiry at office"; tags = ["marketing", "walk-in"]; dealValue = 55000 },
      { name = "Saurabh Tiwari"; phone = "+91-54325-67890"; email = "saurabh.t@email.com"; courseInterest = "MBA - Operations"; source = #Website; campaign = "Google SEO"; assignedUserId = null; notes = "Supply chain professional"; tags = ["operations"]; dealValue = 148000 },
    ];
    let createdIds = List.empty<Common.LeadId>();
    for (input in sampleInputs.values()) {
      let result = LeadsLib.createLead(leadsStateWithCounters(), caller, input);
      ignore ActivitiesLib.logActivity({ activities; counters = state }, caller, result.id, #LeadCreated, "Sample lead created: " # result.name);
      createdIds.add(result.id);
    };
    // Update statuses to show variety across the funnel
    let statuses : [LeadTypes.LeadStatus] = [
      #Contacted, #Interested, #Qualified, #FollowUpScheduled,
      #Won, #ProposalSent, #Lost, #NotInterested,
    ];
    for ((idx, leadId) in createdIds.enumerate()) {
      if (idx < statuses.size()) {
        ignore LeadsLib.updateLeadStatus(leadsStateWithCounters(), caller, leadId, statuses[idx]);
      };
    };
    createdIds.size();
  };
};
