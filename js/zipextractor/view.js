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
 * View for the Zip Extractor.
 * Depends on:
 *  zipextractor.Model
 *  zipextractor.Presenter
 *  zipextractor.Table
 *  zipextractor.PickerManager
 */
 
zipextractor.View = function(presenter, pickerManager) {
    this.model_ = null;
    this.presenter_ = presenter;    
    this.table_ = null;     
    this.pickerManager_ = pickerManager;    
    
    this.isInitialized_ = false;
        
    this.localFileInputEl = null;
    this.zipDropAreaDiv = null;
    
    this.chooseFileFromDriveButton = null;
    this.chooseLocalFileButton = null;
    this.resetButton = null;
    this.rateAppButton = null;
    this.viewFilesButton = null;
    this.retryErrorsButton = null;
    this.retryDownloadButton = null;
    this.shareFilesButton = null;
    this.cancelDownloadButton = null;
    
    this.downloadChromeButton = null;
    this.downloadFirefoxButton = null;
    this.downloadIeButton = null;
    
    this.destinationEl = null;
    
    this.fileTableDiv = null;
    this.fileTableHeaderEl = null;
    this.fileTable = null;
     
    this.primaryStatus = null;
    this.primaryStatusSpinner = null;
    this.primaryStatusProgress = null;
    this.primaryStatusText = null;
    this.primaryStatusProgressBar = null;
    
    this.selectAllCheckbox = null;
    this.extractNowButton = null;
    this.changeDestinationFolderButton = null;
    this.cancelSessionButton = null; 
    this.cancelExtractionButton = null;
};


zipextractor.View.APP_NAME_ = 'ZIP Extractor';


/**
 * Called only after DOM has loaded, since attaching to elements.
 */
zipextractor.View.prototype.init = function() {
    if (this.isInitialized_) {
        throw ('Error: View already initialized.');
    }

    this.attachDom_();
    this.attachListeners_();
    this.table_ = new zipextractor.Table(this.fileTable);
    this.isInitialized_ = true;
};


zipextractor.View.prototype.attachDom_ = function() {
    this.authButton = document.getElementById('authorizeButton');

    this.localFileInputEl = document.getElementById('filePicker');
    this.zipDropAreaDiv = document.getElementById('zipDropArea');
    
    this.chooseFileFromDriveButton = document.getElementById('chooseFromDriveButton');
    this.chooseLocalFileButton = document.getElementById('chooseLocalFileButton');
    this.resetButton = document.getElementById('resetButton');
    this.rateAppButton = document.getElementById('rateAppButton');
    this.viewFilesButton = document.getElementById('viewFilesButton');
    this.retryErrorsButton = document.getElementById('retryErrorsButton');
    this.retryDownloadButton = document.getElementById('retryDownloadButton');    
    this.shareFilesButton = document.getElementById('shareFilesButton');
    this.cancelDownloadButton = document.getElementById('cancelDownloadButton');
    
    this.downloadChromeButton = document.getElementById('downloadChromeButton');
    this.downloadFirefoxButton = document.getElementById('downloadFirefoxButton');
    this.downloadIeButton = document.getElementById('downloadIeButton');
    
    
    this.destinationEl = document.getElementById('destinationFolderName');
    
    this.fileTableDiv = document.getElementById('fileTableDiv');
     
    this.primaryStatus = document.getElementById('primaryStatus');
    this.primaryStatusSpinner = document.getElementById('primaryStatusSpinner');
    this.primaryStatusProgress = document.getElementById('primaryStatusProgress');
    this.primaryStatusText = document.getElementById('primaryStatusText');    
    this.primaryStatusProgressBar = document.getElementById('primaryStatusProgressBar');
    
    this.selectAllCheckbox = document.getElementById('selectAllCheckbox');
    this.extractNowButton = document.getElementById('extractNowButton');
    this.changeDestinationFolderButton = document.getElementById('changeDestinationFolderButton');
    this.cancelSessionButton = document.getElementById('cancelSessionButton');
    this.cancelExtractionButton = document.getElementById('cancelExtractionButton');
    
    this.fileTable = document.getElementById('fileTable');
    this.fileTableHeaderEl = document.getElementById('fileTableHeaderCaption');
};


zipextractor.View.prototype.attachListeners_ = function() {
    this.chooseLocalFileButton.onclick = zipextractor.util.bindFn(this.handleChooseLocalFile_, this);
    this.localFileInputEl.onchange = zipextractor.util.bindFn(this.handleLocalFileInputElChange_, this);    
    this.chooseFileFromDriveButton.onclick = zipextractor.util.bindFn(this.chooseFileFromDriveButtonClick_, this);
    this.changeDestinationFolderButton.onclick = zipextractor.util.bindFn(this.changeDestinationFolderButtonClick_, this); 
    this.resetButton.onclick = zipextractor.util.bindFn(this.handleResetButtonClick_, this);  
    this.rateAppButton.onclick = zipextractor.util.bindFn(this.handleRateAppButtonClick_, this);  
    this.authButton.onclick = zipextractor.util.bindFn(this.handleAuthButtonClick_, this);
    this.cancelSessionButton.onclick = zipextractor.util.bindFn(this.handleCancelSessionButtonClick_, this);
    this.extractNowButton.onclick = zipextractor.util.bindFn(this.handleExtractNowButtonClick_, this);
    this.cancelExtractionButton.onclick = zipextractor.util.bindFn(this.handleCancelExtractionButtonClick_, this);
    this.shareFilesButton.onclick = zipextractor.util.bindFn(this.handleShareFilesButtonClick_, this);
    this.viewFilesButton.onclick = zipextractor.util.bindFn(this.handleViewFilesButtonClick_, this);
    this.retryErrorsButton.onclick = zipextractor.util.bindFn(this.handleRetryErrorsButtonClick_, this);
    this.retryDownloadButton.onclick = zipextractor.util.bindFn(this.handleRetryDownloadButtonClick_, this);
    this.cancelDownloadButton.onclick = zipextractor.util.bindFn(this.handleCancelDownloadButtonClick_, this);
    this.downloadChromeButton.onclick = zipextractor.util.bindFn(this.handleDownloadChromeButtonClick_, this);
    this.downloadFirefoxButton.onclick = zipextractor.util.bindFn(this.handleDownloadFirefoxButtonClick_, this);
    this.downloadIeButton.onclick = zipextractor.util.bindFn(this.handleDownloadIeButtonClick_, this);
    this.selectAllCheckbox.onclick = zipextractor.util.bindFn(this.handleSelectAllCheckboxClick_, this);
    
    this.zipDropAreaDiv.ondragenter = zipextractor.util.bindFn(this.handleZipDropAreaDragEnter_, this);
    this.zipDropAreaDiv.ondragleave = zipextractor.util.bindFn(this.handleZipDropAreaDragLeave_, this);
    this.zipDropAreaDiv.ondragover = zipextractor.util.bindFn(this.handleZipDropAreaDragOver_, this);
    this.zipDropAreaDiv.ondrop = zipextractor.util.bindFn(this.handleZipDropAreaDrop_, this);
};


zipextractor.View.prototype.isSelected = function(entry) {
    return this.table_.isChecked(entry);
};


zipextractor.View.prototype.updateState = function(newState, oldState, opt_data) {
    if (!this.isInitialized_) {
        return;
    }
    
    switch (newState) {
        case zipextractor.state.SessionState.API_LOADED:
            break;
            
        case zipextractor.state.SessionState.UNSUPPORTED_BROWSER:
            this.updatePrimaryStatus_(true, false, 'Your browser version is not supported by ZIP Extractor. Please upgrade your browser.');
            this.showEl_(this.downloadChromeButton, true);
            this.showEl_(this.downloadFirefoxButton, true);    
            this.showEl_(this.downloadIeButton, true);    
            break;            

        case zipextractor.state.SessionState.READ_URL_STATE:
            break;

        case zipextractor.state.SessionState.AUTH_PENDING_AUTO:
            this.updatePrimaryStatus_(true, true, 'Checking authorization...');
            break;
            
        case zipextractor.state.SessionState.AUTH_PENDING_USER:
            this.authButton.disabled = true;
            this.updatePrimaryStatus_(true, true, 'Authorization pending... (Click "Accept" in ' + 
            'the popup window to authorize ZIP Extractor to use Google Drive.)');
            break;            
            
        case zipextractor.state.SessionState.AUTH_SUCCESS:
            this.authButton.disabled = true;
            this.showEl_(this.authButton, false);
            break;

        case zipextractor.state.SessionState.AUTH_ERROR:
        case zipextractor.state.SessionState.AUTH_REQUIRED:
            this.updatePrimaryStatus_(
                true, false, 'Please authorize ZIP Extractor to access to Google Drive. ' + 
                '(Click "Authorize" below.)');
            this.authButton.disabled = false;
            this.showEl_(this.authButton, true);
            break;
            
        case zipextractor.state.SessionState.CANCEL_DOWNLOAD_REQUESTED:
            this.enableEl_(this.cancelDownloadButton, false);    
            break;
            
        case zipextractor.state.SessionState.DOWNLOAD_CANCELED:
            this.showEl_(this.cancelDownloadButton, false);
            this.enableEl_(this.cancelDownloadButton, true);
            this.showEl_(this.retryDownloadButton, true);  
            this.showEl_(this.resetButton, true);
            this.updatePrimaryStatus_(true, false, 'Download canceled.');
            break;
                        
        case zipextractor.state.SessionState.DOWNLOADING_METADATA:
            this.showEl_(this.chooseFileFromDriveButton, false);
            this.showEl_(this.chooseLocalFileButton, false);
            this.zipDropAreaDiv.style.visibility = 'hidden';
            this.showEl_(this.cancelDownloadButton, true);    
            this.enableEl_(this.cancelDownloadButton, true);
            this.showEl_(this.retryDownloadButton, false);
            this.showEl_(this.resetButton, false);
            
            this.updatePrimaryStatus_(true, true, 'Preparing to download file...');
            break;
            
        case zipextractor.state.SessionState.DOWNLOADING:
            var file = opt_data;
            var statusText = 'Downloading "' + file.title + '" from Google Drive...';
            this.updatePrimaryStatus_(true, true, statusText);
            this.handleDownloadProgress(0, 100);
            break;
            
        case zipextractor.state.SessionState.DOWNLOAD_ALL_BYTES_TRANSFERRED:
            this.updatePrimaryStatus_(true, false, 'Finishing download...');
            break;                        
            
        case zipextractor.state.SessionState.DOWNLOADED:
            this.showEl_(this.cancelDownloadButton, false);
            this.updatePrimaryStatus_(true, false, 'File downloaded.');
            break;

        case zipextractor.state.SessionState.DOWNLOAD_ERROR:
            this.updateUiForDownloadError_(opt_data);
            break;

        case zipextractor.state.SessionState.INIT:
            // Can't update UI at this point in the session.
            break;
            
        case zipextractor.state.SessionState.ZIP_READ_ERROR:
            this.updatePrimaryStatus_(true, false, 'Error reading ZIP file: ' + opt_data);
            this.enableEl_(this.chooseFileFromDriveButton, true);
            this.enableEl_(this.chooseLocalFileButton, true);
            this.showEl_(this.chooseFileFromDriveButton, false);
            this.showEl_(this.chooseLocalFileButton, false);            
            this.showEl_(this.resetButton, true);
            this.showEl_(this.cancelExtractionButton, false);
            break;
            
        case zipextractor.state.SessionState.MODEL_BUILDING:
            this.updatePrimaryStatus_(true, true, 'Processing ZIP file...');
            break;            

        case zipextractor.state.SessionState.MODEL_BUILT:
            this.model_ = opt_data;
            break;
            
        case zipextractor.state.SessionState.SESSION_CANCELED:
            break;
            
        case zipextractor.state.SessionState.EXTRACTION_CANCEL_REQUESTED:
            this.updateUiForExtractionCancelRequested_();
            break;
            
        case zipextractor.state.SessionState.EXTRACTION_CANCELED:
            this.updateUiForExtractionCanceled_();
            break;            
                        
        case zipextractor.state.SessionState.RENDER_ZIP_UI:
            this.renderZipTableUi_(opt_data /* callback */);
            break;            
            
        case zipextractor.state.SessionState.PENDING_USER_INPUT:
            this.promptToExtract_();
            break;
            
        case zipextractor.state.SessionState.ZIP_READING:
            this.updatePrimaryStatus_(true, true, 'Reading ZIP file...');
            this.enableEl_(this.chooseFileFromDriveButton, false);
            this.enableEl_(this.chooseLocalFileButton, false);
            
            // Hide the element, but don't change position to prevent page flicker.
            this.zipDropAreaDiv.style.visibility = 'hidden';            
            break;           
            
        case zipextractor.state.SessionState.EXTRACTING:
            this.updateUiForExtractionStart_(opt_data);
            this.handleSessionProgress(0, 100);
            break;         
      
        case zipextractor.state.SessionState.NEW_SESSION:
            this.setupForNewSession_();
            break;
            
        case zipextractor.state.SessionState.EXTRACTION_COMPLETE:
            this.updateUiForExtractionComplete_(opt_data /* hasErrors */);
            break;

        default:
            throw('Unexpected state: ' + newState);   
    }
};


zipextractor.View.prototype.updateEntryState = function(entry, newState, oldState) {
    var progress = null;
    
    switch (newState) {
        case zipextractor.state.EntryState.QUEUED:
            break;
            
        case zipextractor.state.EntryState.QUEUED_PENDING_RETRY:
            break;

        case zipextractor.state.EntryState.SKIPPED:
            break;            
            
        case zipextractor.state.EntryState.PENDING:
            break;
            
        case zipextractor.state.EntryState.CANCELED:
            this.updateEntryIconForState_(entry, true);
            break;            

        case zipextractor.state.EntryState.BEGIN_UPLOAD:
            this.updateEntryIconForState_(entry, false);
            break;

        case zipextractor.state.EntryState.UPLOAD_PROGRESS:
            progress = Math.round((100 * entry.uploadCurrent) / entry.uploadTotal) + '%';
            break;
            
        case zipextractor.state.EntryState.UPLOAD_ALL_BYTES_TRANSFERRED:
            break;

        case zipextractor.state.EntryState.UPLOAD_COMPLETE:
            // Special call will come in for the icon.
            break;
            
        case zipextractor.state.EntryState.UPLOAD_ERROR:
            this.updateEntryIconForState_(entry, true);
            break;
            
        case zipextractor.state.EntryState.UPLOAD_ABORTED:
            this.updateEntryIconForState_(entry, true);
            break;
                        
        case zipextractor.state.EntryState.BEGIN_DECOMPRESSION:
            this.updateEntryIconForState_(entry, false);
            break;

        case zipextractor.state.EntryState.DECOMPRESSION_PROGRESS:
            progress = Math.round((100 * entry.decompressionCurrent) / entry.decompressionTotal) + '%';
            break;

        case zipextractor.state.EntryState.DECOMPRESSION_COMPLETE:
            break;
            
        // TODO: Decompression error possible via try/catch? Corrupted ZIP file?
            
       default:
            throw('Unexpected state: ' + newState);   
    }
    
    this.table_.updateEntryState(entry, newState, progress);
};


zipextractor.View.prototype.updateEntryIconForState_ = function(entry, complete) {
    // TODO: Additional icons for error, abort, etc.
    this.table_.updateEntryIcon(entry, undefined /* iconUrl */, !complete /* showSpinner */);      
};


// TODO - make a 'download progress' state (?)
zipextractor.View.prototype.handleDownloadProgress = function(current, total) {
    // Initial download amount is 5%, to show progress bar activity while waiting on first bytes.
    var percent = 5 + (95 * (current / total));    
    this.updatePrimaryStatus_(true, false, '', true, true, Math.round(percent));
};


zipextractor.View.prototype.handleSessionProgress = function(current, total) {
    // TODO: Consider consolidating these methods.
    var percent = (100 * (current / total));    
    this.updatePrimaryStatus_(true, false, '', true, true, Math.round(percent));
};


zipextractor.View.prototype.updatePageTitle = function(filename) {
    document.title = filename ? 
        filename + ' - ' + zipextractor.View.APP_NAME_ : 
        zipextractor.View.APP_NAME_;
};


zipextractor.View.prototype.updateUiForFileComplete = function(entry, openUrl, iconUrl) {
    if (openUrl) {
        this.table_.updateEntryLink(entry, openUrl);
    }
    
    // Clear the spinner icon and show either the icon for the uploaded file,
    // or a default icon.
    if (iconUrl) {
        this.table_.updateEntryIcon(entry, iconUrl);
    } else {
        this.updateEntryIconForState_(entry, true);
    }
};


zipextractor.View.prototype.handleSelectAllCheckboxClick_ = function(e) {
    this.table_.handleSelectAllCheckboxClick(e.target.checked);
};

 
zipextractor.View.prototype.updatePrimaryStatus_ = 
    function(show, showSpinner, text, skipTextUpdate, showProgress, progressPercent) {

    if (!skipTextUpdate) {
        this.primaryStatusText.innerHTML = text || '';
    }
    
    this.showEl_(this.primaryStatusProgress, show);
    this.showEl_(this.primaryStatusSpinner, showSpinner);

    if (showProgress) {
        this.primaryStatusProgressBar.style.width = "" + progressPercent + "%";
    }
    
    this.showEl_(this.primaryStatusProgress, !!showProgress);
};


zipextractor.View.prototype.renderZipTableUi_ = function(callback) {
    this.fileTableHeaderEl.innerHTML = this.model_.getFilename();
    this.table_.generate(
        this.model_.getEntryTree(), 
        zipextractor.util.bindFn(this.zipTableUiRendered_, this, callback));
};


zipextractor.View.prototype.zipTableUiRendered_ = function(callback) {
    this.showEl_(this.fileTableDiv, true);
    callback();
};


zipextractor.View.prototype.updateUiForExtractionComplete_ = function(hasErrors) {
    this.showEl_(this.extractNowButton, false);
    this.showEl_(this.cancelExtractionButton, false);

    this.showEl_(this.viewFilesButton, true);
    this.showEl_(this.retryErrorsButton, hasErrors);
    this.showEl_(this.resetButton, true);
    this.showEl_(this.rateAppButton, !hasErrors);
    
    if (!hasErrors) {
        // Can only share files if a parent folder was created.
        this.showEl_(this.shareFilesButton, this.table_.isRootEntryFolderCreated());
    }

    var extractionCompleteText = hasErrors ? 
        'Extraction complete, but with one or more errors.' :
        'Extraction complete.';
    this.updatePrimaryStatus_(true, false, extractionCompleteText);
};


zipextractor.View.prototype.updateUiForExtractionStart_ = function(entryTree) {
    this.showEl_(this.extractNowButton, false);
    this.showEl_(this.cancelSessionButton, false);
    this.showEl_(this.changeDestinationFolderButton, false);
    this.showEl_(this.cancelExtractionButton, true);
    this.enableEl_(this.cancelExtractionButton, true);
    
    this.showEl_(this.retryErrorsButton, false);
    this.showEl_(this.viewFilesButton, false);
    this.showEl_(this.resetButton, false);
    this.showEl_(this.rateAppButton, false);
    
    this.enableEl_(this.selectAllCheckbox, false);
    this.table_.lockForSession(entryTree);
    
    this.updatePrimaryStatus_(true, false, 'Extracting ZIP file to Drive...');
};


zipextractor.View.prototype.setupForNewSession_ = function() {
    this.showEl_(this.extractNowButton, false);
    this.showEl_(this.cancelSessionButton, false);
    this.showEl_(this.changeDestinationFolderButton, false);
    this.showEl_(this.viewFilesButton, false);
    this.showEl_(this.retryErrorsButton, false);
    this.showEl_(this.retryDownloadButton, false);
    this.showEl_(this.shareFilesButton, false);
    this.showEl_(this.resetButton, false);
    this.showEl_(this.rateAppButton, false);
    this.showEl_(this.cancelDownloadButton, false);
    this.showEl_(this.fileTableDiv, false);
    
    this.showEl_(this.chooseFileFromDriveButton, true);
    this.showEl_(this.chooseLocalFileButton, true);
    this.enableEl_(this.chooseFileFromDriveButton, true);
    this.enableEl_(this.chooseLocalFileButton, true);
    
    this.showEl_(this.zipDropAreaDiv, true);
    this.zipDropAreaDiv.style.visibility = '';
    
    this.table_.clear();
    this.enableEl_(this.selectAllCheckbox, true);
    
    this.updatePrimaryStatus_(true, false, 'Choose a ZIP file to extract.');
};


zipextractor.View.prototype.promptToExtract_ = function() {
    this.updatePrimaryStatus_(true, false, 'Ready to extract ZIP file.');

    this.showEl_(this.extractNowButton, true);
    this.showEl_(this.cancelSessionButton, true);
    this.showEl_(this.changeDestinationFolderButton, true);
    this.showEl_(this.chooseFileFromDriveButton, false);
    this.showEl_(this.chooseLocalFileButton, false);
    this.showEl_(this.zipDropAreaDiv, false);
    this.showEl_(this.cancelDownloadButton, false);
};


zipextractor.View.prototype.updateUiForExtractionCancelRequested_ = function() {
    this.enableEl_(this.cancelExtractionButton, false);    
    this.updatePrimaryStatus_(true, false, 'Canceling extraction...');
};


zipextractor.View.prototype.updateUiForExtractionCanceled_ = function() {
    this.showEl_(this.cancelExtractionButton, false);
    this.showEl_(this.viewFilesButton, true);
    this.showEl_(this.retryErrorsButton, false);
    this.showEl_(this.resetButton, true);
    
    this.updatePrimaryStatus_(true, false, 'Extraction canceled.');
};


zipextractor.View.prototype.updateUiForDownloadError_ = function(error) {
    this.showEl_(this.cancelDownloadButton, false);
    this.showEl_(this.retryDownloadButton, true);    
    this.showEl_(this.resetButton, true);
    
    this.updatePrimaryStatus_(true, false, 'Unable to download file. (' + error + ')');
};


zipextractor.View.prototype.updateDestinationFolderUi = function(folder) {
    var link = zipextractor.util.createDriveFolderLink(folder.id); 
    var statusHtml =  'Ready to extract ZIP file to "<a target="_blank" href="' + link + '">' + folder.name + '</a>".';
    
    this.updatePrimaryStatus_(true, false, statusHtml);
};


zipextractor.View.prototype.handleChooseLocalFile_ = function(e) {
    this.localFileInputEl.click();
};


zipextractor.View.prototype.chooseFileFromDriveButtonClick_ = function(e) {
    this.pickerManager_.show(
        zipextractor.util.PickerManager.PickerMode.FILE, 
        zipextractor.util.bindFn(this.handlePickerFileSelected_, this));
};


zipextractor.View.prototype.changeDestinationFolderButtonClick_ = function(e) {
    this.pickerManager_.show(
        zipextractor.util.PickerManager.PickerMode.FOLDER, 
        zipextractor.util.bindFn(this.handlePickerFolderSelected_, this));
};


zipextractor.View.prototype.handlePickerFileSelected_ = function(file) {
    this.presenter_.VIEW__driveFileChosen(file);
};


zipextractor.View.prototype.handlePickerFolderSelected_ = function(folder) {
    this.presenter_.VIEW__driveFolderChosen(folder);
};


zipextractor.View.prototype.handleLocalFileInputElChange_ = function(e) {
    var file = e.target.files[0];
    if (file) {
        this.presenter_.VIEW__localBlobChosen(file.name, file);
    }
};


zipextractor.View.prototype.handleZipDropAreaDragEnter_ = function(e) {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.allowedEffect = 'copyMove';
  this.zipDropAreaDiv.classList.add('zipDropAreaHover');    
};


zipextractor.View.prototype.handleZipDropAreaDragLeave_ = function(e) {
  e.stopPropagation();
  e.preventDefault();
  this.zipDropAreaDiv.classList.remove('zipDropAreaHover');    
};


zipextractor.View.prototype.handleZipDropAreaDragOver_ = function(e) {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
};


zipextractor.View.prototype.handleZipDropAreaDrop_ = function(e) {
  e.stopPropagation();
  e.preventDefault();
  this.zipDropAreaDiv.classList.remove('zipDropAreaHover');

  var files = e.dataTransfer.files;
  if (files && files.length == 1) {
    var file = files[0];
    var filename = file.name;
    var requiredExtension = '.zip';
    if (filename.indexOf(requiredExtension, filename.length - requiredExtension.length) !== -1) {
      this.presenter_.VIEW__localBlobChosen(file.name, file);
    }
  }
};


zipextractor.View.prototype.handleAuthButtonClick_ = function(e) {
    this.presenter_.VIEW__authRequested();   
};


zipextractor.View.prototype.handleExtractNowButtonClick_ = function(e) {
    this.presenter_.VIEW__extractNow();   
};


zipextractor.View.prototype.handleCancelSessionButtonClick_ = function() {
    this.presenter_.VIEW__cancelSession();   
};


zipextractor.View.prototype.handleResetButtonClick_ = function() {
    this.presenter_.VIEW__reset();
};


zipextractor.View.prototype.handleRateAppButtonClick_ = function() {
    this.presenter_.VIEW__rateApp();
};


zipextractor.View.prototype.showEl_ = function(el, show) {
    el.style.display = show ? '' : 'none';
};


zipextractor.View.prototype.enableEl_ = function(el, enable) {
    el.disabled = !enable;
};


zipextractor.View.prototype.handleCancelExtractionButtonClick_ = function(e) {
    this.presenter_.VIEW__cancelExtraction();
};


zipextractor.View.prototype.handleViewFilesButtonClick_ = function(e) {
    this.presenter_.VIEW__viewExtractedFiles();
};


zipextractor.View.prototype.handleRetryErrorsButtonClick_ = function(e) {
    this.presenter_.VIEW__retryErrors();
};


zipextractor.View.prototype.handleRetryDownloadButtonClick_ = function(e) {
    this.presenter_.VIEW__retryDownload();
};


zipextractor.View.prototype.handleShareFilesButtonClick_ = function(e) {
    this.presenter_.VIEW__shareExtractedFiles();
};


zipextractor.View.prototype.handleCancelDownloadButtonClick_ = function(e) {
    this.presenter_.VIEW__cancelDownload();
};


zipextractor.View.prototype.handleDownloadChromeButtonClick_ = function(e) {
    this.presenter_.VIEW__downloadBrowser('chrome');
};


zipextractor.View.prototype.handleDownloadFirefoxButtonClick_ = function(e) {
    this.presenter_.VIEW__downloadBrowser('firefox');
};


zipextractor.View.prototype.handleDownloadIeButtonClick_ = function(e) {
    this.presenter_.VIEW__downloadBrowser('ie');
};


