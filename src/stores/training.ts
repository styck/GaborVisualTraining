import { defineStore } from 'pinia'
import type {
  TrainingMode,
  TrainingUnit,
  TrainingResult,
  TrainingSession,
  TrainingDifficulty,
} from '@/types'
import { TRAINING_MODES } from '@/types'
import type { Settings } from '@/types/settings'
import { trainingStorage } from '@/utils/storage'
import { useSettingsStore } from '@/stores/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'

const STORAGE_KEY = 'training_history'

export interface TrainingHistoryEntry extends TrainingResult {
  startTime: number
  endTime: number
}

interface TrainingState {
  currentMode: TrainingMode
  currentSession: TrainingSession | null
  isIndependentMode: boolean
  trainingHistory: TrainingHistoryEntry[]
  currentSettings: Settings
}

export const useTrainingStore = defineStore('training', {
  state: (): TrainingState => ({
    currentMode: TRAINING_MODES.SINGLE_IMAGE,
    currentSession: null,
    isIndependentMode: false,
    trainingHistory: [],
    currentSettings: DEFAULT_SETTINGS,
  }),

  actions: {
    setTrainingMode(mode: string, independent: boolean = false) {
      const newMode = (() => {
        switch (mode) {
          case 'single':
            return TRAINING_MODES.SINGLE_IMAGE
          case 'triple':
            return TRAINING_MODES.THREE_IMAGE
          case 'clarity':
            return TRAINING_MODES.CLEAR_IMAGE
          case 'movement':
            return TRAINING_MODES.SHIFT_IMAGE
          case 'crowding':
            return TRAINING_MODES.CROWDING
          case 'mixed':
            return TRAINING_MODES.MIXED
          default:
            return TRAINING_MODES.SINGLE_IMAGE
        }
      })()

      // 设置新的训练模式
      this.currentMode = newMode
      this.isIndependentMode = independent

      // 清除本地存储中的会话
      trainingStorage.clearCurrentSession()
    },

    selectRandomMode(): TrainingMode {
      const settingsStore = useSettingsStore()
      const { settings } = settingsStore
      const probabilities = settings.training.modeProbabilities

      // 计算总概率（不包括mixed模式）
      const totalProbability = Object.entries(probabilities)
        .filter(([mode]) => mode !== 'mixed')
        .reduce((sum, [, prob]) => sum + prob, 0)

      // 生成随机数
      const random = Math.random() * totalProbability

      // 根据概率选择模式
      let accumulatedProbability = 0
      for (const [mode, probability] of Object.entries(probabilities)) {
        if (mode === 'mixed') continue
        accumulatedProbability += probability
        if (random <= accumulatedProbability) {
          return mode as TrainingMode
        }
      }

      // 默认返回单图训练模式
      return TRAINING_MODES.SINGLE_IMAGE
    },

    initializeSession(): void {
      // 首先尝试加载已有的训练进度
      const savedSession = trainingStorage.loadCurrentSession()
      if (savedSession) {
        this.currentSession = savedSession
        return
      }

      const settingsStore = useSettingsStore()
      const { settings } = settingsStore

      const defaultDifficulty: TrainingDifficulty = {
        size: settings.training.initialDifficulty.size,
        contrast: settings.training.initialDifficulty.contrast,
        spacing: settings.training.initialDifficulty.spacing,
        shift: settings.training.initialDifficulty.shift,
        contrastDiff: settings.training.initialDifficulty.contrastDiff,
      }

      // 创建指定数量的训练单元
      const units: TrainingUnit[] = Array(settings.training.unitsCount)
        .fill(null)
        .map(() => {
          // 如果是混合模式，为每个单元随机选择一个训练模式
          // 否则使用当前选择的模式
          const mode =
            this.currentMode === TRAINING_MODES.MIXED ? this.selectRandomMode() : this.currentMode

          return {
            mode,
            totalTrials: settings.training.trialsPerUnit,
            completedTrials: 0,
            correctTrials: 0,
            reactionTimes: [],
            difficulty: { ...defaultDifficulty },
          }
        })

      this.currentSession = {
        id: `session_${Date.now()}`,
        startTime: Date.now(),
        endTime: undefined,
        currentUnit: 0,
        units: units,
        flashRate: settings.training.flashRate,
        mode: this.currentMode, // 使用当前选择的模式
      }

      // 保存初始进度
      trainingStorage.saveCurrentSession(this.currentSession)
    },

    updateUnitProgress(unitIndex: number, isCorrect: boolean, reactionTime: number): void {
      if (!this.currentSession) return

      const unit = this.currentSession.units[unitIndex]
      if (!unit) return

      unit.completedTrials++
      if (isCorrect) {
        unit.correctTrials++
      }
      unit.reactionTimes.push(reactionTime)

      // 每次更新进度后保存
      trainingStorage.saveCurrentSession(this.currentSession)
    },

    saveUnitProgress(unitIndex: number): void {
      if (!this.currentSession) return

      // 更新当前单元索引
      this.currentSession.currentUnit = unitIndex

      // 保存进度
      trainingStorage.saveCurrentSession(this.currentSession)
    },

    completeSession(sessionRecord: TrainingHistoryEntry): void {
      try {
        // 验证会话记录的完整性
        if (!this.validateSessionRecord(sessionRecord)) {
          console.error('Invalid session record:', sessionRecord)
          return
        }

        // 加载现有的训练历史记录
        const existingHistory = localStorage.getItem(STORAGE_KEY)
        this.trainingHistory = existingHistory ? JSON.parse(existingHistory) : []

        // 添加新的训练记录（创建深拷贝以避免引用问题）
        const recordToSave = JSON.parse(JSON.stringify(sessionRecord))
        this.trainingHistory.push(recordToSave)

        // 保存到本地存储
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.trainingHistory))
        console.log('Training history saved:', this.trainingHistory)
      } catch (error) {
        console.error('Failed to save training history:', error)
      }

      // 清除当前会话
      this.currentSession = null
      trainingStorage.clearCurrentSession()
    },

    // 添加验证方法
    validateSessionRecord(record: TrainingHistoryEntry): boolean {
      try {
        // 检查必要字段是否存在
        if (!record.id || !record.startTime || !record.endTime || !record.units) {
          return false
        }

        // 检查每个训练单元的完整性
        for (const unit of record.units) {
          if (
            !unit.mode ||
            !unit.difficulty ||
            typeof unit.accuracy !== 'number' ||
            typeof unit.stability !== 'number' ||
            typeof unit.quality !== 'number' ||
            typeof unit.averageReactionTime !== 'number' ||
            !Array.isArray(unit.reactionTimes)
          ) {
            return false
          }
        }

        // 检查整体统计数据
        if (
          typeof record.accuracy !== 'number' ||
          typeof record.stability !== 'number' ||
          typeof record.quality !== 'number' ||
          typeof record.averageReactionTime !== 'number'
        ) {
          return false
        }

        return true
      } catch (error) {
        console.error('Error validating session record:', error)
        return false
      }
    },

    clearCurrentSession(): void {
      this.currentSession = null
      // 清除保存的进度
      trainingStorage.clearCurrentSession()
    },

    clearTrainingHistory() {
      this.trainingHistory = []
      localStorage.removeItem(STORAGE_KEY)
    },

    removeLastTrainingRecord() {
      if (this.trainingHistory.length > 0) {
        this.trainingHistory.pop()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.trainingHistory))
      }
    },

    loadTrainingHistory() {
      try {
        const history = localStorage.getItem(STORAGE_KEY)
        if (history) {
          this.trainingHistory = JSON.parse(history)
          console.log('Training history loaded:', this.trainingHistory)
        } else {
          this.trainingHistory = []
          console.log('No training history found')
        }
      } catch (error) {
        console.error('Failed to load training history:', error)
        this.trainingHistory = []
      }
    },

    saveTrainingHistory() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.trainingHistory))
      } catch (error) {
        console.error('Failed to save training history:', error)
      }
    },

    deleteTrainingRecord(index: number): void {
      try {
        // 加载现有的训练历史记录
        const historyStr = localStorage.getItem(STORAGE_KEY)
        if (!historyStr) {
          console.warn('No training history found when trying to delete record')
          return
        }

        // 解析历史记录
        const records: TrainingHistoryEntry[] = JSON.parse(historyStr)

        // 验证索引是否有效
        if (index < 0 || index >= records.length) {
          console.error('Invalid index when trying to delete record:', index)
          return
        }

        // 直接删除指定索引的记录，不做任何其他修改
        const newRecords = records.filter((_, i) => i !== index)

        // 更新 store 状态
        this.trainingHistory = newRecords

        // 保存到本地存储
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords))

        console.log('Training record deleted successfully')
      } catch (error) {
        console.error('Failed to delete training record:', error)
      }
    },
  },

  getters: {
    currentSettings() {
      const settingsStore = useSettingsStore()
      return settingsStore.settings
    },
  },
})
