// Vitest 测试设置
import { vi } from 'vitest';

// Mock Electron API
global.electronAPI = {
  getAppVersion: vi.fn(),
  saveSettings: vi.fn(),
  loadSettings: vi.fn(),
  closeWindow: vi.fn(),
  minimizeWindow: vi.fn(),
  maximizeWindow: vi.fn(),
  getWindowState: vi.fn(),
  showNotification: vi.fn()
};
