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
 * ZIP Extractor Presenter. Controls flow of the app, updates the view.
 * 
 * Depends on: 
 *   zipextractor.state.SessionState
 *   zipextractor.util
 *   zipextractor.Model
 *   zipextractor.View
 *   driveapi.AuthManager
 *   driveapi.UrilStateParser
 *   driveApi.FileManager
 */

zipextractor.Presenter = function(appConfig) {
    this.appConfig_ = appConfig;

    this.model_ = new zipextractor.Model();
    this.urlStateParser_ = new driveapi.UrlStateParser();
    this.zipReader_ = new zipextractor.ZipReader();
    this.authManager_ = new driveapi.AuthManager(appConfig);
    this.fileManager_ = new driveapi.FileManager(this.authManager_);    

    var pickerManager = new zipextractor.util.PickerManager(appConfig, this.authManager_);
    this.view_ = new zipextractor.View(this, pickerManager);    

    this.state_ = zipextractor.state.SessionState.DEFAULT;    

    this.shareClient_ = null;
    this.htmlBodyLoaded_ = false;
    this.apiLoaded_ = false;
    this.sharingLoaded_ = false;
    this.currentSession_ = null;
    
    this.hasDownloadBeenAutoRetried_ = false;
    this.lastDownloadId_ = null;
};


/**
 * Flag indicating whether the app is in DEBUG mode. If set, authorization will be skipped,
 * and the app will have limited local functionality for ZIP processing, download, etc. 
 */
zipextractor.Presenter.IS_DEBUG_ = false;


/**
 * Handles when body onload() event is fired in the main HTML page.
 */
zipextractor.Presenter.prototype.onHtmlBodyLoaded = function() {
    this.htmlBodyLoaded_ = true;
    this.view_.init();
    
    if (!this.checkBrowser_()) {
        this.setState_(zipextractor.state.SessionState.UNSUPPORTED_BROWSER);
        return;
    }
    
    this.parseUrlState_();

    if (this.apiLoaded_) {
        this.authorize_(true /* isInvokedByApp */);
    }
    
    if (zipextractor.Presenter.IS_DEBUG_) {
        this.processRequestFromState_();
    }
};


/**
 * Handles when the Google JS API has loaded.
 */
zipextractor.Presenter.prototype.onGapiClientLoaded = function() {   
    if (!this.checkBrowser_()) {
        this.setState_(zipextractor.state.SessionState.UNSUPPORTED_BROWSER);
        return;
    }    
    
    this.apiLoaded_ = true;
    this.setState_(zipextractor.state.SessionState.API_LOADED);
    
    this.parseUrlState_();

    if (this.htmlBodyLoaded_) {
        this.authorize_(true /* isInvokedByApp */);        
    }

    // Load sharing widget.
    gapi.load('drive-share', zipextractor.util.bindFn(this.sharingLoadComplete_, this));
};


zipextractor.Presenter.prototype.parseUrlState_ = function() {
  if (!this.urlStateParser_.isParsed()) {
    this.setState_(zipextractor.state.SessionState.READ_URL_STATE);
    this.urlStateParser_.parseState();
  }
};


zipextractor.Presenter.prototype.sharingLoadComplete_ = function() {
    this.sharingLoaded_ = true;
};


// TODO: Should this be in the view?
zipextractor.Presenter.prototype.showSharingDialog_ = function(id) {
    if (!this.shareClient_) {
        this.shareClient_ = new gapi.drive.share.ShareClient(this.appConfig_.getAppId());
    }
    this.shareClient_.setItemIds([id]);
    this.shareClient_.showSettingsDialog();
};

zipextractor.Presenter.prototype.checkBrowser_ = function() {
    var isIE = zipextractor.util.isIE();
    return !isIE || (isIE && !(isIE <= 9));
};


zipextractor.Presenter.prototype.init = function() {
  // First initialization of the view.
  // TODO: This may be redundant with construction.
  this.setState_(zipextractor.state.SessionState.INIT);
};


zipextractor.Presenter.prototype.updateEntryState = function(entry, newState) {
    var oldState = entry.state;
    entry.state = newState;
    this.view_.updateEntryState(entry, newState, oldState);
};


zipextractor.Presenter.prototype.setState_ = function(newState, opt_data) {
    var oldState = this.state_;
    this.state_ = newState;
    this.view_.updateState(newState, oldState, opt_data);
};


zipextractor.Presenter.prototype.authorize_ = function(isInvokedByApp) {
    if (zipextractor.Presenter.IS_DEBUG_) {
        return;
    }
  
    var state = isInvokedByApp ?
        zipextractor.state.SessionState.AUTH_PENDING_AUTO :
        zipextractor.state.SessionState.AUTH_PENDING_USER;
    this.setState_(state);

    this.authManager_.authorize(
        isInvokedByApp, 
        zipextractor.util.bindFn(this.handleAuthResult_, this),
        this.urlStateParser_.getUserId());
};
 
 
zipextractor.Presenter.prototype.handleAuthResult_ = function(authResult) {
    if (authResult) {
        if (authResult.error) {
            this.setState_(zipextractor.state.SessionState.AUTH_ERROR, authResult.error);
        } else {
            this.setState_(zipextractor.state.SessionState.AUTH_SUCCESS);
            this.processRequestFromState_();            
        }
    } else {
        this.setState_(zipextractor.state.SessionState.AUTH_REQUIRED);
    }
};


zipextractor.Presenter.prototype.processRequestFromState_ = function() {
   if (this.urlStateParser_.isForOpen()) {
        // Download the file, read the ZIP, update UI.
        this.downloadFileById_(this.urlStateParser_.getFileId());
    } else {
        // Create New scenario, launched in zero state; setup new session UI.
        this.startNewSession_();
    }
};


zipextractor.Presenter.prototype.startNewSession_ = function() {
  this.view_.updatePageTitle();
  this.setState_(zipextractor.state.SessionState.NEW_SESSION);  
};


zipextractor.Presenter.prototype.downloadFileById_ = function(id) {
    // Store the most recent download ID to support retry.
    this.lastDownloadId_ = id;
    
    this.setState_(zipextractor.state.SessionState.DOWNLOADING_METADATA);
    var callbacks = this.fileManager_.generateCallbacks(
        zipextractor.util.bindFn(this.downloadFile_, this),
        zipextractor.util.bindFn(this.onDownloadError_, this),
        undefined /* progressCallback */,
        zipextractor.util.bindFn(this.onDownloadAborted_, this));
 
    this.fileManager_.get(id, callbacks);      
};


zipextractor.Presenter.prototype.downloadFile_ = function(file) {
    this.setState_(zipextractor.state.SessionState.DOWNLOADING, file);
    var fileSize = file.fileSize ? parseInt(file.fileSize, 10) : -1;
    var callbacks = this.fileManager_.generateCallbacks(
        zipextractor.util.bindFn(this.onDownloadSuccess_, this),
        zipextractor.util.bindFn(this.onDownloadError_, this),
        zipextractor.util.bindFn(this.onDownloadProgress_, this, fileSize),
        zipextractor.util.bindFn(this.onDownloadAborted_, this));

    this.fileManager_.downloadFile(file, callbacks);
};


zipextractor.Presenter.prototype.onDownloadSuccess_ = function(file, blob) {
    this.setState_(zipextractor.state.SessionState.DOWNLOADED);
    this.createSession_(file);
    this.initModel_(file.title, blob);
};


zipextractor.Presenter.prototype.onDownloadError_ = function(error, message) {
    // Auto-retry download once, including for both auth and transient errors.
    if (!this.hasDownloadBeenAutoRetried_) {
        this.hasDownloadBeenAutoRetried_ = true;
      
        // Check for auth error. Attempt re-auth in the background, then retry download.
        if (error == driveapi.FileManager.ErrorType.AUTH_ERROR) {
            this.setState_(zipextractor.state.SessionState.AUTH_PENDING_AUTO);                 
            this.authManager_.authorize(
                true /* isInvokedByApp */, 
                zipextractor.util.bindFn(this.downloadFileById_, this, this.lastDownloadId_));
        } else {      
            this.downloadFileById_(this.lastDownloadId_);
        }
    } else {
        this.setState_(zipextractor.state.SessionState.DOWNLOAD_ERROR, message);    
    }
};


zipextractor.Presenter.prototype.onDownloadProgress_ = function(fileSize, current, total) {
    // Don't show latent progress events that come in after download has been cancelled.
    if (this.state_ == zipextractor.state.SessionState.DOWNLOAD_CANCELED) {
      return;
    }
    
    if (fileSize != -1) {
      this.view_.handleDownloadProgress(current, fileSize);

      if (current === fileSize) {
        this.setState_(zipextractor.state.SessionState.DOWNLOAD_ALL_BYTES_TRANSFERRED);
      }
    }
};


zipextractor.Presenter.prototype.onDownloadAborted_ = function() {
    this.handleDownloadCanceled_();
};


zipextractor.Presenter.prototype.handleDownloadCanceled_ = function() {
    this.setState_(zipextractor.state.SessionState.DOWNLOAD_CANCELED);
};

 
zipextractor.Presenter.prototype.initModel_ = function(filename, blob) {
    this.view_.updatePageTitle(filename);
    this.setState_(zipextractor.state.SessionState.ZIP_READING);
    this.model_.setFilename(filename);
    
    this.zipReader_.read(
        blob, 
        zipextractor.util.bindFn(this.zipReadSuccess_, this),
        zipextractor.util.bindFn(this.zipReadError_, this));
};


zipextractor.Presenter.prototype.zipReadError_ = function(err) {
    // This is also called on a ZIP decompression error, including failed CRC checks.
    this.setState_(zipextractor.state.SessionState.ZIP_READ_ERROR, err);
};


zipextractor.Presenter.prototype.zipReadSuccess_ = function(entries) {
    this.setState_(zipextractor.state.SessionState.MODEL_BUILDING);
    this.model_.build(entries, zipextractor.util.bindFn(this.modelBuildComplete_, this));
};


zipextractor.Presenter.prototype.modelBuildComplete_ = function() {
    // TODO: Verify that we need to pass the model in this way.
    this.setState_(zipextractor.state.SessionState.MODEL_BUILT, this.model_);    
    this.setState_(
        zipextractor.state.SessionState.RENDER_ZIP_UI, 
        zipextractor.util.bindFn(this.zipUiRenderComplete_, this));    
};


zipextractor.Presenter.prototype.zipUiRenderComplete_ = function() {
    this.setState_(zipextractor.state.SessionState.PENDING_USER_INPUT);
};


zipextractor.Presenter.prototype.createSession_ = function(opt_file) {
    this.currentSession_ = new zipextractor.Session(
        this.urlStateParser_.getFolderId(), /* parentId */
        this,
        this.model_, 
        this.view_,
        this.fileManager_);
        
    if (opt_file) {
        this.currentSession_.updateParentIdByFile(opt_file);
    }
};


zipextractor.Presenter.prototype.extract_ = function(isForRetry) {
    this.setState_(zipextractor.state.SessionState.EXTRACTING, this.model_.getEntryTree());
    this.currentSession_.execute(isForRetry);
};


zipextractor.Presenter.prototype.reset_ = function() {
    if (this.currentSession_) {
        this.currentSession_.close();
        this.currentSession_ = null;
        this.model_.clear(); 
    }
    this.lastDownloadId_ = null;
    this.hasDownloadBeenAutoRetried_ = false;
};


zipextractor.Presenter.prototype.VIEW__authRequested = function() {
    this.authorize_(false /* isInvokedByApp */);
};


zipextractor.Presenter.prototype.VIEW__driveFileChosen = function(partialFile) {
    // File as returned from Picker is not a complete Drive File resource.
    // Must get full metadata to retrieve download URL.
    this.downloadFileById_(partialFile.id);
};


zipextractor.Presenter.prototype.VIEW__driveFolderChosen = function(folder) {
    this.currentSession_.setParentId(folder.id);
    this.view_.updateDestinationFolderUi(folder);    
};


zipextractor.Presenter.prototype.VIEW__localBlobChosen = function(filename, blob) {
    this.createSession_(undefined /* opt_file */);
    this.initModel_(filename, blob);
};


zipextractor.Presenter.prototype.VIEW__extractNow = function() {
    this.extract_(false /* isForRetry */);
};


zipextractor.Presenter.prototype.VIEW__cancelSession = function() {
    this.setState_(zipextractor.state.SessionState.SESSION_CANCELED);    
    this.reset_();
    this.startNewSession_();
};


zipextractor.Presenter.prototype.VIEW__reset = function() {
    this.reset_();
    this.startNewSession_();
};


zipextractor.Presenter.prototype.VIEW__rateApp = function() {
  var url = 'https://chrome.google.com/webstore/detail/zip-extractor/mmfcakoljjhncfphlflcedhgogfhpbcd/reviews?hl=en-US';
  window.open(url, '_blank').focus();
};


zipextractor.Presenter.prototype.VIEW__cancelExtraction = function() {
    this.setState_(zipextractor.state.SessionState.EXTRACTION_CANCEL_REQUESTED);
    this.currentSession_.abort();
};


zipextractor.Presenter.prototype.SESSION__extractionComplete = function() {
  var hasErrors = this.currentSession_.hasErrors();
  
  // Auto-retry once.
  if (hasErrors && !this.currentSession_.hasBeenRetried()) {
    // Check for auth error. Attempt re-auth in the background, then retry session.
    if (this.currentSession_.hasAuthErrors()) {
        this.setState_(zipextractor.state.SessionState.AUTH_PENDING_AUTO);                 
        this.authManager_.authorize(
            true /* isInvokedByApp */, 
            zipextractor.util.bindFn(this.extract_, this, true /* isForRetry */));
    } else {      
        this.extract_(true /* isForRetry */);
    }
  } else {
    this.setState_(zipextractor.state.SessionState.EXTRACTION_COMPLETE, hasErrors);    
  }
};


zipextractor.Presenter.prototype.SESSION__extractionCanceled = function() {
    this.setState_(zipextractor.state.SessionState.EXTRACTION_CANCELED);
};


zipextractor.Presenter.prototype.VIEW__shareExtractedFiles = function() {
    var parentId = this.getNewParentId_();
    if (parentId) {
        if (this.sharingLoaded_) {
            this.showSharingDialog_(this.getNewParentId_());
        }
    }
};


zipextractor.Presenter.prototype.VIEW__viewExtractedFiles = function() {
    var url = zipextractor.util.createDriveFolderLink(this.getNewParentId_());
    var extractedFilesWindow = window.open(url, '_blank');
    extractedFilesWindow.focus();    
};


zipextractor.Presenter.prototype.VIEW__retryErrors = function() {
    this.extract_(true /* isForRetry */);
};


zipextractor.Presenter.prototype.VIEW__retryDownload = function() {
  this.hasDownloadBeenAutoRetried_ = false;
  this.downloadFileById_(this.lastDownloadId_);  
};


zipextractor.Presenter.prototype.VIEW__downloadBrowser = function(browser) {
    var browserUrl = null;
    switch (browser) {
        case 'chrome':
            browserUrl = 'http://www.google.com/chrome';
            break;
            
        case 'firefox':
            browserUrl = 'http://www.mozilla.org/en-US/firefox/new/';
            break;
            
        case 'ie':
            browserUrl = 'http://windows.microsoft.com/en-us/internet-explorer/download-ie';
            break;
    }
    
    if (browserUrl) {
        var browserDownloadWindow = window.open(browserUrl, '_blank');
        browserDownloadWindow.focus();    
    }
};


zipextractor.Presenter.prototype.VIEW__cancelDownload = function() {
    this.setState_(zipextractor.state.SessionState.CANCEL_DOWNLOAD_REQUESTED);
    this.fileManager_.abortDownload();
};


zipextractor.Presenter.prototype.getNewParentId_ = function() {
    // Get the 'folder' attribute on the root node of the entry tree.
    var entryTree = this.model_.getEntryTree();
    if (entryTree && entryTree.folder) {
        return entryTree.folder.id;
    } else if (this.currentSession_ && this.currentSession_.getParentId()) {
        return this.currentSession_.getParentId();
    } else {
        return null;   
    }
};
