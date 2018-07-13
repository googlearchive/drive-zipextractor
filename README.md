# ZIP Extractor

Extract (decompress) ZIP files into Google Drive using the Google Drive API.

This app is deployed at: http://zip-extractor.appspot.com/. Download the extension in the [Chrome Web Store](https://chrome.google.com/webstore/detail/zip-extractor/mmfcakoljjhncfphlflcedhgogfhpbcd?hl=en-US).

![](https://lh3.googleusercontent.com/gRv-MgMtf1a2z22P1nLatu8Y7VdNU4sjrXKY36twawlkK-uuf_mnzyS9wZir_PDKbG2VjvxYE_s=w640-h400-e365)

This is a pure-Javascript app that makes use of the public Google Drive API to read ZIP files from Google Drive and extract their contents into Google Drive. Hierarchical ZIP files (ZIP files with subfolders) are supported.

The app is based on the drive.file OAuth2 scope, where permission is granted only for individual files that the user authorizes.

ZIP Extractor makes use of CORS (Cross-Origin Resource Sharing) methods for uploading and downloading files from Drive. The app also demonstrates the use of the File Picker and Sharing widgets as part of the Drive API. ZIP extractor also demonstrates how to integrate with the Google Drive web and Android apps.

This app uses the [zip.js](http://gildas-lormeau.github.io/zip.js/) – Javascript-based ZIP library.

## Deploying

To run this code yourself, it will need to be hosted somewhere. Options for hosting include Google App Engine, where a simple Python configuration provides an easy-to-use way to expose only static content (in this case, serving the JavaScript). Other alternatives include using a Google Drive public folder to host the files, or your own web server.

In all cases, a configuration will need to be created in the Google Developers Console, as outlined here:
https://developers.google.com/drive/api/v3/enable-sdk

> Note: The resulting App ID, Client ID, and API Key generated as part of that process will need to be put into the your app's configuration (in actual code). For ZIP Extractor, that configuration information in found in 'config.js' under the '/js/zipextractor/' directory.

## Support

For any questions about ZIP Extractor, please email zipextractor@gmail.com.

For technical questions about the Google Drive API, you can post to the Google Drive Developers G+ community:
https://plus.google.com/communities/107264319205603895037

You can also post a question on the Stack Overflow forums:
http://stackoverflow.com/questions/tagged/google-drive-sdk

Mike Procopio, January 2014
mprocopio@gmail.com
