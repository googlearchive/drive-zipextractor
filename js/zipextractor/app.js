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
 * ZIP Extractor App.
 * Creates the presenter.
 * Exposes primary entry points from browser page/script load callbacks.
 * Requires:
 *   driveapi.AppConfig
 *   zipextractor.presenter
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
