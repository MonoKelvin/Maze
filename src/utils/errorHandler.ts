/**
 * 错误处理工具
 */

/**
 * 处理运行时错误
 */
export function handleRuntimeError(error: unknown, context: string): void {
  console.error(`[Maze] Error in ${context}:`, error);

  // 可以在这里添加错误上报、用户通知等逻辑
  if (typeof error === 'string') {
    alert(`错误: ${error}`);
  } else if (error instanceof Error) {
    alert(`错误: ${error.message}`);
  }
}

/**
 * 验证迷宫参数
 */
export function validateMazeParams(params: {
  rows?: number;
  cols?: number;
  mode?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (params.rows !== undefined) {
    if (typeof params.rows !== 'number' || params.rows < 3) {
      errors.push('行数必须大于等于 3');
    }
    if (params.rows > 100) {
      errors.push('行数不能超过 100');
    }
  }

  if (params.cols !== undefined) {
    if (typeof params.cols !== 'number' || params.cols < 3) {
      errors.push('列数必须大于等于 3');
    }
    if (params.cols > 100) {
      errors.push('列数不能超过 100');
    }
  }

  if (params.mode !== undefined) {
    const validModes = ['square', 'circle', 'custom'];
    if (!validModes.includes(params.mode)) {
      errors.push(`无效的迷宫模式: ${params.mode}，必须是 ${validModes.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 验证入口出口配置
 */
export function validateEntryExitConfig(entry: any, exit: any, mode: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证入口
  if (!entry || typeof entry !== 'object') {
    errors.push('入口配置无效');
  } else {
    if (entry.type && !['boundary', 'center', 'custom'].includes(entry.type)) {
      errors.push(`无效的入口类型: ${entry.type}`);
    }
    if (entry.gridPos && (!entry.gridPos.row || !entry.gridPos.col)) {
      errors.push('入口网格位置无效');
    }
  }

  // 验证出口
  if (!exit || typeof exit !== 'object') {
    errors.push('出口配置无效');
  } else {
    if (exit.type && !['boundary', 'center', 'custom'].includes(exit.type)) {
      errors.push(`无效的出口类型: ${exit.type}`);
    }
    if (exit.gridPos && (!exit.gridPos.row || !exit.gridPos.col)) {
      errors.push('出口网格位置无效');
    }
  }

  // 验证出入口不能相同
  if (entry?.gridPos && exit?.gridPos && entry.gridPos.row === exit.gridPos.row && entry.gridPos.col === exit.gridPos.col) {
    errors.push('入口和出口不能在同一位置');
  }

  // 圆形模式特殊处理
  if (mode === 'circle' && (entry?.type === 'custom' || exit?.type === 'custom')) {
    errors.push('圆形模式不支持自定义出入口');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 安全地获取 DOM 元素
 */
export function safeQuerySelector(selector: string, context?: Document | Element): Element | null {
  try {
    return context?.querySelector(selector) || document.querySelector(selector);
  } catch (error) {
    console.warn(`[Maze] Query selector failed for "${selector}":`, error);
    return null;
  }
}

/**
 * 安全地设置 Canvas 上下文
 */
export function safeGetCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('[Maze] Could not get 2D context for canvas');
    }
    return ctx;
  } catch (error) {
    console.warn('[Maze] Error getting canvas context:', error);
    return null;
  }
}

/**
 * 显示错误通知
 */
export function showErrorNotification(message: string): void {
  // 创建临时通知元素
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: #E07B39;
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-size: 14px;
    max-width: 300px;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  // 添加动画样式
  if (!document.getElementById('maze-notification-style')) {
    const style = document.createElement('style');
    style.id = 'maze-notification-style';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // 3秒后自动消失
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let lastTime = 0;

  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastTime = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastTime = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}
