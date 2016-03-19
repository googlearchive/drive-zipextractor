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
 * File Manager and client library that wraps file management methods for the Drive API.
 */
 
driveapi.FileManager = function(authManager) {
    this.authManager_ = authManager;
    this.activeRequests_ = [];
};


driveapi.FileManager.ErrorType = {
    FORBIDDEN: 'forbidden', // 403
    FILE_NOT_FOUND: 'fileNotFound', // 404
    DEADLINE_EXCEEDED: 'deadlineExceeded', // 503
    SERVER_ERROR: 'serverError', // 500
    AUTH_ERROR: 'authError', // 401
    BAD_REQUEST: 'badRequest', // 400
    REQUEST_ABORTED: 'requestAborted', // 0
    UNKNOWN: 'unknown' // default
};


driveapi.FileManager.ErrorMessage = {
    FORBIDDEN: 'There were too many recent requests; please wait a while and try again.', // 403
    FILE_NOT_FOUND: 'Unable to find the specified file; please check that it exists and try again.', // 404
    DEADLINE_EXCEEDED: 'The server took too long to respond; please try again.', // 503
    SERVER_ERROR: 'An internal server error occurred; please try again.', // 500
    AUTH_ERROR: 'An authorization error occured; please refresh this page and re-authorize.', // 401
    BAD_REQUEST: 'The server request could not be understood; please try again or report this error to the developers.', // 400
    REQUEST_ABORTED: 'The user canceled the request when it was still in progress.', // 0
    UNKNOWN: 'An unknown error occurred; please try again or report this error to the developers.' // default
};


driveapi.FileManager.ApiUrl_ = {
    UPLOAD: 'https://www.googleapis.com/upload/drive/v2/files/',
    STANDARD: 'https://www.googleapis.com/drive/v2/files/'
};


driveapi.FileManager.Method_ = {
    POST: 'POST',
    GET: 'GET',
    PUT: 'PUT'
};


driveapi.FileManager.CallbackType_ = {
    SUCCESS: 'success',
    ERROR: 'error',
    PROGRESS: 'progress',
    ABORT: 'abort'
};


driveapi.FileManager.MimeType_ = {
    JSON: 'application/json',
    FOLDER: 'application/vnd.google-apps.folder'
};


driveapi.FileManager.XhrResponseType_ = {
    BLOB: 'blob',
    JSON: 'json'
};


driveapi.FileManager.CRLF_ = '\r\n';

driveapi.FileManager.MULTIPART_BOUNDARY_ = '-------314159265358979323846';

driveapi.FileManager.MULTIPART_DELIMITER_ = 
    driveapi.FileManager.CRLF_ + '--' + 
    driveapi.FileManager.MULTIPART_BOUNDARY_ + 
    driveapi.FileManager.CRLF_;

driveapi.FileManager.MULTIPART_CLOSE_DELIMITER_ = 
    driveapi.FileManager.CRLF_ + '--' + 
    driveapi.FileManager.MULTIPART_BOUNDARY_ + '--';

driveapi.FileManager.MULTIPART_CONTENT_TYPE_ = 'multipart/mixed; boundary="' + 
    driveapi.FileManager.MULTIPART_BOUNDARY_ + '"';
    


driveapi.FileManager.prototype.generateCallbacks = function(successCb, errorCb, progressCb, abortCb) {
    var callbacks = {};
    callbacks[driveapi.FileManager.CallbackType_.SUCCESS] = successCb;
    callbacks[driveapi.FileManager.CallbackType_.ERROR] = errorCb;
    callbacks[driveapi.FileManager.CallbackType_.PROGRESS] = progressCb;
    callbacks[driveapi.FileManager.CallbackType_.ABORT] = abortCb;
    return callbacks;
};


driveapi.FileManager.prototype.abortAllRequests = function() {
    var requests = this.activeRequests_.slice(0);
    for (var i = 0; i < requests.length; i++) {
        var xhr = requests[i];
        if (xhr && xhr.abort) {
            xhr.abort();
        }
    }
};


driveapi.FileManager.prototype.abortDownload = function() {
    var activeDownloadXhr = this.getDownloadXhr_();    
    if (activeDownloadXhr) {
        activeDownloadXhr.abort();
    }
};


driveapi.FileManager.prototype.getDownloadXhr_ = function() {
    // TODO: Search for the correct XHR by property in active XHRs.
    // May return either the get() or the download() XHR.
    
    // Hmm, as a heuristic, it is always the first one?
    return this.activeRequests_.length > 0 ?
        this.activeRequests_[0] :
        null;
};


driveapi.FileManager.prototype.get = function(id, callbacks) {
    this.sendXhr_(
        driveapi.FileManager.Method_.GET,
        driveapi.FileManager.ApiUrl_.STANDARD + id,
        {}, /* params */
        undefined, /* body */
        driveapi.FileManager.MimeType_.JSON,
        driveapi.FileManager.XhrResponseType_.JSON, /* responseType */
        callbacks);
};


driveapi.FileManager.prototype.download = function(id, metadataCallback, callbacks) {
    // Success callback here chains to the downloadFile callback, called when this is complete.
    // Progress callback is n/a.
    // Non-success callbacks (abort, error) stay the same.
    var getCallbacks = this.generateCallbacks(
        driveapi.bindFn(this.handleDownloadResponse_, this, metadataCallback, callbacks),
        callbacks[driveapi.FileManager.CallbackType_.ERROR],
        undefined, /* progress */
        callbacks[driveapi.FileManager.CallbackType_.ABORT]);
    
    this.get(id, getCallbacks);
};


driveapi.FileManager.prototype.handleDownloadResponse_ = function(metadataCallback, callbacks, file) {
    if (!file) {
        this.invokeCallback_(callbacks,
            driveapi.FileManager.CallbackType_.ERROR,
            driveapi.FileManager.ErrorType.UNKNOWN);
        return;
    }
    
    metadataCallback(file);
    this.downloadFile(file, callbacks);
};


driveapi.FileManager.prototype.downloadFile = function(file, callbacks) {
    // Prepend file onto the success callback method params.
    var successCallback = callbacks[driveapi.FileManager.CallbackType_.SUCCESS];
    
    callbacks[driveapi.FileManager.CallbackType_.SUCCESS] = 
        driveapi.bindFn(successCallback, this, file);
    
    this.sendXhr_(
        driveapi.FileManager.Method_.GET,
        file.downloadUrl,
        {}, /* params */
        undefined, /* body */
        undefined, /* contentType */
        driveapi.FileManager.XhrResponseType_.BLOB, /* responseType */
        callbacks);
};


driveapi.FileManager.prototype.insertBlob = function(blob, name, parentId, callbacks) {
    this.blobToBase64_(
        blob, 
        driveapi.bindFn(this.insertFileAsBase64_, this, name, parentId, callbacks));
};


driveapi.FileManager.prototype.insertFileAsBase64_ = function(name, parentId, callbacks, base64Data) {
    var metadata = this.generateDriveFileMetadata_(name, parentId);
    
    var multipartRequestBody =
        driveapi.FileManager.MULTIPART_DELIMITER_ +
        'Content-Type: ' + driveapi.FileManager.MimeType_.JSON + driveapi.FileManager.CRLF_ + driveapi.FileManager.CRLF_ +
        JSON.stringify(metadata) +
        driveapi.FileManager.MULTIPART_DELIMITER_ +
        'Content-Transfer-Encoding: base64' + driveapi.FileManager.CRLF_ + 
        driveapi.FileManager.CRLF_ +
        base64Data +
        driveapi.FileManager.MULTIPART_CLOSE_DELIMITER_;
     
    this.sendXhr_(
        driveapi.FileManager.Method_.POST,
        driveapi.FileManager.ApiUrl_.UPLOAD,
        {'uploadType': 'multipart'} /* params */,
        multipartRequestBody,
        driveapi.FileManager.MULTIPART_CONTENT_TYPE_,
        driveapi.FileManager.XhrResponseType_.JSON, /* responseType */
        callbacks);     
 };


driveapi.FileManager.prototype.insertFolder = function(name, parentId, callbacks) {
    var metadata = this.generateDriveFileMetadata_(name, parentId, driveapi.FileManager.MimeType_.FOLDER);
    
    this.sendXhr_(
        driveapi.FileManager.Method_.POST,
        driveapi.FileManager.ApiUrl_.STANDARD,
        {}, /* params */
        JSON.stringify(metadata), /* body */
        driveapi.FileManager.MimeType_.JSON,
        driveapi.FileManager.XhrResponseType_.JSON, /* responseType */
        callbacks);
};


driveapi.FileManager.prototype.sendXhr_ = function(method, baseUrl, params, body, contentType, responseType, callbacks) {
    var xhr = new XMLHttpRequest();
    this.activeRequests_.push(xhr); 

    var self = this;
    xhr.onreadystatechange = function(e) {   
        if (xhr.readyState == 4) {
            self.removePendingXhr_(xhr);
            if (xhr.status == 200 && xhr.response) {
                // Success. Return XHR response as JSON.
                // Note: Internet Explorer 10 (and others?) does not accept xhr.responseType = 'json'.
                // In this case, the string must be parsed to JSON manually.
                var response = xhr.response;
                if (xhr.responseType === '' && (typeof xhr.response === 'string')) {
                  response = JSON.parse(xhr.response);
                }
                self.invokeCallback_(callbacks, driveapi.FileManager.CallbackType_.SUCCESS, response);
            } else if (xhr.status === 0 || (xhr.status === 200 && !xhr.response)) {
                // Aborted, or null response with 'success' (200) code. Obvserved to mean 'abort'.
                var message = self.getErrorMessage_(driveapi.FileManager.ErrorType.REQUEST_ABORTED);
                self.invokeCallback_(callbacks, driveapi.FileManager.CallbackType_.ABORT, message);
            } else {
                // Error              
                var error = self.getErrorFromXhrStatus_(xhr.status);
                self.invokeCallback_(
                    callbacks, 
                    driveapi.FileManager.CallbackType_.ERROR,
                    error,
                    self.getErrorMessage_(error));
            }
        }
    };
    if (callbacks[driveapi.FileManager.CallbackType_.PROGRESS]) {            
        var progressFn = function(e) {
            if (e) {
                var current = e.position || e.loaded;
                var total = e.totalSize || e.total;        
                self.invokeCallback_(callbacks, driveapi.FileManager.CallbackType_.PROGRESS, current, total);       
            } 
        };
        
        if (method == driveapi.FileManager.Method_.GET) {
            xhr.onprogress = progressFn;
        } else {
            xhr.upload.onprogress = progressFn;
        }        
    }
    if (callbacks[driveapi.FileManager.CallbackType_.ERROR]) {
        xhr.onerror = function(e) {
            var error = self.getErrorFromXhrStatus_(xhr.status);
            var message = self.getErrorMessage_(error);
            message += ' [' + xhr.statusText + ']';

            if (e && e.error) {
                message += ' - ' + e.error;
            }
            
            self.removePendingXhr_(xhr);      
            self.invokeCallback_(
                callbacks, 
                driveapi.FileManager.CallbackType_.ERROR,
                error,
                self.getErrorMessage_(error));
        };
    }
    
    var corsUrl = this.buildCorsUrl_(baseUrl, params);
    
    xhr.open(method, corsUrl, true /* async */);
    xhr.responseType = responseType;
    
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.authManager_.getAccessToken());
    
    if (contentType) {
        xhr.setRequestHeader('Content-Type', contentType);
    }

    xhr.send(body);                  
};


driveapi.FileManager.prototype.generateDriveFileMetadata_ = function(name, opt_parentId, opt_mimeType) {
    var metadata = {
      'title': name
    };

    if (opt_parentId) {
        metadata.parents = [{'id': opt_parentId }];
    }
    
    if (opt_mimeType) {
        metadata.mimeType = opt_mimeType;
    }
    
    return metadata;
};
 
 
driveapi.FileManager.prototype.buildCorsUrl_ = function(baseUrl, params) {        
    var corsUrl = baseUrl;
    var query = this.buildQuery_(params);
    if (query) {
      corsUrl += '?' + query;
    }
    return corsUrl;
};


driveapi.FileManager.prototype.buildQuery_ = function(params) {
  params = params || {};
  return Object.keys(params).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
};


driveapi.FileManager.prototype.removePendingXhr_ = function(xhr) {
    // TODO: Improve O(n) linear search and array shift to map-based lookup and remove
    var idx = this.activeRequests_.indexOf(xhr);
    if (idx != -1) {
        this.activeRequests_.splice(idx, 1);
    }
};

driveapi.FileManager.prototype.invokeCallback_ = function(callbacks, callbackType, param1, param2) {
    var cb = callbacks[callbackType];
    if (cb) {
        cb(param1, param2);
    }
};


driveapi.FileManager.prototype.getErrorFromXhrStatus_ = function(xhrStatus) {
    switch (xhrStatus) {
        case 403:
            return driveapi.FileManager.ErrorType.FORBIDDEN;
        case 404:
            return driveapi.FileManager.ErrorType.FILE_NOT_FOUND;
        case 500:
            return driveapi.FileManager.ErrorType.SERVER_ERROR;
        case 503:
            return driveapi.FileManager.ErrorType.DEADLINE_EXCEEDED;
        case 401:
            return driveapi.FileManager.ErrorType.AUTH_ERROR;
        case 400:
            return driveapi.FileManager.ErrorType.BAD_REQUEST;
        case 0:
            return driveapi.FileManager.ErrorType.REQUEST_ABORTED;
        default:
            return driveapi.FileManager.ErrorType.UNKNOWN;
    }
};


driveapi.FileManager.prototype.getErrorMessage_ = function(error) {
    switch (error) {
        case driveapi.FileManager.ErrorType.FORBIDDEN:
            return driveapi.FileManager.ErrorMessage.FORBIDDEN;
        case driveapi.FileManager.ErrorType.FILE_NOT_FOUND:
            return driveapi.FileManager.ErrorMessage.FILE_NOT_FOUND;
        case driveapi.FileManager.ErrorType.SERVER_ERROR:
            return driveapi.FileManager.ErrorMessage.SERVER_ERROR;
        case driveapi.FileManager.ErrorType.DEADLINE_EXCEEDED:
            return driveapi.FileManager.ErrorMessage.DEADLINE_EXCEEDED;
        case driveapi.FileManager.ErrorType.AUTH_ERROR:
            return driveapi.FileManager.ErrorMessage.AUTH_ERROR;
        case driveapi.FileManager.ErrorType.BAD_REQUEST:
            return driveapi.FileManager.ErrorMessage.BAD_REQUEST;            
        case driveapi.FileManager.ErrorType.REQUEST_ABORTED:
            return driveapi.FileManager.ErrorMessage.REQUEST_ABORTED;
        default:
            return driveapi.FileManager.ErrorMessage.UNKNOWN;
    }
};


driveapi.FileManager.prototype.blobToBase64_ = function(blob, callback) {
  var reader = new FileReader();
  reader.onload = function() {
    var dataUrl = reader.result;
    var base64 = dataUrl.split(',')[1];
    callback(base64);
  };
  reader.readAsDataURL(blob);
};
