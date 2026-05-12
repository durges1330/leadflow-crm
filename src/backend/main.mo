import Map "mo:core/Map";
import List "mo:core/List";
import Common "types/common";
import UserTypes "types/users";
import LeadTypes "types/leads";
import TaskTypes "types/tasks";
import ActivityTypes "types/activities";
import DocumentTypes "types/documents";
import UsersApi "mixins/users-api";
import LeadsApi "mixins/leads-api";
import TasksApi "mixins/tasks-api";
import ActivitiesApi "mixins/activities-api";
import DocumentsApi "mixins/documents-api";
import DashboardApi "mixins/dashboard-api";



actor {
  // ==================== State ====================
  let users = Map.empty<Common.UserId, UserTypes.UserProfile>();
  let leads = Map.empty<Common.LeadId, LeadTypes.Lead>();
  let tasks = Map.empty<Common.TaskId, TaskTypes.FollowUpTask>();
  let activities = List.empty<ActivityTypes.ActivityEntry>();
  let documents = Map.empty<Common.DocumentId, DocumentTypes.Document>();
  let state = {
    var nextLeadId : Nat = 0;
    var nextTaskId : Nat = 0;
    var nextActivityId : Nat = 0;
    var nextDocumentId : Nat = 0;
  };

  // ==================== Mixins ====================
  include UsersApi(users, state);
  include LeadsApi(users, leads, tasks, activities, state);
  include TasksApi(users, tasks, activities, state);
  include ActivitiesApi(users, activities, state);
  include DocumentsApi(users, documents, activities, state);
  include DashboardApi(users, leads, tasks);
};
