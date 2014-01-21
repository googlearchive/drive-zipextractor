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
