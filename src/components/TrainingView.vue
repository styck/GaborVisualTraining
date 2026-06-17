<template>
  <div
    class="training-view"
    @keydown="handleKeyPress"
    @mousedown="handleMouseDown"
    @contextmenu.prevent
    tabindex="0"
  >
    <div v-if="!isTraining && !isShowingSummary" class="training-start">
      <h1>{{ $t('training.title') }}</h1>

      <!-- 添加进度条组件 -->
      <UnitProgressBar :current-unit="currentUnit" :total-units="totalUnits" />

      <div class="mode-info">
        <h2>{{ $t(`training.modes.${currentMode}.title`) }}</h2>
        <p>{{ $t(`training.modes.${currentMode}.description`) }}</p>

        <!-- 添加操作说明 -->
        <div class="controls-info">
          <h3>{{ $t('training.controls.title') }}</h3>
          <div class="controls-section">
            <h4>{{ $t('training.controls.mouse') }}</h4>
            <ul>
              <li>{{ $t('training.controls.mouseLeft') }}</li>
              <li>{{ $t('training.controls.mouseRight') }}</li>
              <li>{{ $t('training.controls.mouseMiddle') }}</li>
            </ul>
          </div>
          <div class="controls-section">
            <h4>{{ $t('training.controls.keyboard') }}</h4>
            <ul>
              <li>{{ $t('training.controls.keyLeft') }}</li>
              <li>{{ $t('training.controls.keyRight') }}</li>
              <li>{{ $t('training.controls.keyUp') }}</li>
              <li>{{ $t('training.controls.keyEsc') }}</li>
            </ul>
          </div>
        </div>
      </div>
      <button class="start-button" @click="startCurrentUnit">
        {{ $t('training.startUnit') }}
      </button>
    </div>

    <div v-else class="training-container" @contextmenu.prevent>
      <canvas
        ref="trainingCanvas"
        :width="windowSize.width"
        :height="windowSize.height"
        @mousedown="handleMouseDown"
        @contextmenu.prevent
      ></canvas>

      <div v-if="!isShowingSummary" class="training-info">
        <div class="mode-name">
          {{ $t(`training.modes.${currentMode}.title`) }}
        </div>
        <template v-if="settings.display.showUnitCounter">
          <div class="unit-info">
            {{
              $t('training.unit', {
                current: currentUnit + 1,
                total: totalUnits,
              })
            }}
          </div>
        </template>
        <template v-if="settings.display.showTrialCounter">
          <div class="trial-info">
            {{
              $t('training.trial', {
                current: currentTrial + 1,
                total: totalTrials,
              })
            }}
          </div>
        </template>

        <!-- 性能指标 -->
        <template v-if="settings.display.showPerformanceMetrics">
          <div class="performance-metrics">
            <div>{{ $t('common.accuracyLabel') }}: {{ formatPercent(currentCorrectRate) }}%</div>
            <div>{{ $t('common.stabilityLabel') }}: {{ formatPercent(currentStability) }}%</div>
            <div>{{ $t('common.avgReactionTimeLabel') }}: {{ formatTime(averageReactionTime) }}ms</div>
            <div>{{ $t('common.flashIntervalLabel') }}: {{ currentSession?.flashRate }}ms</div>
            <div>{{ $t('common.patchSizeLabel') }}: {{ formatPercent(currentPatchSize * 100) }}%</div>
            <div>{{ $t('common.contrastLabel') }}: {{ formatPercent(currentContrast * 100) }}%</div>
            <template v-if="currentMode === TRAINING_MODES.THREE_IMAGE">
              <div>{{ $t('common.spacingFactorLabel') }}: {{ formatPercent(currentSpacing * 100) }}%</div>
            </template>
            <template v-if="currentMode === TRAINING_MODES.SHIFT_IMAGE">
              <div>{{ $t('common.shiftAmountLabel') }}: {{ currentShift }}px</div>
            </template>
            <template v-if="currentMode === TRAINING_MODES.CLEAR_IMAGE">
              <div>{{ $t('common.contrastDiffLabel') }}: {{ formatPercent(currentContrastDiff * 100) }}%</div>
            </template>
          </div>
        </template>
      </div>

      <!-- 单元总结组件 -->
      <div v-if="isShowingSummary && currentSession" class="summary-overlay">
        <UnitSummary
          :accuracy="currentUnitStats.accuracy"
          :stability="currentUnitStats.stability"
          :quality="currentUnitStats.quality"
          :average-reaction-time="currentUnitStats.averageReactionTime"
          :has-next-unit="currentUnit < totalUnits - 1"
          :current-unit="currentUnit"
          :total-units="totalUnits"
          :next-unit-mode="nextUnitMode"
          :difficulty="currentSession.units[currentUnit].difficulty"
          @next-unit="handleContinueTraining"
          @finish="finishTraining"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { TrainingMode, TrainingUnit } from '@/types'
import { TRAINING_MODES } from '@/types'
import { useTrainingStore } from '@/stores/training'
import { soundManager } from '@/utils/sound'
import { trainingStorage } from '@/utils/storage'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { GaborPatch } from '@/utils/gaborPatch'
import { useSettingsStore } from '@/stores/settings'
import { storeToRefs } from 'pinia'
import UnitSummary from '@/components/UnitSummary.vue'
import UnitProgressBar from '@/components/UnitProgressBar.vue'

interface UnitResults {
  correctRate: number
  stability: number
  avgReactionTime: number
}

const router = useRouter()
const trainingStore = useTrainingStore()
const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)
const { t } = useI18n()

const isTraining = ref(false)
const currentUnit = ref(0)
const currentTrial = ref(0)
const currentSession = computed(() => trainingStore.currentSession)

const currentMode = computed(() => {
  if (!currentSession.value?.units) return TRAINING_MODES.SINGLE_IMAGE
  return currentSession.value.units[currentUnit.value].mode
})

const trainingCanvas = ref<HTMLCanvasElement | null>(null)
const isShowingStimulus = ref(false)
const stimulusTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const currentCorrectAnswer = ref<boolean | null>(null)
const isFullscreen = ref(false)
const isReadyForStimulus = ref(false)
const correctAnswers = ref<boolean[]>([])
const reactionTimes = ref<number[]>([])
const lastStimulusTime = ref<number>(0)

const windowSize = ref({
  width: window.innerWidth,
  height: window.innerHeight,
})

const totalUnits = computed(() => {
  return currentSession.value?.units.length || 0
})

const totalTrials = computed(() => {
  if (!currentSession.value) return 0
  return currentSession.value.units[currentUnit.value]?.totalTrials || 0
})

const isShowingSummary = ref(false)
const isProcessingResponse = ref(false)

const inputCooldown = ref(false)
const COOLDOWN_DURATION = 500 // 500ms冷却时间

const enterFullscreen = async () => {
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen()
      isFullscreen.value = true
    }
  } catch (err) {
    console.error('无法进入全屏模式:', err)
  }
}

const initializeTraining = () => {
  trainingStore.initializeSession()
  if (currentSession.value) {
    // 确保 currentSession 有 id 属性
    if (!currentSession.value.id) {
      currentSession.value.id = `session_${Date.now()}`
    }
    // 从保存的进度恢复
    currentUnit.value = currentSession.value.currentUnit
    currentTrial.value = 0
    isTraining.value = false
    isShowingStimulus.value = false
    isReadyForStimulus.value = false
  }
}

const initializeCanvas = () => {
  console.log('Initializing canvas...')
  if (!trainingCanvas.value) {
    console.error('Canvas element not found')
    return
  }

  const width = window.innerWidth
  const height = window.innerHeight

  console.log('Setting canvas size:', { width, height })

  // 确保画布尺寸正确设置
  trainingCanvas.value.width = width
  trainingCanvas.value.height = height
  windowSize.value = { width, height }

  // 清空画布并设置背景色
  const ctx = trainingCanvas.value.getContext('2d')
  if (!ctx) {
    console.error('Could not get canvas context')
    return
  }

  ctx.fillStyle = '#A4A4A4'
  ctx.fillRect(0, 0, width, height)

  console.log('Canvas initialized successfully')
}

const drawFixationPoint = () => {
  console.log('Drawing fixation point...')
  if (!trainingCanvas.value) {
    console.error('Canvas not found when drawing fixation point')
    return
  }
  const ctx = trainingCanvas.value.getContext('2d')
  if (!ctx) {
    console.error('Could not get canvas context')
    return
  }

  // 清空画布
  ctx.fillStyle = '#A4A4A4'
  ctx.fillRect(0, 0, windowSize.value.width, windowSize.value.height)

  // 计算中心点
  const centerX = Math.round(windowSize.value.width / 2)
  const centerY = Math.round(windowSize.value.height / 2)

  console.log('Drawing fixation point at:', { centerX, centerY })

  // 使用路径绘制注视点
  ctx.save()

  // 外圆（白色）
  ctx.beginPath()
  ctx.arc(centerX, centerY, 25, 0, Math.PI * 2)
  ctx.fillStyle = '#FFFFFF'
  ctx.fill()

  // 内圆（灰色）
  ctx.beginPath()
  ctx.arc(centerX, centerY, 20, 0, Math.PI * 2)
  ctx.fillStyle = '#A4A4A4'
  ctx.fill()

  ctx.restore()

  console.log('Fixation point drawn')
}

const drawStimulusFrame = () => {
  if (!trainingCanvas.value) return
  const ctx = trainingCanvas.value.getContext('2d')
  if (!ctx) return

  // 先清空画布
  showGrayBackground()

  // 绘制白色边框
  const frameSize = windowSize.value.height
  const frameX = Math.round((windowSize.value.width - frameSize) / 2)
  const frameY = 0

  ctx.beginPath()
  ctx.lineWidth = 4
  ctx.strokeStyle = '#FFFFFF'
  ctx.strokeRect(frameX + 2, frameY + 2, frameSize - 4, frameSize - 4)
}

const handleKeyPress = (event: KeyboardEvent) => {
  console.log('Key pressed:', event.key, {
    isShowingStimulus: isShowingStimulus.value,
    isProcessingResponse: isProcessingResponse.value,
    isReadyForStimulus: isReadyForStimulus.value,
    currentCorrectAnswer: currentCorrectAnswer.value,
    isTraining: isTraining.value,
  })

  // ESC 键特殊处理，直接调用退出函数
  if (event.key === 'Escape') {
    exitTraining()
    return
  }

  // 如果正在显示总结界面，忽略其他键盘输入
  if (isShowingSummary.value) {
    return
  }

  // 如果不在训练状态，忽略其他输入
  if (!isTraining.value) return

  // 检查是否在处理响应
  if (isProcessingResponse.value) {
    console.log('Keyboard input blocked: processing response')
    return
  }

  // 检查是否有正确答案
  if (currentCorrectAnswer.value === null) {
    console.log('Keyboard input blocked: no correct answer')
    return
  }

  // 处理上箭头开始训练
  if (event.key === 'ArrowUp') {
    if (isReadyForStimulus.value && !isShowingStimulus.value) {
      console.log('Starting trial with up arrow')
      startTrial()
    } else if (!isShowingStimulus.value) {
      console.log('Setting ready for stimulus')
      isReadyForStimulus.value = true
      drawFixationPoint()
    }
    return
  }

  // 检查按键并处理响应
  if (event.key === 'ArrowLeft') {
    console.log('Left arrow - handling as true')
    handleResponse(true)
  } else if (event.key === 'ArrowRight') {
    console.log('Right arrow - handling as false')
    handleResponse(false)
  }
}

const handleStimulus = () => {
  if (!currentSession.value) return
  const unit = currentSession.value.units[currentUnit.value]

  console.log('Handling stimulus for mode:', unit.mode)

  // 确保使用正确的模式
  const mode = unit.mode
  let result = false

  switch (mode) {
    case TRAINING_MODES.SINGLE_IMAGE:
      result = showSingleImageStimulus(unit)
      break
    case TRAINING_MODES.THREE_IMAGE:
      result = showThreeImageStimulus(unit)
      break
    case TRAINING_MODES.CLEAR_IMAGE:
      result = showClearImageStimulus(unit)
      break
    case TRAINING_MODES.SHIFT_IMAGE:
      result = showShiftImageStimulus(unit)
      break
    case TRAINING_MODES.CROWDING:
      result = showCrowdingStimulus(unit)
      break
  }

  // 设置正确答案
  currentCorrectAnswer.value = result
  console.log('Stimulus shown, correct answer set to:', result)
}

const startTrial = () => {
  if (!currentSession.value || isShowingStimulus.value) {
    console.log('Start trial blocked:', {
      hasSession: !!currentSession.value,
      isShowingStimulus: isShowingStimulus.value,
      isReadyForStimulus: isReadyForStimulus.value,
    })
    return
  }

  console.log('Starting trial')

  // 重置状态
  isProcessingResponse.value = false
  currentCorrectAnswer.value = null

  // 设置开始时间
  lastStimulusTime.value = Date.now()

  // 先设置显示状态
  isShowingStimulus.value = true
  isReadyForStimulus.value = false

  // 立即显示刺激
  handleStimulus()
}

const getStimulsOrientation = (trialIndex: number): number => {
  if (trialIndex < 25) {
    // 前25次主要为竖向条纹（0），但有10%概率是其他方向
    return Math.random() < 0.9 ? 0 : Math.random() * Math.PI
  } else {
    // 后25次主要为横向条纹（PI/2），但有10%概率是其他方向
    return Math.random() < 0.9 ? Math.PI / 2 : Math.random() * Math.PI
  }
}

const showGrayBackground = () => {
  if (!trainingCanvas.value) return
  const ctx = trainingCanvas.value.getContext('2d')
  if (!ctx) return

  // 只显示灰色背景，不显示任何内容
  ctx.fillStyle = '#A4A4A4'
  ctx.fillRect(0, 0, windowSize.value.width, windowSize.value.height)
}

const endStimulus = () => {
  console.log('Ending stimulus display')
  showGrayBackground()
  // 不在这里设置 isShowingStimulus 为 false，让用户有时间响应
}

const showSingleImageStimulus = (unit: TrainingUnit): boolean => {
  if (!trainingCanvas.value || !currentSession.value) return false
  const ctx = trainingCanvas.value.getContext('2d')
  if (!ctx) return false

  console.log('Showing single image stimulus')

  const minSize = Math.round(windowSize.value.height * 0.08)
  const maxSize = Math.round(windowSize.value.height * 0.2)
  const patchSize = Math.round(minSize + (maxSize - minSize) * unit.difficulty.size)

  const orientation = getStimulsOrientation(currentTrial.value)

  const gabor = new GaborPatch(ctx, patchSize, 0.05, orientation, 0, patchSize / 3, '#A4A4A4')

  const showGabor = Math.random() > 0.5
  const firstDisplay = showGabor
  const flashInterval = currentSession.value.flashRate

  console.log('Stimulus parameters:', {
    patchSize,
    orientation,
    showGabor,
    flashInterval,
  })

  // 第一次闪烁
  showGrayBackground()
  drawStimulusFrame()
  if (firstDisplay) {
    gabor.draw(
      Math.round(windowSize.value.width / 2),
      Math.round(windowSize.value.height / 2),
      unit.difficulty.contrast,
    )
  }

  // 第二次闪烁
  stimulusTimeout.value = window.setTimeout(() => {
    showGrayBackground()
    drawStimulusFrame()
    if (!firstDisplay) {
      gabor.draw(
        Math.round(windowSize.value.width / 2),
        Math.round(windowSize.value.height / 2),
        unit.difficulty.contrast,
      )
    }

    // 设置延时等待响应
    stimulusTimeout.value = window.setTimeout(() => {
      showGrayBackground()
      if (!isProcessingResponse.value) {
        isReadyForStimulus.value = true
      }
    }, flashInterval)
  }, flashInterval)

  return firstDisplay
}

const showThreeImageStimulus = (unit: TrainingUnit): boolean => {
  if (!trainingCanvas.value || !currentSession.value) return false
  const ctx = trainingCanvas.value.getContext('2d')
  if (!ctx) return false

  const minSize = Math.round(windowSize.value.height * 0.06)
  const maxSize = Math.round(windowSize.value.height * 0.15)
  const patchSize = Math.round(minSize + (maxSize - minSize) * unit.difficulty.size)

  const minSpacing = patchSize * 1.0
  const maxSpacing = patchSize * 1.5
  const spacing = minSpacing + (maxSpacing - minSpacing) * (unit.difficulty.spacing ?? 1.2)
  const flashInterval = currentSession.value.flashRate

  const orientation = getStimulsOrientation(currentTrial.value)

  const patches = Array(3)
    .fill(null)
    .map(() => new GaborPatch(ctx, patchSize, 0.05, orientation, 0, patchSize / 3, '#A4A4A4'))

  const showThreeFirst = Math.random() > 0.5
  const centerX = Math.round(windowSize.value.width / 2)
  const centerY = Math.round(windowSize.value.height / 2)

  // 第一次闪烁
  showGrayBackground()
  drawStimulusFrame()
  if (showThreeFirst) {
    patches[0].draw(centerX - spacing, centerY, unit.difficulty.contrast)
    patches[1].draw(centerX, centerY, unit.difficulty.contrast)
    patches[2].draw(centerX + spacing, centerY, unit.difficulty.contrast)
  } else {
    patches[0].draw(centerX - spacing, centerY, unit.difficulty.contrast)
    patches[2].draw(centerX + spacing, centerY, unit.difficulty.contrast)
  }

  // 第二次闪烁
  stimulusTimeout.value = window.setTimeout(() => {
    showGrayBackground()
    drawStimulusFrame()
    if (!showThreeFirst) {
      patches[0].draw(centerX - spacing, centerY, unit.difficulty.contrast)
      patches[1].draw(centerX, centerY, unit.difficulty.contrast)
      patches[2].draw(centerX + spacing, centerY, unit.difficulty.contrast)
    } else {
      patches[0].draw(centerX - spacing, centerY, unit.difficulty.contrast)
      patches[2].draw(centerX + spacing, centerY, unit.difficulty.contrast)
    }

    stimulusTimeout.value = window.setTimeout(() => {
      endStimulus()
    }, flashInterval)
  }, flashInterval)

  return showThreeFirst
}

const showClearImageStimulus = (unit: TrainingUnit): boolean => {
  if (!trainingCanvas.value) return false
  const ctx = trainingCanvas.value.getContext('2d')
  if (!ctx) return false

  const minSize = Math.round(windowSize.value.height * 0.08)
  const maxSize = Math.round(windowSize.value.height * 0.2)
  const patchSize = Math.round(minSize + (maxSize - minSize) * unit.difficulty.size)

  const orientation = getStimulsOrientation(currentTrial.value)

  const gabor = new GaborPatch(ctx, patchSize, 0.05, orientation, 0, patchSize / 3, '#A4A4A4')

  // 随机决定哪次显示更高对比度
  const showHighFirst = Math.random() > 0.5
  const highContrast = unit.difficulty.contrast
  const lowContrast = highContrast - (unit.difficulty.contrastDiff ?? 0.2)

  const centerX = Math.round(windowSize.value.width / 2)
  const centerY = Math.round(windowSize.value.height / 2)

  // 第一次闪烁
  drawStimulusFrame()
  gabor.draw(centerX, centerY, showHighFirst ? highContrast : lowContrast)

  // 第二次闪烁
  stimulusTimeout.value = window.setTimeout(() => {
    drawStimulusFrame()
    gabor.draw(centerX, centerY, showHighFirst ? lowContrast : highContrast)

    stimulusTimeout.value = window.setTimeout(() => {
      endStimulus()
    }, 1000)
  }, 1000)

  return showHighFirst
}

const showShiftImageStimulus = (unit: TrainingUnit): boolean => {
  if (!trainingCanvas.value) return false
  const ctx = trainingCanvas.value.getContext('2d')
  if (!ctx) return false

  const centerX = windowSize.value.width / 2
  const centerY = windowSize.value.height / 2

  const minSize = Math.round(windowSize.value.height * 0.08)
  const maxSize = Math.round(windowSize.value.height * 0.15)
  const patchSize = Math.round(minSize + (maxSize - minSize) * unit.difficulty.size)

  const spacing = patchSize * (unit.difficulty.spacing ?? 1.0)
  const shift = unit.difficulty.shift ?? 10

  const patches = Array(3)
    .fill(null)
    .map(() => new GaborPatch(ctx, patchSize, 0.05, 0, 0, patchSize / 3, '#A4A4A4'))

  // 随机选择偏移方向 (0: 左, 1: 右, 2: 上, 3: 下)
  const shiftDirection = Math.floor(Math.random() * 4)
  const isLeftOrUp = shiftDirection === 0 || shiftDirection === 2

  // 计算偏移量
  let shiftX = 0
  let shiftY = 0
  switch (shiftDirection) {
    case 0: // 左
      shiftX = -shift
      break
    case 1: // 右
      shiftX = shift
      break
    case 2: // 上
      shiftY = -shift
      break
    case 3: // 下
      shiftY = shift
      break
  }

  // 显示刺激
  showGrayBackground()
  drawStimulusFrame()
  patches[0].draw(centerX - spacing, centerY, unit.difficulty.contrast)
  patches[1].draw(centerX + shiftX, centerY + shiftY, unit.difficulty.contrast)
  patches[2].draw(centerX + spacing, centerY, unit.difficulty.contrast)

  // 设置结束时间
  stimulusTimeout.value = window.setTimeout(() => {
    endStimulus()
  }, 1000)

  // 返回true表示向左或向上偏移
  return isLeftOrUp
}

const showCrowdingStimulus = (unit: TrainingUnit): boolean => {
  if (!trainingCanvas.value || !currentSession.value) return false
  const ctx = trainingCanvas.value.getContext('2d')
  if (!ctx) return false

  console.log('Showing crowding stimulus')

  // 增大字母大小
  const minSize = Math.round(windowSize.value.height * 0.04) // 从 0.03 增加到 0.04
  const maxSize = Math.round(windowSize.value.height * 0.08) // 从 0.06 增加到 0.08
  const letterSize = Math.round(minSize + (maxSize - minSize) * unit.difficulty.size)

  // 增加间距
  const spacing = letterSize * 1.2 // 从 0.7 增加到 1.2，使字母间距更大
  const flashInterval = currentSession.value.flashRate

  // 设置字体
  ctx.font = `bold ${letterSize}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const centerX = Math.round(windowSize.value.width / 2)
  const centerY = Math.round(windowSize.value.height / 2)

  // 决定是否在第一次显示中间的E
  const showEFirst = Math.random() > 0.5
  // 所有E使用相同的旋转角度
  const commonRotation = Math.floor(Math.random() * 4) * 90
  // 创建7x9的矩阵位置（横向更宽，纵向更窄）
  const positions: [number, number][] = []
  const rows = 7
  const cols = 9

  // 调整横向和纵向的间距比例，使布局更扁平
  const horizontalSpacing = spacing
  const verticalSpacing = spacing * 0.8 // 纵向间距稍微小一些

  const startX = centerX - ((cols - 1) * horizontalSpacing) / 2
  const startY = centerY - ((rows - 1) * verticalSpacing) / 2

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      positions.push([startX + j * horizontalSpacing, startY + i * verticalSpacing])
    }
  }

  const centerIndex = Math.floor(rows / 2) * cols + Math.floor(cols / 2)

  // 第一次闪烁
  showGrayBackground()
  drawStimulusFrame()

  // 绘制字母阵列
  ctx.fillStyle = `rgba(0, 0, 0, ${unit.difficulty.contrast})`

  // 绘制7x9矩阵，所有E使用相同的旋转角度
  positions.forEach(([x, y], index) => {
    if (index === centerIndex) {
      // 中心位置
      if (showEFirst) {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate((commonRotation * Math.PI) / 180)
        ctx.fillText('E', 0, 0)
        ctx.restore()
      }
    } else {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((commonRotation * Math.PI) / 180)
      ctx.fillText('E', 0, 0)
      ctx.restore()
    }
  })

  // 第二次闪烁
  stimulusTimeout.value = window.setTimeout(() => {
    showGrayBackground()
    drawStimulusFrame()

    // 重新绘制字母阵列
    ctx.fillStyle = `rgba(0, 0, 0, ${unit.difficulty.contrast})`

    // 再次绘制7x9矩阵，保持相同的旋转角度
    positions.forEach(([x, y], index) => {
      if (index === centerIndex) {
        // 中心位置
        if (!showEFirst) {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate((commonRotation * Math.PI) / 180)
          ctx.fillText('E', 0, 0)
          ctx.restore()
        }
      } else {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate((commonRotation * Math.PI) / 180)
        ctx.fillText('E', 0, 0)
        ctx.restore()
      }
    })

    // 设置延时等待响应
    stimulusTimeout.value = window.setTimeout(() => {
      showGrayBackground()
      if (!isProcessingResponse.value) {
        isReadyForStimulus.value = true
      }
    }, flashInterval)
  }, flashInterval)

  return showEFirst
}

const clearCanvas = () => {
  if (!trainingCanvas.value) return
  const ctx = trainingCanvas.value.getContext('2d')
  if (!ctx) return

  // 清空画布时显示边框而不是纯背景色
  drawStimulusFrame()
}

const showCorrectFeedback = () => {
  if (!trainingCanvas.value || !settings.value.feedback.visual.enabled) return
  const ctx = trainingCanvas.value.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = settings.value.feedback.visual.correctColor
  ctx.fillRect(0, 0, windowSize.value.width, windowSize.value.height)
}

const showErrorFeedback = () => {
  if (!trainingCanvas.value || !settings.value.feedback.visual.enabled) return
  const ctx = trainingCanvas.value.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = settings.value.feedback.visual.incorrectColor
  ctx.fillRect(0, 0, windowSize.value.width, windowSize.value.height)
}

const playSound = async (type: 'correct' | 'incorrect' | 'finishUnit' | 'finishEpoch') => {
  try {
    if (!settings.value.feedback.audio.enabled) return

    switch (type) {
      case 'correct':
        if (settings.value.feedback.audio.correctSound) {
          await soundManager.playCorrect()
        }
        break
      case 'incorrect':
        if (settings.value.feedback.audio.incorrectSound) {
          await soundManager.playIncorrect()
        }
        break
      case 'finishUnit':
        await soundManager.playFinishUnit()
        break
      case 'finishEpoch':
        await soundManager.playFinishEpoch()
        break
    }
  } catch (err) {
    console.warn('Failed to play sound:', err)
  }
}

const handleResponse = async (isCorrect: boolean) => {
  if (isProcessingResponse.value || !currentSession.value || currentCorrectAnswer.value === null) {
    console.log('Response blocked:', {
      isProcessingResponse: isProcessingResponse.value,
      hasSession: !!currentSession.value,
      currentCorrectAnswer: currentCorrectAnswer.value,
    })
    return
  }

  console.log('Processing response:', {
    isCorrect,
    currentCorrectAnswer: currentCorrectAnswer.value,
    currentTrial: currentTrial.value,
    totalTrials: currentSession.value.units[currentUnit.value].totalTrials,
  })

  isProcessingResponse.value = true

  try {
    const currentUnitTrials = currentSession.value.units[currentUnit.value].totalTrials
    const reactionTime = Date.now() - lastStimulusTime.value

    // 判断是否正确
    const isActuallyCorrect = isCorrect === currentCorrectAnswer.value

    // 更新单元的统计数据
    const unit = currentSession.value.units[currentUnit.value]

    // 更新统计数据（无论是否是最后一次试验都要更新）
    unit.completedTrials++
    if (isActuallyCorrect) {
      unit.correctTrials++
    }
    unit.reactionTimes.push(reactionTime)

    // 更新训练存储
    trainingStore.updateUnitProgress(currentUnit.value, isActuallyCorrect, reactionTime)

    // 显示视觉反馈
    if (isActuallyCorrect) {
      showCorrectFeedback()
    } else {
      showErrorFeedback()
    }

    // 播放声音反馈
    await playSound(isActuallyCorrect ? 'correct' : 'incorrect')

    // 检查是否是单元的最后一次试验
    if (currentTrial.value >= currentUnitTrials - 1) {
      console.log('Last trial of unit completed')

      // 等待一段时间显示反馈
      await new Promise((resolve) => setTimeout(resolve, isActuallyCorrect ? 500 : 1500))

      // 重置状态
      isShowingStimulus.value = false
      isReadyForStimulus.value = false
      currentCorrectAnswer.value = null
      isProcessingResponse.value = false

      // 显示灰色背景
      showGrayBackground()

      // 播放单元完成音效并等待播放完成
      await playSound('finishUnit')

      // 保存当前进度
      trainingStore.saveUnitProgress(currentUnit.value)

      // 显示单元总结
      console.log('Showing unit summary')
      isShowingSummary.value = true

      return
    } else {
      // 不是最后一次，继续下一次试验
      currentTrial.value++
      const delay = isActuallyCorrect ? 500 : 1500

      setTimeout(() => {
        showGrayBackground()
        drawFixationPoint()
        currentCorrectAnswer.value = null
        isReadyForStimulus.value = true
        isProcessingResponse.value = false
        isShowingStimulus.value = false
      }, delay)
    }
  } catch (error) {
    console.error('Error in handleResponse:', error)
    isProcessingResponse.value = false
  }
}

const handleContinueTraining = async () => {
  try {
    if (!currentSession.value) return

    // 重置训练数据
    correctAnswers.value = []
    reactionTimes.value = []
    currentTrial.value = 0
    currentCorrectAnswer.value = null
    isShowingSummary.value = false
    isProcessingResponse.value = false

    // 检查是否是最后一个单元
    if (currentUnit.value >= totalUnits.value - 1) {
      // 最后一个单元完成，直接完成训练并跳转到报告页面
      await finishTraining()
    } else {
      // 进入下一单元
      currentUnit.value++
      // 保存当前进度
      trainingStore.saveUnitProgress(currentUnit.value)
      // TODO 在设置中设置，是否在每单元结束后，单元总结后，显示新单元的操作介绍
      // setupTrainingUnit()
      isReadyForStimulus.value = true
      showGrayBackground()
      drawFixationPoint()
    }
  } catch (error) {
    console.error('Error while continuing training:', error)
  }
}

const calculateQuality = (accuracy: number, stability: number, avgReactionTime: number): number => {
  // 将反应时间标准化到0-100的范围
  // 理想反应时间为1000ms，最大可接受时间为2500ms
  const normalizedReactionTime = Math.max(
    0,
    Math.min(100, ((2500 - avgReactionTime) / (2500 - 1000)) * 100),
  )

  // 权重分配：正确率40%，稳定性40%，反应时间20%
  return accuracy * 0.4 + stability * 0.4 + normalizedReactionTime * 0.2
}

const finishTraining = async () => {
  if (currentSession.value) {
    try {
      console.log('Starting to finish training...')

      // 设置结束时间
      currentSession.value.endTime = Date.now()

      // 计算并保存最终的训练统计数据
      const finalStats = currentSession.value.units.map((unit) => {
        const accuracy =
          unit.completedTrials > 0 ? (unit.correctTrials / unit.completedTrials) * 100 : 0
        const avgReactionTime =
          unit.reactionTimes.length > 0
            ? unit.reactionTimes.reduce((sum, time) => sum + time, 0) / unit.reactionTimes.length
            : 0
        const stability = calculateStability(unit)
        const quality = calculateQuality(accuracy, stability, avgReactionTime)

        return {
          mode: unit.mode,
          difficulty: unit.difficulty,
          flashRate: currentSession.value?.flashRate || 0,
          totalTrials: unit.totalTrials,
          completedTrials: unit.completedTrials,
          correctTrials: unit.correctTrials,
          accuracy,
          stability,
          quality,
          averageReactionTime: avgReactionTime,
          reactionTimes: unit.reactionTimes,
        }
      })

      // 计算整体训练的平均指标
      const overallStats = finalStats.reduce(
        (acc, unit) => {
          acc.accuracy += unit.accuracy
          acc.stability += unit.stability
          acc.quality += unit.quality
          acc.averageReactionTime += unit.averageReactionTime
          return acc
        },
        { accuracy: 0, stability: 0, quality: 0, averageReactionTime: 0 },
      )

      const unitsCount = finalStats.length
      const sessionRecord = {
        id: currentSession.value.id,
        startTime: currentSession.value.startTime,
        endTime: currentSession.value.endTime,
        units: finalStats,
        mode: currentSession.value.mode || 'mixed',
        flashRate: currentSession.value.flashRate,
        accuracy: overallStats.accuracy / unitsCount,
        stability: overallStats.stability / unitsCount,
        quality: overallStats.quality / unitsCount,
        averageReactionTime: overallStats.averageReactionTime / unitsCount,
        difficulty: currentSession.value.units[0].difficulty,
      }

      console.log('Session record prepared:', sessionRecord)

      // 保存记录并清除当前会话
      await trainingStore.completeSession(sessionRecord)
      trainingStore.clearCurrentSession()

      // 直接跳转到报告页面
      router.push('/report')
    } catch (error) {
      console.error('Error saving training session:', error)
    }
  }
}

const exitTraining = () => {
  if (confirm(t('common.confirmExitTraining'))) {
    // 保存当前会话（如果存在）
    if (currentSession.value) {
      trainingStorage.saveCurrentSession(currentSession.value)
    }

    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }

    // 重置所有状态
    isTraining.value = false
    isShowingStimulus.value = false
    isProcessingResponse.value = false
    isReadyForStimulus.value = false
    currentCorrectAnswer.value = null

    // 返回主页
    router.push('/')
  }
}

const setupTrainingUnit = () => {
  if (!currentSession.value) return
  const unit = currentSession.value.units[currentUnit.value]
  if (!unit) {
    finishTraining()
    return
  }

  currentTrial.value = 0
  isTraining.value = false
  isShowingStimulus.value = false
}

const updateWindowSize = () => {
  // 只在尺寸真正改变时更新
  if (
    windowSize.value.width !== window.innerWidth ||
    windowSize.value.height !== window.innerHeight
  ) {
    windowSize.value = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    if (trainingCanvas.value) {
      trainingCanvas.value.width = windowSize.value.width
      trainingCanvas.value.height = windowSize.value.height

      // 只在训练状态且不显示刺激时重绘注视点
      if (isTraining.value && !isShowingStimulus.value) {
        drawFixationPoint()
      }
    }
  }
}

const handleMouseDown = (event: MouseEvent) => {
  // 防止事件冒泡和默认行为
  event.preventDefault()
  event.stopPropagation()

  console.log('Mouse button pressed:', event.button, {
    isTraining: isTraining.value,
    isShowingStimulus: isShowingStimulus.value,
    isProcessingResponse: isProcessingResponse.value,
    isReadyForStimulus: isReadyForStimulus.value,
    currentCorrectAnswer: currentCorrectAnswer.value,
    isShowingSummary: isShowingSummary.value,
  })

  // 如果正在显示总结界面，忽略所有鼠标输入
  if (isShowingSummary.value) {
    return
  }

  // 处理中键 - start trial or training unit
  if (event.button === 1) {
    if (!isTraining.value) {
      console.log('Starting training unit with middle button')
      startCurrentUnit()
      return
    }

    if (!isShowingStimulus.value && !isProcessingResponse.value) {
      if (isReadyForStimulus.value) {
        console.log('Starting trial with middle button')
        startTrial()
      } else {
        console.log('Setting ready for stimulus')
        isReadyForStimulus.value = true
        drawFixationPoint()
      }
    }
    return
  }

  // 如果不在训练状态，忽略其他输入
  if (!isTraining.value) return

  // 检查是否在处理响应
  if (isProcessingResponse.value) {
    console.log('Mouse input blocked: processing response')
    return
  }

  // 如果没有正在显示刺激且没有正确答案，且已准备好，左键/右键可以触发开始试验
  if (currentCorrectAnswer.value === null) {
    if (isReadyForStimulus.value && !isShowingStimulus.value) {
      console.log('Starting trial with left/right click')
      startTrial()
    } else {
      console.log('Mouse input blocked: no correct answer, not ready')
    }
    return
  }

  // 检查鼠标按键并处理响应
  if (event.button === 0) {
    // 左键
    console.log('Left mouse button - handling as true')
    handleResponse(true)
  } else if (event.button === 2) {
    // 右键
    console.log('Right mouse button - handling as false')
    handleResponse(false)
  }
}

// 难度调整函数
const adjustDifficulty = (unit: TrainingUnit, results: UnitResults) => {
  const { correctRate, stability } = results
  // 根据稳定性计算调整系数 (0.1-0.3)
  const adjustFactor = 0.1 + stability * 0.2

  switch (unit.mode) {
    case 'three_image':
    case 'shift_image':
      // 调整间距
      if (correctRate > 0.8) {
        // 正确率高，减小间距
        unit.difficulty.spacing = Math.max(
          1.0, // 最小间距
          (unit.difficulty.spacing ?? 1.5) - adjustFactor * 0.2,
        )
      } else if (correctRate < 0.6) {
        // 正确率低，增加间距
        unit.difficulty.spacing = Math.min(
          2.0, // 最大间距
          (unit.difficulty.spacing ?? 1.5) + adjustFactor * 0.2,
        )
      }
      break
  }
}

// 计算稳定性的辅助函数
const calculateStability = (unit: TrainingUnit): number => {
  if (unit.completedTrials < 5) return 0

  // 计算反应时间的稳定性
  const reactionTimes = unit.reactionTimes
  const avgReactionTime = reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length
  const timeVariance =
    reactionTimes.reduce((acc, time) => acc + Math.pow(time - avgReactionTime, 2), 0) /
    reactionTimes.length
  // 调整反应时间波动的容忍度，基于理想反应时间1000ms
  const timeStability = Math.min(100, 100 / (1 + Math.sqrt(timeVariance) / 300))

  // 计算正确率的稳定性
  const windowSize = 5 // 使用5次试验作为一个窗口
  const windows = []
  for (let i = windowSize; i <= unit.completedTrials; i++) {
    const windowStart = i - windowSize
    const windowCorrect = unit.reactionTimes
      .slice(windowStart, i)
      .filter((_, index) => windowStart + index < unit.correctTrials).length
    windows.push(windowCorrect / windowSize)
  }

  // 计算正确率的变异系数
  const avgAccuracy = windows.reduce((sum, acc) => sum + acc, 0) / windows.length
  const accuracyVariance =
    windows.reduce((acc, val) => acc + Math.pow(val - avgAccuracy, 2), 0) / windows.length
  const accuracyStability = Math.min(100, 100 / (1 + Math.sqrt(accuracyVariance) * 5))

  // 调整权重：正确率稳定性占70%，反应时间稳定性占30%
  return accuracyStability * 0.7 + timeStability * 0.3
}

const calculateUnitResults = (): UnitResults => {
  if (!currentSession.value) {
    return {
      correctRate: 0,
      stability: 0,
      avgReactionTime: 0,
    }
  }

  const correctRate = correctAnswers.value.filter((x) => x).length / correctAnswers.value.length
  const stability = calculateStability(currentSession.value.units[currentUnit.value])
  const avgReactionTime =
    reactionTimes.value.reduce((a, b) => a + b, 0) / reactionTimes.value.length

  return {
    correctRate,
    stability,
    avgReactionTime,
  }
}

// 格式化辅助函数
const formatPercent = (value: number) => {
  return value.toFixed(1)
}

const formatTime = (value: number) => {
  return Math.round(value)
}

// 计算属性
const currentCorrectRate = computed(() => {
  if (!currentSession.value || !currentSession.value.units[currentUnit.value]) return 0
  const unit = currentSession.value.units[currentUnit.value]
  if (unit.completedTrials === 0) return 0
  return Math.round((unit.correctTrials / unit.completedTrials) * 100)
})

const currentStability = computed(() => {
  if (!currentSession.value || !currentSession.value.units[currentUnit.value]) return 0
  const unit = currentSession.value.units[currentUnit.value]
  return calculateStability(unit)
})

const averageReactionTime = computed(() => {
  if (!currentSession.value || !currentSession.value.units[currentUnit.value]) return 0
  const unit = currentSession.value.units[currentUnit.value]
  if (unit.reactionTimes.length === 0) return 0
  const total = unit.reactionTimes.reduce((sum, time) => sum + time, 0)
  return Math.round(total / unit.reactionTimes.length)
})

const currentPatchSize = computed(() => {
  if (!currentSession.value) return 0
  return currentSession.value.units[currentUnit.value].difficulty.size
})

const currentContrast = computed(() => {
  if (!currentSession.value) return 0
  return currentSession.value.units[currentUnit.value].difficulty.contrast
})

const currentSpacing = computed(() => {
  if (!currentSession.value) return 0
  return currentSession.value.units[currentUnit.value].difficulty.spacing ?? 1.5
})

const currentShift = computed(() => {
  if (!currentSession.value) return 0
  return currentSession.value.units[currentUnit.value].difficulty.shift ?? 10
})

const currentContrastDiff = computed(() => {
  if (!currentSession.value) return 0
  return currentSession.value.units[currentUnit.value].difficulty.contrastDiff ?? 0.2
})

const currentUnitStats = computed(() => {
  if (!currentSession.value || !currentSession.value.units[currentUnit.value]) {
    return {
      accuracy: 0,
      stability: 0,
      quality: 0,
      averageReactionTime: 0,
      correctTrials: 0,
      totalTrials: 0,
    }
  }

  const unit = currentSession.value.units[currentUnit.value]

  // 如果没有完成任何试验，返回默认值
  if (unit.completedTrials === 0 || unit.reactionTimes.length === 0) {
    return {
      accuracy: 0,
      stability: 0,
      quality: 0,
      averageReactionTime: 0,
      correctTrials: unit.correctTrials,
      totalTrials: unit.completedTrials,
    }
  }

  // 计算正确率
  const accuracy = (unit.correctTrials / unit.completedTrials) * 100

  // 计算平均反应时间
  const averageReactionTime =
    unit.reactionTimes.reduce((sum, time) => sum + time, 0) / unit.reactionTimes.length

  // 计算稳定性
  const stability = calculateStability(unit)

  // 计算训练质量
  const quality = calculateQuality(accuracy, stability, averageReactionTime)

  return {
    accuracy,
    stability,
    quality,
    averageReactionTime,
    correctTrials: unit.correctTrials,
    totalTrials: unit.completedTrials,
  }
})

const startCurrentUnit = async () => {
  try {
    console.log('Starting training unit...')

    // 进入全屏
    await enterFullscreen()

    // 等待全屏转换完成
    await new Promise((resolve) => setTimeout(resolve, 100))

    // 设置训练状态
    isTraining.value = true
    isProcessingResponse.value = false
    isShowingStimulus.value = false
    isReadyForStimulus.value = true
    currentCorrectAnswer.value = null

    // 使用 nextTick 确保 DOM 更新后再进行画布操作
    await nextTick()

    // 确保画布元素存在
    if (!trainingCanvas.value) {
      console.error('Canvas element not found, retrying...')
      await new Promise((resolve) => setTimeout(resolve, 100))
      if (!trainingCanvas.value) {
        throw new Error('Canvas element not found after retry')
      }
    }

    // 初始化画布
    initializeCanvas()

    // 预加载音频
    try {
      await soundManager.preloadSounds()
      console.log('Audio preloaded successfully')
    } catch (err) {
      console.warn('Audio preload failed:', err)
    }

    // 确保画布尺寸正确后再绘制注视点
    await nextTick()
    drawFixationPoint()

    console.log('Training unit started successfully')
  } catch (err) {
    console.error('Failed to start training:', err)
    // 尝试恢复到可用状态
    isProcessingResponse.value = false
    isShowingStimulus.value = false
    isReadyForStimulus.value = true
  }
}

onMounted(async () => {
  console.log('Component mounting...')

  // 等待用户第一次交互后初始化音频
  await soundManager.initialize()
  console.log('Audio initialized')

  // 初始化训练
  initializeTraining()

  // 初始化画布
  initializeCanvas()

  // 设置焦点以确保可以接收键盘事件
  const trainingView = document.querySelector('.training-view') as HTMLElement
  if (trainingView) {
    trainingView.focus()
  }

  console.log('Component mounted successfully')
})

onUnmounted(() => {
  if (stimulusTimeout.value) {
    clearTimeout(stimulusTimeout.value)
  }
  if (isFullscreen.value && document.exitFullscreen) {
    document.exitFullscreen()
  }
})

const handleModeChange = async (mode: string) => {
  // 检查是否有未完成的训练
  if (currentSession.value) {
    const shouldOverwrite = await new Promise<boolean>((resolve) => {
      const result = confirm(t('common.confirmSwitchModeNew'))
      resolve(result)
    })

    if (!shouldOverwrite) {
      return
    }

    // 清除当前会话
    trainingStore.clearCurrentSession()
  }

  // 设置新的训练模式
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

  trainingStore.setTrainingMode(mode)
  trainingStore.initializeSession()
}

const isValidTrainingMode = (mode: string): mode is TrainingMode => {
  return Object.values(TRAINING_MODES).includes(mode as TrainingMode)
}

const getUnitDifficulty = (unit: TrainingUnit) => {
  return {
    size: unit.difficulty.size ?? 0.12,
    contrast: unit.difficulty.contrast ?? 0.5,
    spacing: unit.difficulty.spacing ?? 1.5,
    shift: unit.difficulty.shift ?? 15,
    contrastDiff: unit.difficulty.contrastDiff ?? 0.2,
  }
}

const nextUnitMode = computed(() => {
  if (!currentSession.value || currentUnit.value >= totalUnits.value - 1) return undefined
  return currentSession.value.units[currentUnit.value + 1].mode
})

// 添加键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  // ESC 键特殊处理，直接调用退出函数
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    exitTraining()
    return
  }
}

// 确保在组件挂载时添加事件监听器
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown, true)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown, true)
})
</script>

<style scoped>
.training-view {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.training-start {
  text-align: center;
  padding: 2rem;
  background-color: #1a1a1a;
  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.mode-info {
  margin: 2rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.key-hints {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.hint {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.start-button {
  padding: 1rem 3rem;
  font-size: 1.2rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.start-button:hover {
  transform: translateY(-2px);
}

.training-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #a4a4a4;
}

.training-info {
  position: absolute;
  top: 20px;
  right: 20px;
  color: #fff;
  text-align: right;
  background: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
}

.mode-name {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #4caf50;
}

.unit-info,
.trial-info {
  margin-top: 0.5rem;
  font-size: 1rem;
  opacity: 0.8;
}

.debug-metrics,
.debug-params {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.debug-metrics > div,
.debug-params > div {
  margin: 5px 0;
  opacity: 0.8;
}

.test-mode-badge {
  font-size: 0.8rem;
  background-color: #ff9800;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.controls-info {
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.controls-section {
  margin: 1rem 0;
}

.controls-section h4 {
  color: #4caf50;
  margin-bottom: 0.5rem;
}

.controls-section ul {
  list-style: none;
  padding: 0;
}

.controls-section li {
  margin: 0.5rem 0;
  color: #fff;
}

.summary-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
</style>
