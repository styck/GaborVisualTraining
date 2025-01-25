export interface TrainingSettings {
  unitsCount: number;
  trialsPerUnit: number;
  flashRate: number; // 闪烁间隔（毫秒）
  modeProbabilities: {
    single_image: number;
    three_image: number;
    clear_image: number;
    shift_image: number;
    crowding: number;
    mixed: number;
  };
  initialDifficulty: {
    size: number;      // 视标大小 (0.08-0.15)
    contrast: number;  // 对比度 (0.2-0.8)
    spacing: number;   // 三图训练的间距系数 (1.2-2.0)
    shift: number;     // 移图训练的偏移范围 (5-30像素)
    contrastDiff: number; // 清晰图像训练的对比度差异 (0.1-0.3)
  };
  crowdingFontSize: number;
  flashDuration: number;
  flashInterval: number;
  feedbackDuration: number;
  fixationDuration: number;
  maskDuration: number;
  stimulusSize: number;
  backgroundColor: string;
  fixationColor: string;
  stimulusColor: string;
  feedbackCorrectColor: string;
  feedbackWrongColor: string;
}

export interface FeedbackSettings {
  visual: {
    enabled: boolean;
    correctColor: string;
    incorrectColor: string;
  };
  audio: {
    enabled: boolean;
    correctSound: boolean;
    incorrectSound: boolean;
  };
}

export interface DisplaySettings {
  showUnitCounter: boolean;
  showTrialCounter: boolean;
  showPerformanceMetrics: boolean;
}

export interface Settings {
  feedback: FeedbackSettings;
  display: DisplaySettings;
  training: TrainingSettings;
}

export const DEFAULT_SETTINGS: Settings = {
  feedback: {
    visual: {
      enabled: true,
      correctColor: '#4caf50',
      incorrectColor: '#f44336'
    },
    audio: {
      enabled: true,
      correctSound: true,
      incorrectSound: true
    }
  },
  display: {
    showUnitCounter: true,
    showTrialCounter: true,
    showPerformanceMetrics: true
  },
  training: {
    unitsCount: 11,
    trialsPerUnit: 50,
    flashRate: 500,
    modeProbabilities: {
      single_image: 0.15,
      three_image: 0.25,
      clear_image: 0.25,
      shift_image: 0.25,
      crowding: 0.1,
      mixed: 0
    },
    crowdingFontSize: 48,
    flashDuration: 500,
    flashInterval: 500,
    feedbackDuration: 500,
    fixationDuration: 500,
    maskDuration: 500,
    stimulusSize: 100,
    backgroundColor: '#808080',
    fixationColor: '#000000',
    stimulusColor: '#000000',
    feedbackCorrectColor: '#00FF00',
    feedbackWrongColor: '#FF0000',
    initialDifficulty: {
      size: 0.12,
      contrast: 0.5,
      spacing: 1.5,
      shift: 15,
      contrastDiff: 0.2
    }
  }
}; 