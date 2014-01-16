/**
 * A Drive API Auth Manager for ZIP Extractor.
 * Depends on:
 *   gapi.auth
 *   driveapi.AppConfig
 */
 
driveapi.AuthManager = function(appConfig) {
    this.appConfig_ = appConfig;
    this.token_ = null;
};


driveapi.AuthManager.prototype.authorize = function(isImmediate, authResultCallback) {
    var authParams = {
        'client_id': this.appConfig_.getClientId(), 
        'scope': this.appConfig_.getScopes(),
        'immediate': isImmediate
    };

    gapi.auth.authorize(authParams, authResultCallback);
};


driveapi.AuthManager.prototype.getToken = function() {
    if (!this.token_) {
        this.token_ = gapi.auth.getToken();
    }
    return this.token_;
};


driveapi.AuthManager.prototype.getAccessToken = function() {
    var token = this.getToken();
    return token ? token.access_token : null;
};
