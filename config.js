// Electron environment check
const isDev = require('electron-is-dev');

module.exports = {
  isDev,
  appName: 'Guardian Verification System',
  version: '1.0.0',
  debug: isDev,
};
