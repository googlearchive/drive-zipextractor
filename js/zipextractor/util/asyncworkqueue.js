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
