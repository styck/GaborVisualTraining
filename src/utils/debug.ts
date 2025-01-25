export class DebugTool {
  private static instance: DebugTool;
  private isEnabled = false;

  static getInstance() {
    if (!DebugTool.instance) {
      DebugTool.instance = new DebugTool();
    }
    return DebugTool.instance;
  }

  enable() {
    this.isEnabled = true;
    this.attachDebugger();
  }

  disable() {
    this.isEnabled = false;
    this.detachDebugger();
  }

  private attachDebugger() {
    if (!this.isEnabled) return;

    // 添加键盘快捷键
    window.addEventListener('keydown', this.handleKeyPress);

    // 添加性能监控
    this.startPerformanceMonitoring();
  }

  private detachDebugger() {
    window.removeEventListener('keydown', this.handleKeyPress);
    this.stopPerformanceMonitoring();
  }

  private handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl + Shift + D 打开调试面板
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      this.toggleDebugPanel();
    }
  };

  // ... 其他调试相关方法
}

export const debugTool = DebugTool.getInstance(); 