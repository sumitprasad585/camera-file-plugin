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
    }, 2000);
  },
  addStatusbar: () => {
    // add the statusbar placeholder div only on mobile application
    const statusbarClass = 'cordova' in window ? 'active' : '';
    const statusbar = document.querySelector('.statusbar');
    console.log(statusbarClass, statusbar);
    statusbar.classList.add(statusbarClass);
  },
  addListeners: () => {
    document.querySelector('button#btnCam').addEventListener('click', app.takePicture);
    document.querySelector('button#btnFile').addEventListener('click', app.copyFile);
  },
  takePicture: () => {
  },
  copyFile: () => {

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