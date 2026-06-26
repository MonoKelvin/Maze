import { app, BrowserWindow } from 'electron';
import path from 'path';

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        frame: false,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    win.on('resize', () => {
        win.webContents.send('window-resize');
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

import { ipcMain } from 'electron';

ipcMain.handle('app:get-version', async () => {
    return app.getVersion();
});

ipcMain.handle('settings:save', async (event, settings) => {
    try {
        const { default: Store } = await import('electron-store');
        const store = new Store();
        store.set('maze-settings', settings);
        return { success: true };
    } catch (error) {
        console.error('保存设置失败:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('settings:load', async () => {
    try {
        const { default: Store } = await import('electron-store');
        const store = new Store();
        const settings = store.get('maze-settings', {});
        return { success: true, data: settings };
    } catch (error) {
        console.error('加载设置失败:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('window:close', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
});

ipcMain.handle('window:minimize', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
});

ipcMain.handle('window:maximize', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    }
});

ipcMain.handle('window:get-state', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return 'normal';

    if (win.isMaximized()) return 'maximized';
    if (win.isMinimized()) return 'minimized';
    return 'normal';
});

ipcMain.handle('notification:show', async (event, { title, body }) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        const { Notification } = await import('electron');
        new Notification({ title, body, silent: false }).show();
    }
});
