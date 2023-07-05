const app = {
  event: null,
  tempURL: null,
  permFolder: null,
  permFile: null,
  oldFile: null,
  KEY: "OLDfileNAMEkey",
  init: () => {
    const msg = `${app.event} event was fired`;
    console.log(msg);

    app.addStatusbar();

    setTimeout(() => {
      console.log('cordova-file-plugin is ready');
      app.addListeners();

      // create the folder where we will save files
      app.getOrCreatePermanentFolder();
    }, 2000);
  },
  addStatusbar: () => {
    // add the statusbar placeholder div only on mobile application
    const statusbarClass = 'cordova' in window ? 'active' : '';
    const statusbar = document.querySelector('.statusbar');
    statusbar.classList.add(statusbarClass);
  },
  addListeners: () => {
    document.querySelector('button#btnCam').addEventListener('click', app.takePicture);
    document.querySelector('button#btnFile').addEventListener('click', app.copyFile);
  },
  takePicture: (e) => {
    e.preventDefault();
    e.stopPropagation();
    const options = {
      quality: 100,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      allowEdit: true,
      targetWidth: 400,
      targetHeight: 400
    };

    // navigator.camera.getPicture(success, failure, options);
    navigator.camera.getPicture(
      function captureSuccess(uri) {
        app.tempURL = uri;
        // document.querySelector('#imgCamera').src = uri;
        document.querySelector('#imgCamera').src = window.WkWebView.convertFilePath(uri);
      },
      function captureError(err) {
        console.warn(err);
      },
      options
    );
  },
  copyFile: (e) => {
    e.preventDefault();
    e.stopPropagation();

    const filename = Date.now().toString() + ".jpg";

    // resolveLocalFileSystemURL(path, success, failure)
    resolveLocalFileSystemURL(
      app.tempURL,
      entry => {
        console.log('entry is: ', entry);
        const msg = `Copying ${entry.name} to ${app.permFolder.nativeURL + filename}`;
        console.log(msg);

        // entry.copyTo(parent, newName, success, failure);
        entry.copyTo(
          app.permFolder,
          filename,
          function fileCopySuccess(copiedFile) {
            // save file name in local storage
            localStorage.setItem(app.KEY, copiedFile.nativeURL);

            app.permFile = copiedFile;
            console.log('Adding ', copiedFile, ' to the 2nd image');
            // document.getElementById("imgFile").src = copiedFile.nativeURL; // OPERATION NOT PERMITTED
            // Due to WkWebView restrictions images or files can't be read directly using fileURL
            // https://stackoverflow.com/questions/63521746/cordova-load-resource-from-documents-issue-wkwebview
            document.getElementById('imgFile').src = window.WkWebView.convertFilePath(copiedFile.nativeURL);

            // delete the old file from file system from app.permFolder
            if(app.oldFile) {
              app.oldFile.remove(
                function removeSuccess() {
                  console.log("Successfully deleted the old file");
                  app.oldFile = copiedFile;
                },
                function removeFailure(err) {
                  console.warn(err);
                }
              )
            }
          },
          function fileCopyFailure(err) {
            console.warn(err);
          }
        )
      }
    )
  },
  getOrCreatePermanentFolder: () => {
    const path = cordova.file.dataDirectory;

    // resolveLocalFileSystemURL(path, success, failure)
    resolveLocalFileSystemURL(
      path,
      dirEntry => {
        // using dirEntry get or create the 'images' folder where we will be saving our images
        // dirEntry.getDirectory(name, { create: true/false }, success, failure);
        dirEntry.getDirectory(
          "images",
          { create: true },
          function getDirectorySuccess(gotDir) {
            app.permFolder = gotDir;
            const msg = 'Created or Opened: ' + gotDir.nativeURL;
            console.log(msg);

            // load old image using the url which was stored on local storage from previous app run
            app.loadOldImage();
          },
          function getDirectoryFailure(err) {
            const msg = 'An error occurred while creating images folder: ' + err;
            console.warn(msg);
          }
        )
      },
      err => {
        console.warn('Failure callback of resolveFileSystemURL');
      }
    )
  },
  loadOldImage: () => {
    const oldFilePath = localStorage.getItem(app.KEY);
    if (oldFilePath) {
      resolveLocalFileSystemURL(
        oldFilePath,
        function gotFileSuccess(gotFile) {
          app.oldFile = gotFile;
          document.querySelector('#imgFile').src = window.WkWebView.convertFilePath(gotFile.nativeURL);
        },
        function gotFileFailure(err) {
          console.warn(err);
        }
      )
    }
  },
  cordovaDirectoryInfo: () => {
    const documentsDirectory = cordova.file.documentsDirectory;
    const dataDirectory = cordova.file.dataDirectory;
    const syncedDataDirectory = cordova.file.syncedDataDirectory;
    let msg = `The cordova documents directory (cordova.file.documentsDirectory) is ${documentsDirectory}`;
    console.log(msg);

    msg = `The cordova data directory (cordova.file.dataDirectory) is ${dataDirectory}`;
    console.log(msg);

    msg = `The cordova synced data directory (cordova.file.syncedDataDirectory) is ${syncedDataDirectory}`;
    console.log(msg);
  }
}

app.event = 'cordova' in window ? 'deviceready' : 'DOMContentLoaded';
document.addEventListener(app.event, app.init);