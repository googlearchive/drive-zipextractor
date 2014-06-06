// Copyright 2014 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * A Drive API Auth Manager for ZIP Extractor.
 * Depends on:
 *   gapi.auth
 *   driveapi.AppConfig
 */
 
driveapi.AuthManager = function(appConfig) {
    this.appConfig_ = appConfig;
};


driveapi.AuthManager.prototype.authorize = function(isImmediate, authResultCallback, opt_userId) {
    var authParams = {
        'client_id': this.appConfig_.getClientId(), 
        'scope': this.appConfig_.getScopes(),
        'immediate': isImmediate
    };
    
    if (opt_userId) {
      authParams['login_hint'] = opt_userId;
      authParams['authuser'] = -1;
    }
    
    try {
      gapi.auth.authorize(authParams, authResultCallback);
    } catch (err) {
      var authResult = {};
      authResult.error = err;
      authResultCallback(authResult);
    }
};


driveapi.AuthManager.prototype.getToken = function() {
    return gapi.auth.getToken();
};


driveapi.AuthManager.prototype.getAccessToken = function() {
    var token = this.getToken();
    return token ? token.access_token : null;
};
