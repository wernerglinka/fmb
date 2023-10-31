const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const yaml = require('js-yaml');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;
let aboutWindow;

async function getSchemas(schemasPath) {
  // get schema file list for .json files only. Keep hidden system files out!
  const schemaList = fs.readdirSync(schemasPath).filter(file => path.extname(file) === '.json');

  const allSchemas = [];
  // get all available schemas
  schemaList.forEach((schema) => {
    const thisSchemaPath = path.join(schemasPath, schema);
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

  // Paint the main window when it is ready
  mainWindow.webContents.once('did-finish-load', (e) => {
    mainWindow.show();
  });
};


//On app ready, create the window
app.whenReady().then(() => {

  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Paint the main window when it is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Remove window from memory when closed
  mainWindow.on('closed', () => (mainWindow = null));


  // handle dialog requests from the renderer process
  ipcMain.handle('dialog', (e, method, params) => {
    return dialog[method](mainWindow, params)});

  // handle schema requests from the renderer process
  ipcMain.handle('getSchemas', async (e, path) => {
    const schemas = await getSchemas(path);
    return schemas;
  });

  // get the page object from the renderer process
  ipcMain.handle('writeObjectToFile', (e, pageObject) => {
    //convert the page object to frontmatter yaml
    const yamlString = `--- \n${yaml.dump(pageObject)}\n---`;
    // write the YAML to a file
    // first open a dialog to select a directory
    dialog.showOpenDialog({ properties: ['openDirectory'] })
      .then(result => {
        const dir = result.filePaths[0];
        // write the YAML to a file
        const targetFile = path.join(dir, 'testfile.md');
        fs.writeFileSync(targetFile, yamlString);
    });
  });
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
