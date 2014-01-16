
     
     function updateDestinationFolderInfo() {
        // updatePrimaryStatus(true, true, 'Downloading file info from Drive...');
        // TODO: Consider updating UI for destination folder (?)
        
        // The ID comes from parent ID as specified in the state...
        // Cannot get() 'root' with drive.file scope.
        var id = getParentFolderIdFromState();
        if (id) {
            getDriveFileMetadata(id, handleDestinationFolderSelected);
        } else {
            // Update the UI for 'root'.
            updateDestinationFolderUi('My Drive', 'https://drive.google.com/#my-drive');
        }
     }

    



    // TODO: "lookahead decompression" - 
    // Figure out how to parallelize this create with local decompression, via a work queue.
    // Probably simple enough to "prime the pump" by decompressing the first N things after the job to create the root folder
    // is done.
    // More generally, ALWAYS keep N things decompressed at all times, so there is ZERO delay between uploading a folder and uploading
    // those folders' files.
    // Relates to the idea of a work queue. pre-decompress as an optimization.







    

    
    // TODO: Here, we actually do need some sort of map or set of files that are still pending.
    // These get added.




