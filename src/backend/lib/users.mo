import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import Types "../types/users";

module {
  public type State = {
    users : Map.Map<Common.UserId, Types.UserProfile>;
  };

  public func toPublic(p : Types.UserProfile) : Types.UserProfilePublic {
    { id = p.id; name = p.name; email = p.email; role = p.role; avatar = p.avatar; createdAt = p.createdAt };
  };

  public func createProfile(
    state : State,
    caller : Common.UserId,
    name : Text,
    email : Text,
    role : Types.Role,
    avatar : Text,
  ) : Types.UserProfilePublic {
    let profile : Types.UserProfile = {
      id = caller;
      name;
      email;
      role;
      avatar;
      createdAt = Time.now();
      var aiApiKey = "";
    };
    state.users.add(caller, profile);
    toPublic(profile);
  };

  public func getProfile(state : State, userId : Common.UserId) : ?Types.UserProfilePublic {
    switch (state.users.get(userId)) {
      case (?p) ?toPublic(p);
      case null null;
    };
  };

  public func updateProfile(
    state : State,
    caller : Common.UserId,
    name : Text,
    email : Text,
    avatar : Text,
  ) : Types.UserProfilePublic {
    let existing = switch (state.users.get(caller)) {
      case (?p) p;
      case null Runtime.trap("Profile not found");
    };
    let updated : Types.UserProfile = {
      id = existing.id;
      name;
      email;
      role = existing.role;
      avatar;
      createdAt = existing.createdAt;
      var aiApiKey = existing.aiApiKey;
    };
    state.users.add(caller, updated);
    toPublic(updated);
  };

  public func setRole(
    state : State,
    caller : Common.UserId,
    targetUser : Common.UserId,
    role : Types.Role,
  ) : Types.UserProfilePublic {
    // Caller must be Admin
    switch (state.users.get(caller)) {
      case (?p) {
        if (p.role != #Admin) Runtime.trap("Unauthorized: Admin role required");
      };
      case null Runtime.trap("Caller not found");
    };
    let existing = switch (state.users.get(targetUser)) {
      case (?p) p;
      case null Runtime.trap("Target user not found");
    };
    let updated : Types.UserProfile = {
      id = existing.id;
      name = existing.name;
      email = existing.email;
      role;
      avatar = existing.avatar;
      createdAt = existing.createdAt;
      var aiApiKey = existing.aiApiKey;
    };
    state.users.add(targetUser, updated);
    toPublic(updated);
  };

  public func setAiApiKey(state : State, caller : Common.UserId, apiKey : Text) {
    let profile = switch (state.users.get(caller)) {
      case (?p) p;
      case null Runtime.trap("Profile not found");
    };
    profile.aiApiKey := apiKey;
  };

  public func getAiApiKey(state : State, caller : Common.UserId) : Text {
    switch (state.users.get(caller)) {
      case (?p) p.aiApiKey;
      case null "";
    };
  };

  public func listUsers(state : State) : [Types.UserProfilePublic] {
    state.users.values().map<Types.UserProfile, Types.UserProfilePublic>(toPublic).toArray();
  };

  public func requireRole(state : State, caller : Common.UserId, roles : [Types.Role]) {
    let profile = switch (state.users.get(caller)) {
      case (?p) p;
      case null Runtime.trap("Unauthorized: not registered");
    };
    let hasRole = roles.any(func(r : Types.Role) : Bool { r == profile.role });
    if (not hasRole) Runtime.trap("Unauthorized: insufficient role");
  };

  public func isAdmin(state : State, caller : Common.UserId) : Bool {
    switch (state.users.get(caller)) {
      case (?p) p.role == #Admin;
      case null false;
    };
  };

  public func getRole(state : State, caller : Common.UserId) : ?Types.Role {
    switch (state.users.get(caller)) {
      case (?p) ?p.role;
      case null null;
    };
  };
};
