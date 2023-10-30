const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;
let aboutWindow;

function getSchema(e, schema) {
  // construct the path to the schema file
  let schemaPath = path.join(__dirname, '../../schemas/', schema);
  // return the schema file
  return fs.readFileSync(schemaPath , 'utf8'); 
}

function getSchemas() {
  // construct the path to the schema directory
  const schemasPath = path.join(__dirname, '../../schemas/');
  // get schema file list
  const schemaList = fs.readdirSync(schemasPath); 
  const allSchemas = [];
  // get all available schemas
  schemaList.forEach((schema) => {
    const thisSchemaPath = path.join(__dirname, '../../schemas/', schema);
    const thisSchema = fs.readFileSync(thisSchemaPath , 'utf8');
    allSchemas.push(thisSchema);
  });
  // return the schema file
  return allSchemas;
}

// Main Window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 1000 : 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    titleBarStyle: 'hidden', 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  // Show devtools automatically if in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // load the main window
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Paint the main window when it is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    //get all schemas
    const schemas = getSchemas();
    // send the schemas to the renderer
    mainWindow.webContents.send('schemas', schemas);
  });
}

// About Window
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    width: 300,
    height: 300,
    title: 'About Electron',
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
  });

  // load the about window
  aboutWindow.loadFile(path.join(__dirname, '../renderer/about.html'));
}

function refreshMainWindow() {
  mainWindow.reload();

  console.log("should reload...");

  // Paint the main window when it is ready
  mainWindow.webContents.once('did-finish-load', (e) => {
    mainWindow.show();

    //get all schemas
    const schemas = getSchemas();
    // send the schemas to the renderer
    mainWindow.webContents.send('schemas', schemas);
  });
}


//On app ready, create the window
app.whenReady().then(() => {

  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Remove window from memory when closed
  mainWindow.on('closed', () => (mainWindow = null));
});

// Menu template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
            { type: 'separator' },
            {
              label: 'Refresh MainWindow',
              click: refreshMainWindow,
              accelerator: 'CmdOrCtrl+R', 
            },
            { type: 'separator' },
            {
              label: 'Quit',
              click: () => app.quit(),
              accelerator: 'CmdOrCtrl+W',
            }
          ],
        },
      ]
    : []),
  {
    role: 'fileMenu',
  },
  ...(!isMac
    ? [
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
];


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

// Open a window if none are open (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
