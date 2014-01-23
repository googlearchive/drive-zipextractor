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
