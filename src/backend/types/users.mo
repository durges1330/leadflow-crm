import Common "common";

module {
  public type Role = {
    #Admin;
    #SalesManager;
    #Counselor;
    #Telecaller;
  };

  public type UserProfile = {
    id : Common.UserId;
    name : Text;
    email : Text;
    role : Role;
    avatar : Text;
    createdAt : Common.Timestamp;
    var aiApiKey : Text;
  };

  public type UserProfilePublic = {
    id : Common.UserId;
    name : Text;
    email : Text;
    role : Role;
    avatar : Text;
    createdAt : Common.Timestamp;
  };
};
