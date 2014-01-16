/**
 * Data object class representing an app configuration for an app 
 * using Drive API.
 */

driveapi.AppConfig = function(appConfigDataObj) {
    this.clientId_ = appConfigDataObj.clientId;
    this.appId_ = appConfigDataObj.appId;
    this.scopes_ = appConfigDataObj.scopes;
    this.apiKey_ = appConfigDataObj.apiKey;
};


driveapi.AppConfig.prototype.getClientId = function() {
    return this.clientId_;
};


driveapi.AppConfig.prototype.getAppId = function() {
    return this.appId_;
};


driveapi.AppConfig.prototype.getScopes = function() {
    return this.scopes_;
};


driveapi.AppConfig.prototype.getApiKey = function() {
    return this.apiKey_;
};
