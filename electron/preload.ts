import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的 IPC 接口
contextBridge.exposeInMainWorld('electronAPI', {
    // 应用信息
    getAppVersion: () => ipcRenderer.invoke('app:get-version'),

    // 设置管理
    saveSettings: (settings: any) => ipcRenderer.invoke('settings:save', settings),
    loadSettings: () => ipcRenderer.invoke('settings:load'),

    // 窗口控制
    closeWindow: () => ipcRenderer.invoke('window:close'),
    minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
    maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
    getWindowState: () => ipcRenderer.invoke('window:get-state'),

    // 通知
    showNotification: (title: string, body: string) =>
        ipcRenderer.invoke('notification:show', { title, body }),

    // Shell
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
});
