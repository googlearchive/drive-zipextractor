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
 * ZIP reader utility for Zip Extractor.
 */

zipextractor.ZipReader = function() {
};

// errorCallback will also be used for all subsequent entry.getData() calls.
zipextractor.ZipReader.prototype.read = function(blob, successCallback, errorCallback) {  
    zip.createReader(
        new zip.BlobReader(blob), 
        zipextractor.util.bindFn(this.readZipManifest_, this, successCallback),
        zipextractor.util.bindFn(this.handleError_, this, errorCallback));
};


zipextractor.ZipReader.prototype.readZipManifest_ = function(successCallback, reader) {
  reader.getEntries(
      zipextractor.util.bindFn(this.zipManifestReadComplete_, this, reader, successCallback));
};


zipextractor.ZipReader.prototype.zipManifestReadComplete_ = function(reader, successCallback, entries) {        
    reader.close(
        zipextractor.util.bindFn(this.readerClosed_, this, entries, successCallback));
};


zipextractor.ZipReader.prototype.readerClosed_ = function(entries, successCallback) {
    // Notify the presenter of read success.
    successCallback(entries);
};


zipextractor.ZipReader.prototype.handleError_ = function(errorCallback, err) {
    // Notify the presenter of read error.    
    errorCallback(err);
};
