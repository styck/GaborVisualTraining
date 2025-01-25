export const TRAINING_MODES = {
  SINGLE_IMAGE: 'single_image',
  THREE_IMAGE: 'three_image',
  CLEAR_IMAGE: 'clear_image',
  SHIFT_IMAGE: 'shift_image',
  CROWDING: 'crowding',
  MIXED: 'mixed',
} as const

export type TrainingMode = (typeof TRAINING_MODES)[keyof typeof TRAINING_MODES]

export interface TrainingDifficulty {
  size: number // patch大小系数 (0.08-0.15)
  contrast: number // 对比度 (0.2-0.8)
  spacing?: number // 三图训练的间距系数 (1.2-2.0)
  shift?: number // 移图训练的偏移范围 (5-30像素)
  contrastDiff?: number // 清晰图像训练的对比度差异 (0.1-0.3)
}

export interface TrainingUnit {
  mode: TrainingMode
  totalTrials: number
  completedTrials: number
  correctTrials: number
  reactionTimes: number[]
  difficulty: TrainingDifficulty
}

export interface TrainingSession {
  id: string
  startTime: number
  endTime?: number
  currentUnit: number
  units: TrainingUnit[]
  flashRate: number
  mode?: TrainingMode
}

export interface TrainingResult {
  id: string
  accuracy: number
  stability: number
  quality: number
  averageReactionTime: number
  mode: TrainingMode | 'mixed'
  flashRate: number
  difficulty: {
    size: number // 视标大小
    contrast: number // 对比度
    spacing?: number // 三图训练的间距系数
    shift?: number // 移图训练的偏移范围
    contrastDiff?: number // 清晰图像训练的对比度差异
  }
  startTime: number
  endTime: number
  units: {
    mode: TrainingMode
    difficulty: TrainingDifficulty
    flashRate: number
    totalTrials: number
    completedTrials: number
    correctTrials: number
    accuracy: number
    stability: number
    quality: number
    averageReactionTime: number
    reactionTimes: number[]
  }[]
}

export interface TestReport {
  accuracy: number // 整体正确率
  stability: number // 稳定性
  quality: number // 训练质量
  averageReactionTime: number // 平均反应时间
  mode: TrainingMode // 训练模式
}
