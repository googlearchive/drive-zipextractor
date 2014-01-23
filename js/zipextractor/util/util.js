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
