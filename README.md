# Deprecated

This sample is no longer maintained. No further updates will be made.

# ZIP Extractor

Sample app for extracting ZIP files into Google Drive using the Google Drive API.

This is a pure-Javascript app that makes use of the public Google Drive API to read ZIP files from Google Drive and extract their contents into Google Drive. Hierarchical ZIP files (ZIP files with subfolders) are supported.

The app is based on the drive.file OAuth2 scope, where permission is granted only for individual files that the user authorizes.

ZIP Extractor makes use of CORS (Cross-Origin Resource Sharing) methods for uploading and downloading files from Drive. The app also demonstrates the use of the File Picker and Sharing widgets as part of the Drive API. ZIP extractor also demonstrates how to integrate with the Google Drive web and Android apps.

This app uses the [zip.js](http://gildas-lormeau.github.io/zip.js/) – Javascript-based ZIP library.

## Deploying

To run this code yourself, it will need to be hosted somewhere. Options for hosting include Google App Engine or your own web server.

In all cases, a configuration will need to be created in the Google Developers Console, as outlined here:
https://developers.google.com/drive/api/v3/enable-sdk

> Note: The resulting App ID, Client ID, and API Key generated as part of that process will need to be put into the your app's configuration (in actual code). For ZIP Extractor, that configuration information in found in 'config.js' under the '/js/zipextractor/' directory.

## Support

For any questions about the Drive API, you can also post a question on the Stack Overflow forums:
http://stackoverflow.com/questions/tagged/google-drive-sdk

Note: This is not an official Google product.

