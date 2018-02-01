require('./include/common')('splashscreen');
require('./include/web3CurrentProvider.js');
const dhi = require('./include/dhiAPI.js');
const { ipcRenderer, remote, webFrame } = require('electron');

require('./include/openExternal.js');
require('./include/setBasePath')('interface');

// set appmenu language
ipcRenderer.send('backendAction_getLanguage');

// disable pinch zoom
webFrame.setZoomLevelLimits(1, 1);

window.ipc = ipcRenderer;
window.dhi = dhi();
window.dhiMode = remote.getGlobal('mode');
window.dirname = remote.getGlobal('dirname');

// Initialise the Redux store
window.store = require('./rendererStore');
