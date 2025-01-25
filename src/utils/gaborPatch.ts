export class GaborPatch {
  private ctx: CanvasRenderingContext2D;
  private size: number;
  private frequency: number;
  private orientation: number;
  private phase: number;
  private sigmaX: number;
  private sigmaY: number;
  private backgroundColor: string;

  constructor(
    ctx: CanvasRenderingContext2D,
    size: number = 100,
    frequency: number = 0.05,
    orientation: number = 0,
    phase: number = 0,
    sigma: number = 20,
    backgroundColor: string = '#A4A4A4'
  ) {
    this.ctx = ctx;
    this.size = size;
    this.frequency = frequency;
    this.orientation = orientation;
    this.phase = phase;
    // 增加高斯窗口的大小，使边缘更平滑
    this.sigmaX = sigma * 1.2;
    this.sigmaY = sigma * 1.8; // 垂直方向更大，使过渡更自然
    this.backgroundColor = backgroundColor;
  }

  draw(centerX: number, centerY: number, contrast: number = 0.5) {
    const safeContrast = Math.max(0.2, Math.min(0.8, contrast));
    
    // 增加画布大小以避免边缘截断
    const padding = Math.round(this.size * 0.2);
    const totalSize = this.size + padding * 2;
    
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = totalSize;
    offscreenCanvas.height = totalSize;
    const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: true })!;
    
    const imageData = offscreenCtx.createImageData(totalSize, totalSize);
    const data = imageData.data;

    const bgColor = parseInt(this.backgroundColor.slice(1), 16);
    const bgR = (bgColor >> 16) & 255;
    const bgG = (bgColor >> 8) & 255;
    const bgB = bgColor & 255;

    const halfSize = totalSize / 2;

    for (let i = 0; i < totalSize; i++) {
      for (let j = 0; j < totalSize; j++) {
        const x = i - halfSize;
        const y = j - halfSize;
        
        // 使用椭圆形高斯窗口
        const xr = x * Math.cos(this.orientation) + y * Math.sin(this.orientation);
        const yr = -x * Math.sin(this.orientation) + y * Math.cos(this.orientation);
        
        // 改进的椭圆形高斯函数，使边缘更平滑
        const gaussian = Math.exp(
          -(xr * xr / (2 * this.sigmaX * this.sigmaX) + 
            yr * yr / (2 * this.sigmaY * this.sigmaY))
        );
        
        // 计算 Gabor 值
        const sinusoid = Math.cos(2 * Math.PI * this.frequency * xr + this.phase);
        
        // 组合高斯窗口和正弦光栅
        const value = gaussian * sinusoid;
        
        // 应用对比度，使用更平滑的过渡
        const intensity = value * safeContrast * gaussian;
        
        const idx = (i + j * totalSize) * 4;
        const colorChange = Math.round(intensity * 127);
        
        // 使用平方高斯函数作为 alpha 通道，使边缘更平滑
        const alpha = Math.round(gaussian * gaussian * 255);
        
        data[idx] = Math.max(0, Math.min(255, bgR + colorChange));
        data[idx + 1] = Math.max(0, Math.min(255, bgG + colorChange));
        data[idx + 2] = Math.max(0, Math.min(255, bgB + colorChange));
        data[idx + 3] = alpha;
      }
    }

    offscreenCtx.putImageData(imageData, 0, 0);
    
    // 绘制时考虑padding
    this.ctx.drawImage(
      offscreenCanvas,
      Math.round(centerX - halfSize),
      Math.round(centerY - halfSize)
    );
  }
} 