// 需要在 public/sounds/ 目录下添加以下音频文件：
// 1. correct.mp3 - 正确提示音（建议使用清脆的叮声）
// 2. error.mp3 - 错误提示音（建议使用低沉的嗡声）
// 3. start.mp3 - 开始提示音（建议使用中性的滴声）

// 推荐的音频文件下载链接：
// correct.mp3: https://freesound.org/people/Bertrof/sounds/131660/
// error.mp3: https://freesound.org/people/Bertrof/sounds/131657/
// start.mp3: https://freesound.org/people/Bertrof/sounds/131658/

// 导入音频文件
import correctSound from '@/assets/sounds/correct.mp3';
import incorrectSound from '@/assets/sounds/incorrect.mp3';
import finishUnitSound from '@/assets/sounds/finish_unit.mp3';
import finishEpochSound from '@/assets/sounds/finish_epoch.mp3';

class Sound {
  private audio: HTMLAudioElement;
  private loaded = false;
  private error: Error | null = null;
  private context: AudioContext | null = null;

  constructor(src: string) {
    this.audio = new Audio(src);
    this.audio.addEventListener('canplaythrough', () => {
      this.loaded = true;
    });
    this.audio.addEventListener('error', (e) => {
      this.error = new Error(`Failed to load audio: ${e.message}`);
    });
  }

  async load() {
    if (this.loaded) return;
    return new Promise<void>((resolve, reject) => {
      const handleLoad = () => {
        this.loaded = true;
        this.audio.removeEventListener('canplaythrough', handleLoad);
        resolve();
      };
      const handleError = (e: ErrorEvent) => {
        this.error = new Error(`Failed to load audio: ${e.message}`);
        this.audio.removeEventListener('error', handleError);
        reject(this.error);
      };
      this.audio.addEventListener('canplaythrough', handleLoad);
      this.audio.addEventListener('error', handleError);
      this.audio.load();
    });
  }

  async play() {
    if (this.error) throw this.error;
    if (!this.loaded) {
      await this.load();
    }

    try {
      // 创建新的 AudioContext
      if (!this.context) {
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // 如果上下文被挂起，则恢复
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }

      // 重置音频时间并播放
      this.audio.currentTime = 0;
      await this.audio.play();
    } catch (err) {
      console.warn('Audio playback failed:', err);
    }
  }
}

export class SoundManager {
  private static instance: SoundManager | null = null;
  private sounds: Map<string, Sound> = new Map();
  private initialized = false;

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async initialize() {
    if (this.initialized) return;
    await this.loadSounds();
    this.initialized = true;
  }

  async preloadSounds() {
    if (!this.initialized) {
      await this.initialize();
    }
    const loadPromises = Array.from(this.sounds.values()).map(sound => sound.load());
    await Promise.all(loadPromises);
  }

  private loadSounds() {
    this.sounds.set('correct', new Sound(correctSound));
    this.sounds.set('incorrect', new Sound(incorrectSound));
    this.sounds.set('finishUnit', new Sound(finishUnitSound));
    this.sounds.set('finishEpoch', new Sound(finishEpochSound));
  }

  async playCorrect() {
    await this.sounds.get('correct')?.play();
  }

  async playIncorrect() {
    await this.sounds.get('incorrect')?.play();
  }

  async playFinishUnit() {
    await this.sounds.get('finishUnit')?.play();
  }

  async playFinishEpoch() {
    await this.sounds.get('finishEpoch')?.play();
  }
}

export const soundManager = SoundManager.getInstance(); 