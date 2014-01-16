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
