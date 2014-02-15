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


zipextractor.util = {};

zipextractor.util.IS_NATIVE_BIND_ =
    Function.prototype.bind && 
    Function.prototype.bind.toString().indexOf('native code') != -1;

zipextractor.util.bindFn = function(fn, selfObj, var_args) {
  if (zipextractor.util.IS_NATIVE_BIND_) {
    return fn.call.apply(fn.bind, arguments);
  } else {
    if (arguments.length > 2) {
      var boundArgs = Array.prototype.slice.call(arguments, 2);
      return function() {
        var newArgs = Array.prototype.slice.call(arguments);
        Array.prototype.unshift.apply(newArgs, boundArgs);
        return fn.apply(selfObj, newArgs);
      };
    } else {
      return function() {
        return fn.apply(selfObj, arguments);
      };
    }    
  }
};



/**
 * Async work queue.
 */
 
zipextractor.util.AsyncWorkQueue = function(maxWorkers) {
    this.workQueue_ = [];
    this.numCurrentWorkers_ = 0;
    this.maxWorkers_ = maxWorkers;
    
    this.runCompleteCallback_ = null;
    
    this.isRunning_ = false;
};


zipextractor.util.AsyncWorkQueue.prototype.enqueue = function(workItem) {
    this.workQueue_.push(workItem);
};


zipextractor.util.AsyncWorkQueue.prototype.run = function(callback) {
    this.runCompleteCallback_ = callback;

    this.isRunning_ = true;
    this.processQueue_();
};
    

zipextractor.util.AsyncWorkQueue.prototype.processQueue_ = function() {
    while (this.numCurrentWorkers_ < this.maxWorkers_ && !this.isEmpty()) {
        this.executeNextWorkItem_();
    }    
};

    
zipextractor.util.AsyncWorkQueue.prototype.stop = function() {
    this.workQueue_.length = 0;
    this.isRunning_ = false;    
};  

    
zipextractor.util.AsyncWorkQueue.prototype.isEmpty = function() {
    return this.workQueue_.length === 0;
};


zipextractor.util.AsyncWorkQueue.prototype.isActive = function() {
    return this.isRunning_ || !this.isDone();
};


zipextractor.util.AsyncWorkQueue.prototype.isDone = function() {
    return this.numCurrentWorkers_ === 0 && this.isEmpty();
};


zipextractor.util.AsyncWorkQueue.prototype.executeNextWorkItem_ = function() {     
    var workItem = this.workQueue_.shift();
    
    if (this.numCurrentWorkers_ > this.maxWorkers_) {
        throw('Error: too many workers');
    }
    
    // Execute the work item, which is to merely invoke a callback that is bound with parameters.
    this.numCurrentWorkers_++;
    workItem(zipextractor.util.bindFn(this.workItemComplete_, this));
};


zipextractor.util.AsyncWorkQueue.prototype.workItemComplete_ = function() {
    if (!this.isRunning_) {
        return;
    }
    
    this.numCurrentWorkers_--;
    
    if (this.numCurrentWorkers_ < 0) {
        throw('Error: too few workers.');
    }
    
    var isDone = this.isDone();
    
    if (isDone) {
        this.isRunning_ = false;
        if (this.runCompleteCallback_) {
            this.runCompleteCallback_();
        }
    } else {
        this.processQueue_();
    }
};



/**
 * Drive API Picker widget wrapper for Zip Extractor.
 * Depends on:
 *   driveapi.appconfig
 *   gapi
 *   google.picker
 */
 

// TODO: Minor friction here, picker manager relies on driveapi items.
zipextractor.util.PickerManager = function(appConfig, authManager) {
    this.appConfig_ = appConfig;
    this.authManager_ = authManager;
};


zipextractor.util.PickerManager.PickerMode = {
  FILE: 'file',
  FOLDER: 'folder'
};


zipextractor.util.PickerManager.prototype.show = function(pickerMode, callback) {
    var cb = zipextractor.util.bindFn(this.showInternal_, this, pickerMode, callback);
    var pickerParams = {
      'callback': cb
    };
    
    gapi.load('picker', pickerParams);
};


zipextractor.util.PickerManager.prototype.showInternal_ = function(pickerMode, callback) {
    if (pickerMode == zipextractor.util.PickerManager.PickerMode.FILE) {
        this.showFilePicker_(zipextractor.util.bindFn(this.itemChosenInternalCallback_, this, callback));
    } else if (pickerMode == zipextractor.util.PickerManager.PickerMode.FOLDER) {
        this.showFolderPicker_(zipextractor.util.bindFn(this.itemChosenInternalCallback_, this, callback));
    } else {
        throw('Unexpected Picker Mode: ' + pickerMode);
    }
};


zipextractor.util.PickerManager.prototype.itemChosenInternalCallback_ = function(callback, data) {
  if (data.action == google.picker.Action.PICKED) {
    var file = data.docs[0];
    callback(file);
  }
};


zipextractor.util.PickerManager.prototype.showFilePicker_ = function(callback) {
    var view = new google.picker.DocsView(google.picker.ViewId.DOCS)
        .setSelectFolderEnabled(false)
        .setIncludeFolders(false)
        .setMode(google.picker.DocsViewMode.LIST)
        .setMimeTypes("application/zip");

    var pickerBuilder = this.generatePickerBuilder_(view, callback);
    pickerBuilder.setTitle('Select a file');
    var picker = pickerBuilder.build();
    picker.setVisible(true);
};


zipextractor.util.PickerManager.prototype.showFolderPicker_ = function(callback) {
  var view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
    .setSelectFolderEnabled(true)
    .setIncludeFolders(true)
    .setMode(google.picker.DocsViewMode.LIST)
    .setMimeTypes('application/vnd.google-apps.folder');

    var pickerBuilder = this.generatePickerBuilder_(view, callback);
    pickerBuilder.setTitle('Select a folder');
    var picker = pickerBuilder.build();
    picker.setVisible(true);
};


zipextractor.util.PickerManager.prototype.generatePickerBuilder_ = function(view, callback) {
    return new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .setAppId(this.appConfig_.getAppId())
      .setOAuthToken(this.authManager_.getAccessToken())
      .setDeveloperKey(this.appConfig_.getApiKey())
      .setCallback(callback)
      .addView(view);
};


/**
 * Utility methods for ZIP Extractor.
 */ 

zipextractor.util.formatSize = function(size) {
    var i = 0;    
    do {
        size /= 1024;
        i++;
    } while (size > 1024);

    var value;
    if (i === 1) {
        value = Math.ceil(Math.max(size, zipextractor.util.MIN_VALUE_));
    } else {
        // MB or greater, use one-digit precision and round
        var tmp = Math.max(size, zipextractor.util.MIN_VALUE_);
        value = Math.round(tmp * Math.pow(10, 1)) / Math.pow(10, 1);
    }
    
    return value + ' ' + zipextractor.util.BYTE_UNITS_[i - 1];
};

zipextractor.util.BYTE_UNITS_ = ['KB', 'MB', 'GB', 'TB'];
zipextractor.util.MIN_VALUE_ = 0.1;

zipextractor.util.DRIVE_URL_ = 'https://drive.google.com/';
zipextractor.util.FOLDER_SUFFIX_ = '#folders/';

zipextractor.util.FILE_EXTENSION_REGEX_ = '/\\.[^/.]+$/';


zipextractor.util.endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};


zipextractor.util.trimFileExtension = function(filename) {
    return filename.replace(zipextractor.util.FILE_EXTENSION_REGEX_, '');
};


zipextractor.util.createDriveFolderLink = function(folderId) {
    return zipextractor.util.DRIVE_URL_ + (folderId ? zipextractor.util.FOLDER_SUFFIX_ + folderId : '');
};


zipextractor.util.isEmptyObject = function(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
};


zipextractor.util.getFileExtension = function(filename) {
    var a = filename.split('.');
    if (a.length === 1 || (a[0] === '' && a.length === 2)) {
        return '';  
    }
    return a.pop().toLowerCase();
};


zipextractor.util.execLater = function(fn, opt_callback) {
    window.setTimeout(function() {
        fn();
        if (opt_callback) {
            opt_callback();
        }
    }, 0);
};

zipextractor.util.isIE = function() {
    try {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1], 10) : false;
    } catch (err) {
        return false;
    }
};

