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
 * State enums for Zip Extractor.
 */


/**
 * States for the overall session state.
 */
zipextractor.state.SessionState = {
  DEFAULT: 'default', // initial uninitialized state.
  INIT: 'init', // After presenter has been created
  UNSUPPORTED_BROWSER: 'unsupportedBrowser', // User's browser is not supporteds
  NEW_SESSION: 'newSession', // app launched zero-state
  APP_CREATE: 'appCreate', // While the app is being instantiated.
  APP_CREATED: 'appCreated', // Once the app is instantiated.
  APP_INIT: 'appInit', // While the app is initializing (auth not yet invoked)
  AUTH_PENDING_AUTO: 'authPendingAuto', // Automatic ('immediate') auth call was made at app startup.
  AUTH_PENDING_USER: 'authPendingUser', // User-initiated (non-'immediate') auth call was made as a result of clicking "AUTHORIZE".
  AUTH_REQUIRED: 'authRequired', // when auth call has returned, but auth is still required.
  AUTH_SUCCESS: 'authSuccess', // when auth call has returned, and the client is authorized.
  AUTH_ERROR: 'authError', // when auth call has returned when an error
  DOWNLOADING: 'downloading', // download blob from web
  DOWNLOADING_METADATA: 'downloadingMetadata', // download metadata for a file from the web
  CANCEL_DOWNLOAD_REQUESTED: 'cancelDownloadRequested', // When the user has requested to cancel the download.
  DOWNLOAD_CANCELED: 'downloadCanceled', // When the download has successfully been canceled.
  DOWNLOAD_ALL_BYTES_TRANSFERRED: 'downloadAllBytesTransferred', // when all download data has been received,
  DOWNLOADED: 'downloaded', // successful download of blob from Drive
  DOWNLOAD_ERROR: 'downloadError', // error when downloading blob from Drive
  ZIP_READING: 'zipReading', // reading blob info
  ZIP_READ_ERROR: 'zipReadError', // error when reading blob info
  MODEL_BUILDING: 'modelBuilding', // when building the model.
  MODEL_BUILT: 'modelBuilt', // when building the model.
  EXTRACTING: 'extracting', // extracting to drive
  EXTRACTION_COMPLETE: 'extractionComplete', // ZIP extraction complete.
  READ_URL_STATE: 'readUrlState', // When reading the URL state.
  API_LOADED: 'apiLoaded', // When the API script has completed loading.
  PENDING_USER_INPUT: 'pendingUserInput', // waiting on UI, pending session
  SESSION_CANCELED: 'sessionCanceled', // the user canceled the session before it began.
  EXTRACTION_CANCEL_REQUESTED: 'extractionCancelRequested', // the user canceled the extraction when in-progress.
  EXTRACTION_CANCELED: 'extractionCanceled', // the user canceled the extraction when in-progress.
  RENDER_ZIP_UI: 'renderZipUi', // the ZIP entries table is rendering.
  COMPLETE_WITH_ERRORS: 'completeWithErrors' // session complete
};


/**
 * States for individual file processing state.
 */
zipextractor.state.EntryState = {
  DEFAULT: 'default',
  QUEUED: 'queued', // Item has been placed into the upload queue
  QUEUED_PENDING_RETRY: 'queuedPendingRetry', // Item is queued for upload, pending resolution of error in an ancestor.
  SKIPPED: 'skipped',
  PENDING: 'pending', // Parent has been created, in the current batch
  WAITING: 'waiting', // Upload has begun, item is waiting to be processed
  CANCELED: 'canceled', // Upload was canceled.
  BEGIN_DECOMPRESSION: 'beginDecompression',
  DECOMPRESSION_PROGRESS: 'decompressionProgress',
  DECOMPRESSION_COMPLETE: 'decompressionComplete',
  DECOMPRESSION_ERROR: 'decompressionError',
  BEGIN_UPLOAD: 'beginUpload',
  UPLOAD_PROGRESS: 'uploadProgress',
  UPLOAD_ERROR: 'uploadError',
  UPLOAD_ALL_BYTES_TRANSFERRED: 'uploadAllBytesTransferred',
  UPLOAD_COMPLETE: 'uploadComplete',
  UPLOAD_ABORTED: 'uploadAborted'
};
