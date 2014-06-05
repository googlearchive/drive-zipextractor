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
 * URL state parser for drive API.
 */
 
 driveapi.UrlStateParser = function() {
   this.state_ = null;
 };
 
 
 driveapi.UrlStateParser.prototype.isParsed = function() {
     return (this.state_ != null);
 };


 driveapi.UrlStateParser.prototype.getState = function() {
     if (!this.state_) {
         this.parseState();
     }
     
     return this.state_;
 };


 driveapi.UrlStateParser.prototype.parseState = function() {
    var rawState = this.getUrlParam_('state');
    this.state_ = rawState ? JSON.parse(rawState) : {};
 };
 

 driveapi.UrlStateParser.prototype.getFolderId = function() {
     return this.getState().folderId;
 };


 driveapi.UrlStateParser.prototype.getAction = function() {
     return this.getState().action;
 };    


 driveapi.UrlStateParser.prototype.getFileId = function() {
     var ids = this.getState().ids;
     if (!ids) {
         return null;
     }
     return (ids.length && ids.length > 0) ? ids[0] : null;
 };
 

 driveapi.UrlStateParser.prototype.getUserId = function() {
     return this.getState().userId;
 };


 driveapi.UrlStateParser.prototype.isForCreateNew = function() {
     return this.getAction() != 'open' && !this.getFileId();
 };
 

 driveapi.UrlStateParser.prototype.isForOpen = function() {
     return this.getAction() == 'open' && !!this.getFileId();
 };         
 
 
 driveapi.UrlStateParser.prototype.getUrlParam_ = function(name) {
    name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
        results = regex.exec(location.search);
    return results === null ? '': decodeURIComponent(results[1].replace(/\+/g, ' '));
};
