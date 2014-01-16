/**
 * URL state parser for drive API.
 */
 
 driveapi.UrlStateParser = function() {
   this.state_ = null;
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
