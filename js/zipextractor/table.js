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
 * UI Table for ZIP Extractor.
 * 
 * Depends on:
 *   zipextractor.util
 */
 
zipextractor.Table = function(tableEl) {
    this.tableEl_ = tableEl;
    this.rootEntry_ = null;
};


zipextractor.Table.INDENT_PX_ = 24;
zipextractor.Table.BASE_INDENT_PX_ = 5;

zipextractor.Table.UNCHECKED_COLOR_ = '#888';

zipextractor.Table.IMAGES_PATH_ = 'images/';

zipextractor.Table.Icon_ = {
    CONTAINER: 'folder.png',
    FOLDER: 'folder.png',
    FILE: 'file.png',
    SPINNER: 'spinner.gif'
};


zipextractor.Table.prototype.clear = function() {
    // Keep Offset for table header row.
    // TODO: Verify this is true.
    while (this.tableEl_.rows.length > 1) {
       this.tableEl_.deleteRow(1);
    }
    
    this.rootEntry_ = null;
};


zipextractor.Table.prototype.lockForSession = function(entryTree) {
    // Disable checkboxes

    // TODO: Consider a 'traverse' method on the model that emits Entries.
    this.getCheckboxForEntry_(entryTree).disabled = true;
    this.disableCheckboxesForChildren_(entryTree);
};


zipextractor.Table.prototype.updateChildEntryIndents_ = function(entry, amount) {
    for (var entryKey in entry.children) {        
        var child = entry.children[entryKey];
        this.shiftEntryPadding_(child, amount);
        if (child.directory) {
            this.updateChildEntryIndents_(child, amount);
        }
    }      
};


zipextractor.Table.prototype.shiftEntryPadding_ = function(entry, amount) {
    var cell = entry.tableRow.cells[0];
    var currentPaddingValue = parseInt(cell.style.paddingLeft, 10);
    this.setCellPaddingLeft_(cell, currentPaddingValue + amount);
};


zipextractor.Table.prototype.setCellPaddingLeft_ = function(cell, padding) {
    cell.style.paddingLeft = padding + 'px';
};


zipextractor.Table.prototype.disableCheckboxesForChildren_ = function(entry) {
    // TODO: Consider a 'traverse' method on the model that emits Entries.
    for (var entryKey in entry.children) {        
        var child = entry.children[entryKey];
        
        this.getCheckboxForEntry_(child).disabled = true;
        
        if (child.directory) {
            this.disableCheckboxesForChildren_(child);
        }
    }        
};


zipextractor.Table.prototype.isRootEntryFolderCreated = function() {
    return this.getCheckboxForEntry_(this.rootEntry_).checked;
};


zipextractor.Table.prototype.generate = function(entryTree, callback) {
    zipextractor.util.execLater(
        zipextractor.util.bindFn(this.generateInternal_, this, entryTree),
        callback);
};


/**
 * Synchronously renders the table.
 */
zipextractor.Table.prototype.generateInternal_ = function(entryTree) {
    this.clear(); 
    this.rootEntry_ = entryTree;
    
    // First child is at same depth as root node
    entryTree.tableRow = this.generateFileTableRow_(entryTree, 0 /* depth */);
    this.generateChildren_(entryTree, 1 /* depth */);    
};


zipextractor.Table.prototype.generateChildren_ = function(entry, depth) {
    // Proceed depth-first through the entry tree.
    for (var entryKey in entry.children) {        
        var child = entry.children[entryKey];    
        child.tableRow = this.generateFileTableRow_(child, depth);
        
        if (child.directory) {
            this.generateChildren_(child, depth + 1);
        }
    }    
};


zipextractor.Table.prototype.generateFileTableRow_ = function(entry, depth) {
    var row = this.tableEl_.insertRow(-1);
    var filenameCell = row.insertCell(0);
    var sizeCell = row.insertCell(1);
    var statusCell = row.insertCell(2);

    filenameCell.className = 'filenameCell';    
    sizeCell.className = 'sizeCell';
    statusCell.className = 'statusCell';
  
    filenameCell.style.paddingLeft = zipextractor.Table.BASE_INDENT_PX_ + 
        (zipextractor.Table.INDENT_PX_ * depth) + 'px';

    // Create the checkbox.
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.checked = "true";
    filenameCell.appendChild(checkbox);
    
    var self = this;
    checkbox.onclick = function(e) {
        self.handleCheckboxClick_(entry, e.target.checked);
    };
    
    var nameSpan = document.createElement('span');
    nameSpan.className = 'tableRowNameSpan';
    nameSpan.innerHTML = entry.name;
      
    var imgSrc = this.getDefaultIconForEntry_(entry);
    var altText = this.getDefaultAltTextForEntry_(entry);
  
    var img = document.createElement("img");
    img.className = 'tableRowIcon';
    img.setAttribute('src', imgSrc);
    img.setAttribute('alt', altText);

    filenameCell.appendChild(img);
    filenameCell.appendChild(nameSpan);

  if (!entry.directory && entry.uncompressedSize) {
    sizeCell.innerHTML = zipextractor.util.formatSize(entry.uncompressedSize);
  } else {
    sizeCell.innerHTML = '——';
  }
  return row;
};


zipextractor.Table.prototype.getDefaultIconForEntry_ = function(entry) {
    return zipextractor.Table.IMAGES_PATH_ + (entry.directory ? 
        (entry.root ? zipextractor.Table.Icon_.CONTAINER : zipextractor.Table.Icon_.FOLDER) : 
        zipextractor.Table.Icon_.FILE);
};


zipextractor.Table.prototype.getDefaultAltTextForEntry_ = function(entry) {
    return entry.directory ? 
        (entry.root ? 'Container icon' : 'Folder icon') : 
        'File icon';
};


zipextractor.Table.prototype.handleSelectAllCheckboxClick = function(checked) {
    var entryRoot = this.rootEntry_;
    var rootWasCheckedBefore = this.getCheckboxForEntry_(entryRoot).checked;
    
    this.setEntryChecked_(entryRoot, checked);
    this.setChildEntriesCheckState_(entryRoot, checked);    
    
    // If there is a change in the root checkbox, update the indents.
    if (rootWasCheckedBefore !== checked) {
        this.updateChildEntryIndents_(entryRoot, zipextractor.Table.INDENT_PX_ * (checked ? 1 : -1));
    }
};


zipextractor.Table.prototype.setEntryChecked_ = function(entry, checked) {
    this.getCheckboxForEntry_(entry).checked = checked;
    this.updateEntryRowStyle_(entry, checked);
};


zipextractor.Table.prototype.updateEntryRowStyle_ = function(entry, checked) {
    entry.tableRow.style.color = checked ? 'inherit' : zipextractor.Table.UNCHECKED_COLOR_;
};


zipextractor.Table.prototype.handleCheckboxClick_ = function(entry, checked) {
    this.updateEntryRowStyle_(entry, checked);
    
    // Checking root has no impact on children, it is independent.
    // Indentation must be updated.
    if (entry.root) {
        this.updateChildEntryIndents_(entry, zipextractor.Table.INDENT_PX_ * (checked ? 1 : -1));
        return;
    }
    
    // All parents must be checked, if child is checked.
    if (checked) {
        this.setParentEntriesCheckState_(entry, true);
    }
    
    // Only update children for 'uncheck' events, which is required.
    if (!checked && entry.directory) {
        this.setChildEntriesCheckState_(entry, false);
    }
};


zipextractor.Table.prototype.setChildEntriesCheckState_ = function(entry, checked) {
    // Proceed depth-first through the entry tree.
    for (var entryKey in entry.children) {        
        var child = entry.children[entryKey];
        
        this.setEntryChecked_(child, checked);
        
        if (child.directory) {
            this.setChildEntriesCheckState_(child, checked);
        }
    }    
};


zipextractor.Table.prototype.setParentEntriesCheckState_ = function(entry, checked) {
    var parent = entry.parentEntry;
    if (parent && !parent.root) {
        // Checked children do not enforce root being created
        this.setEntryChecked_(parent, checked);
        this.setParentEntriesCheckState_(parent, checked);
    }
};


zipextractor.Table.prototype.getCheckboxForEntry_ = function(entry) {
    return entry.tableRow.cells[0].firstChild;
};


zipextractor.Table.prototype.isChecked = function(entry) {
    return this.getCheckboxForEntry_(entry).checked;
};


zipextractor.Table.prototype.updateEntryState = function(entry, state, progress) {
    var status = '';
    if (state !== null) {
        status = this.translateEntryState_(state, entry);
    }
    if (progress !== null && progress !== -1) {
        status += ' (' + progress + ')';
    }
    
    entry.tableRow.cells[2].innerHTML = status;
};


zipextractor.Table.prototype.updateEntryIcon = function(entry, opt_iconUrl, showSpinner) {
    var iconSource = opt_iconUrl ?
      opt_iconUrl :
      (showSpinner ? 
          (zipextractor.Table.IMAGES_PATH_ + zipextractor.Table.Icon_.SPINNER) :
          this.getDefaultIconForEntry_(entry));

     var iconAltText = opt_iconUrl ?
        this.getDefaultAltTextForEntry_(entry) :
            (showSpinner ? 
                'Processing...' :
                this.getDefaultAltTextForEntry_(entry));
     
     var imgTag =  entry.tableRow.cells[0].children[1];
     imgTag.src = iconSource;
     imgTag.alt = iconAltText;
};


zipextractor.Table.prototype.updateEntryLink = function(entry, link) {
    var nameCell = this.getFilenameCell_(entry);
    nameCell.innerHTML = '<a target="_blank" href="' + link + '">' + nameCell.innerHTML + '</a>';     
};


zipextractor.Table.prototype.translateEntryState_ = function(state, entry) {
    switch (state) {
        case zipextractor.state.EntryState.QUEUED:
            return 'Queued';

        case zipextractor.state.EntryState.QUEUED_PENDING_RETRY:
            return 'Queued (Pending resolution of error on parent folder)';

        case zipextractor.state.EntryState.SKIPPED:
            return 'Skipped';

        case zipextractor.state.EntryState.PENDING:
            return 'Pending';

        case zipextractor.state.EntryState.WAITING:
            return 'Waiting';

        case zipextractor.state.EntryState.BEGIN_DECOMPRESSION:
            return 'Decompressing...';

        case zipextractor.state.EntryState.DECOMPRESSION_PROGRESS:
            return 'Decompressing...';

        case zipextractor.state.EntryState.DECOMPRESSION_COMPLETE:
            return 'Decompressed';

        case zipextractor.state.EntryState.BEGIN_UPLOAD:
            return 'Uploading...';

        case zipextractor.state.EntryState.UPLOAD_PROGRESS:
            return 'Uploading...';
            
        case zipextractor.state.EntryState.UPLOAD_ERROR:
            return 'Upload Error (' + entry.message + ')';

        case zipextractor.state.EntryState.UPLOAD_ALL_BYTES_TRANSFERRED:
            return 'Finishing...';
            
        case zipextractor.state.EntryState.UPLOAD_COMPLETE:
            return 'Uploaded';

        case zipextractor.state.EntryState.CANCELED:
            return 'Canceled';
            
        case zipextractor.state.EntryState.UPLOAD_ABORTED:
            return 'Aborted';

        default:
            return '';
    }
};


zipextractor.Table.prototype.getFilenameCell_ = function(entry) {
    return entry.tableRow.cells[0].children[2];
};

