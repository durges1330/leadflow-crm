import Map "mo:core/Map";
import Common "../types/common";
import Types "../types/users";
import UsersLib "../lib/users";

mixin (
  users : Map.Map<Common.UserId, Types.UserProfile>,
  state : { var nextLeadId : Nat; var nextTaskId : Nat; var nextActivityId : Nat; var nextDocumentId : Nat },
) {
  let usersState : UsersLib.State = { users };

  public shared ({ caller }) func registerProfile(name : Text, email : Text, role : Types.Role, avatar : Text) : async Types.UserProfilePublic {
    UsersLib.createProfile(usersState, caller, name, email, role, avatar);
  };

  public shared ({ caller }) func getMyProfile() : async ?Types.UserProfilePublic {
    UsersLib.getProfile(usersState, caller);
  };

  public shared ({ caller }) func updateMyProfile(name : Text, email : Text, avatar : Text) : async Types.UserProfilePublic {
    UsersLib.updateProfile(usersState, caller, name, email, avatar);
  };

  public shared ({ caller }) func setUserRole(targetUser : Common.UserId, role : Types.Role) : async Types.UserProfilePublic {
    UsersLib.setRole(usersState, caller, targetUser, role);
  };

  public shared ({ caller }) func setMyAiApiKey(apiKey : Text) : async () {
    UsersLib.setAiApiKey(usersState, caller, apiKey);
  };

  public query ({ caller }) func listAllUsers() : async [Types.UserProfilePublic] {
    UsersLib.listUsers(usersState);
  };
};
