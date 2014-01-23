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
 * Main bootloader for ZIP Extractor.
 * Requires: zipextractor
 */
 
var ZIP_EXTRACTOR_APP = null;
var initStarted = false;

function onBodyLoad() {
    ensureAppCreated();
    ZIP_EXTRACTOR_APP.onHtmlBodyLoaded();
}

function onWindowLoad() {
    ensureAppCreated();
    ZIP_EXTRACTOR_APP.onWindowLoaded();
}

function onDocumentLoad() {
    ensureAppCreated();
    ZIP_EXTRACTOR_APP.onDocumentLoaded();
}

function onGapiClientLoad() {
    ensureAppCreated();
    ZIP_EXTRACTOR_APP.onGapiClientLoaded();
}

function ensureAppCreated() {
    if (!ZIP_EXTRACTOR_APP) {
        if (initStarted) {
            throw('Previous App initialization failed.');
        }
        
        initStarted = true;
        configure();
        ZIP_EXTRACTOR_APP = new zipextractor.App();
    }
}

function configure() {
    zip.workerScriptsPath = 'js/zip/';
}
