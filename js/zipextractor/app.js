/**
 * ZIP Extractor App.
 * Creates the presenter.
 * Exposes primary entry points from browser page/script load callbacks.
 * Depends on:
 *   driveapi.AppConfig
 *   zipextractor.state.SessionState
 */
 
zipextractor.App = function() {
    var appConfig = new driveapi.AppConfig(zipextractor.config.DRIVE_API_CONFIG_DATA);
     
    this.presenter_ = new zipextractor.Presenter(appConfig);
    this.presenter_.init();
};


/**
 * Handles when body onload() event is fired in the main HTML page.
 */
zipextractor.App.prototype.onHtmlBodyLoaded = function() {
    this.presenter_.onHtmlBodyLoaded();
};


/**
 * Handles when the Google JS API has loaded.
 */
zipextractor.App.prototype.onGapiClientLoaded = function() {
    this.presenter_.onGapiClientLoaded();
};
