import { app, BrowserWindow } from 'electron';
import path from 'path';
import { ipcMain } from 'electron';

// 窗口状态管理
let winState: { width?: number; height?: number; x?: number; y?: number; max?: boolean } = {};

function loadWinState() {
  try {
    const fs = require('fs');
    const p = path.join(app.getPath('userData'), 'win-state.json');
    if (fs.existsSync(p)) {
      winState = JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch {}
}

function saveWinState(win: BrowserWindow) {
  try {
    if (!win.isMaximized() && !win.isMinimized()) {
      const r = win.getBounds();
      winState = { width: r.width, height: r.height, x: r.x, y: r.y };
    }
    winState.max = win.isMaximized();
    const fs = require('fs');
    fs.writeFileSync(path.join(app.getPath('userData'), 'win-state.json'), JSON.stringify(winState));
  } catch {}
}

// IPC
ipcMain.handle('app:get-version', async () => app.getVersion());

ipcMain.handle('settings:save', async (_event, settings) => {
  try {
    const { default: Store } = await import('electron-store');
    const store = new Store();
    store.set('maze-settings', settings);
    return { success: true };
  } catch (e: any) {
    console.error('保存设置失败:', e);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('settings:load', async () => {
  try {
    const { default: Store } = await import('electron-store');
    const store = new Store();
    return { success: true, data: store.get('maze-settings', {}) };
  } catch (e: any) {
    console.error('加载设置失败:', e);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('window:close', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) { saveWinState(win); win.close(); }
});

ipcMain.handle('window:minimize', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
});

ipcMain.handle('window:maximize', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.isMaximized() ? win.unmaximize() : win.maximize();
  }
});

ipcMain.handle('window:get-state', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return 'normal';
  return win.isMaximized() ? 'maximized' : win.isMinimized() ? 'minimized' : 'normal';
});

ipcMain.handle('notification:show', async (event, { title, body }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    const { Notification } = await import('electron');
    new Notification({ title, body, silent: false }).show();
  }
});

function createWindow() {
  loadWinState();

  const win = new BrowserWindow({
    width: winState.width || 1080,
    height: winState.height || 720,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    transparent: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 恢复位置
  if (winState.x !== undefined && winState.y !== undefined) {
    win.setPosition(winState.x, winState.y);
  }
  if (winState.max) win.maximize();

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.on('resize', () => { win.webContents.send('window-resize'); });

  win.on('ready-to-show', () => { win.show(); });

  win.on('close', () => { saveWinState(win); });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
