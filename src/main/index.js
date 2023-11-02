const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const yaml = require('js-yaml');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;
let aboutWindow;
let componentsWindow;

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
    resizable: true,
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
    width: 500,
    height: 340,
    titleBarStyle: 'hidden', 
    title: 'About FMB',
    icon: `${__dirname}/assets/icons/blocks.png`,
  });

  // load the about window
  aboutWindow.loadFile(path.join(__dirname, '../renderer/about.html'));
}

// Add components to the main menu
function createComponentWindow() {
  componentsWindow = new BrowserWindow({
    width: isDev ? 1000 : 500,
    height: 600,
    resizable: true,
    titleBarStyle: 'hidden', 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  componentsWindow.loadFile(path.join(__dirname, '../renderer/addComponents.html'));

  // Don't destroy, keep the components window hidden until needed
  componentsWindow.on('close', e => {
    e.preventDefault();
    componentsWindow.hide();
  });
};

function refreshMainWindow() {
  mainWindow.reload();

  // Paint the main window when it is ready
  mainWindow.webContents.once('did-finish-load', (e) => {
    mainWindow.show();
  });
};

function showComponentsWindow(componentType) {
  componentsWindow.webContents.send('componentType', componentType);
  componentsWindow.show();
}

//On app ready, create the window
app.whenReady().then(() => {

  // create the main window
  createMainWindow();

  // Build the menu from the template
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Paint the main window when it is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // create the components window
  createComponentWindow();

  // Quit app when main window is closed
  mainWindow.on('close', e => {
    e.preventDefault()
    dialog.showMessageBox({
      type: 'info',
      buttons: ['Ok', 'Exit'],
      cancelId: 1,
      defaultId: 0,
      title: 'Warning',
      detail: 'Have you saved all your work?'
    }).then(({ response, checkboxChecked }) => {
      if (response) {
        mainWindow.destroy()
        app.quit()
      }
    })
  });


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
            { label: 'About', click: createAboutWindow, },
            { type: 'separator' },
            { label: 'Refresh MainWindow', click: refreshMainWindow, accelerator: 'CmdOrCtrl+R', },
            { type: 'separator' },
            { label: 'Quit', click: () => app.quit(), accelerator: 'CmdOrCtrl+Q', }
          ],
        },
      ]
    : []),
  {
    label: 'File',
    submenu: [
      { label: 'New Page', },
      { label: 'Open Page', },
      { type: 'separator' },
      { label: 'Close Window', click: () => app.quit(), accelerator: 'CmdOrCtrl+Q', }
    ],
  },
  {
    label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    },
  ...(!isMac
    ? [
        {
          label: 'Help',
          submenu: [
            { label: 'About', click: createAboutWindow, },
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
  {
    label: 'Add Components',
    submenu: [
      { label: 'Text', click: () => showComponentsWindow('text'), },
      { label: 'Text Area', click: () => showComponentsWindow('textarea'), },
      { label: 'Checkbox', click: () => showComponentsWindow('checkbox'), },
      { label: 'Object', click: () => showComponentsWindow('object'), },
      { label: 'Array', click: () => showComponentsWindow('array'), },
    ],
  }
];


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

// Open a window if none are open (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
