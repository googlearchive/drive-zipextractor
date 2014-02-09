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
 * Model for Zip Extractor.
 * 
 * Depends on:
 *   zipextractor.util
 *   zip
 */


zipextractor.Model = function() {
    this.filename_ = null;
    this.entryTree_ = null;
};


zipextractor.Model.EXTRACTED_FOLDER_SUFFIX_ = '(Unzipped Files)';


zipextractor.Model.prototype.getFilename = function() {
    return this.filename_;
};


zipextractor.Model.prototype.setFilename = function(filename) {
    if (this.filename_) {
        throw('Existing model must be cleared before existing filename can be updated.');
    }    
    this.filename_ = filename;
};


zipextractor.Model.prototype.getEntryTree = function() {
    return this.entryTree_;
};


zipextractor.Model.prototype.clear = function() {
    if (! (this.entryTree_ || this.filename_)) {
        throw('No exisitng model to clear.');
    }
    
    this.filename_ = null;
    delete this.entryTree_;
};


/**
 * Asynchronously builds the entry tree (model), calls the specified callback when complete.
 */
zipextractor.Model.prototype.build = function(entries, callback) {
    zipextractor.util.execLater(
        zipextractor.util.bindFn(this.buildInternal_, this, entries),
        callback);
};


/**
 * Synchronously builds the entry tree (model).
 */
zipextractor.Model.prototype.buildInternal_ = function(entries) {
    if (this.entryTree_) {
        throw('Existing model must be cleared before being built.');
    }
    
    var folderName = this.getFolderName_(this.filename_);
    
    this.entryTree_ = {
        'directory': true,
        'root': true,
        'name': folderName,
        'path': folderName,
        'children': {},
        'state': zipextractor.state.SessionState.DEFAULT
    };
    
    for (var i = 0; i < entries.length; i++) {
        this.insertEntry_(this.entryTree_, entries[i]);
    }
};


zipextractor.Model.prototype.insertEntry_ = function(rootEntry, entry) {
    // 'path' looks like dir1/dir2/file   {'directory'=false}
    // or                dir1/dir2/dir3/  {'directory'=true}

    var path = entry.filename;
    if (zipextractor.util.endsWith(path, '/')) {
        path = path.substring(0, path.length - 1);
    }

    var pathItems = path.split('/');
    var currentEntry = rootEntry;
    var currentPath = null;

    for (var i = 0; i < pathItems.length; i++) {
        var currentPathItem = pathItems[i];
        if (currentPath === null) {
            currentPath = currentPathItem;
        } else {
            currentPath = currentPath + '/' + currentPathItem;
        }

        var nextEntry = currentEntry.children[currentPathItem];

        if (!nextEntry) {
            // If it's not a final item, or;
            // it is a final item AND a directory, then:
            // Add it as a directory and continue.
            if ((i < pathItems.length - 1) || entry.directory) {
                nextEntry = {};
                nextEntry.directory = true;
                nextEntry.children = {};
            } else {
                // It's a leaf node file. Add it as a file. Use the actual entry.
                nextEntry = entry;
            }

            nextEntry.state = zipextractor.state.EntryState.DEFAULT;
            nextEntry.path = currentPath;
            nextEntry.name = currentPathItem;
            nextEntry.parentEntry = currentEntry;
            currentEntry.children[currentPathItem] = nextEntry;
        } else {
            // Entry already exists, continue another level deeper.
        }

        currentEntry = nextEntry;
    }
};

zipextractor.Model.prototype.getFolderName_ = function(filename) {
    return zipextractor.util.trimFileExtension(filename) + ' ' + 
        zipextractor.Model.EXTRACTED_FOLDER_SUFFIX_;
};
