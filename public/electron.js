const { app, BrowserWindow, Menu, ipcMain, protocol } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const fs = require('fs');
const express = require('express');
const Database = require('../database');

let mainWindow;
let db;
let server;

// Start Express server for production builds
function startServer() {
  if (isDev) return null;
  
  const app = express();
  const buildPath = path.join(__dirname, '../build');
  
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  
  return app.listen(3000, 'localhost', () => {
    console.log('Server started on http://localhost:3000');
  });
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false,
      webSecurity: false,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : 'http://localhost:3000';

  console.log('Loading URL:', startUrl);
  console.log('__dirname:', __dirname);
  console.log('Resolved path:', path.resolve(__dirname, '../build/index.html'));

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    // Force quit app when window is closed
    app.quit();
  });
};

// Initialize database
app.on('ready', async () => {
  // Start Express server for production builds
  if (!isDev) {
    server = startServer();
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  db = new Database();
  await db.initialize();
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  // Always quit the app when all windows are closed
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('register-student', async (event, studentData) => {
  try {
    const result = db.registerStudent(studentData);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('register-guardian', async (event, guardianData) => {
  try {
    const result = db.registerGuardian(guardianData);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-students', async () => {
  try {
    const students = db.getStudents();
    return { success: true, data: students };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-guardians', async () => {
  try {
    const guardians = db.getGuardians();
    return { success: true, data: guardians };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('verify-guardian', async (event, { studentId, guardianBarcode }) => {
  try {
    const result = db.verifyGuardian(studentId, guardianBarcode);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-student-by-barcode', async (event, barcode) => {
  try {
    const student = db.getStudentByBarcode(barcode);
    return { success: true, data: student };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-verification-logs', async () => {
  try {
    const logs = db.getVerificationLogs();
    return { success: true, data: logs };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('print-report', async (event, reportData) => {
  try {
    // Report printing will be handled by the frontend
    return { success: true, message: 'Report generated' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { mainWindow };
