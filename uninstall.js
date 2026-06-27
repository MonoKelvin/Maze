const fs = require('fs');
const path = require('path');

/**
 * 在卸载时删除应用数据目录
 */
function uninstallAppData() {
  const appDataPath = process.env.APPDATA || path.join(process.env.LOCALAPPDATA, 'Maze');

  if (fs.existsSync(appDataPath)) {
    try {
      fs.rmSync(appDataPath, { recursive: true, force: true });
      console.log('成功删除应用数据目录:', appDataPath);
    } catch (error) {
      console.error('删除应用数据目录失败:', error);
    }
  }
}

// 执行卸载操作
uninstallAppData();
