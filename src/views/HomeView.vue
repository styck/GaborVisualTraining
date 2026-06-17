<template>
  <div class="home">
    <div class="content">
      <h1>{{ $t('home.title') }}</h1>
      <h2 class="training-count">{{ $t('common.sessionTraining') }} #{{ mixedTrainingCount + 1 }}</h2>

      <div class="stats" v-if="hasHistory">
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-label">{{ t('home.totalSessions') }}</div>
            <div class="stat-value">{{ totalSessions }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">{{ t('home.averageQuality') }}</div>
            <div class="stat-value">{{ formatPercent(averageQuality) }}%</div>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button class="primary-button" @click="startTraining" :disabled="isTrainingTooSoon">
          <i class="fas fa-play"></i>
          {{ $t('home.startTraining') }}
        </button>

        <button v-if="hasHistory" class="retry-button" @click="handleRetry">
          {{ t('report.retry') }}
        </button>

        <button class="secondary-button" @click="selectMode">
          {{ $t('selectMode.title') }}
        </button>

        <button
          class="resume-button"
          :class="{ disabled: !hasCurrentSession }"
          @click="showSessionInfo"
        >
          {{ $t('common.resumeTraining') }}
        </button>
      </div>

      <div v-if="isTrainingTooSoon && selectedMode === 'mixed'" class="warning">
        {{ $t('home.trainingTooSoon', { hours: remainingHours }) }}
      </div>

      <!-- 训练信息弹窗 -->
      <div v-if="showDialog" class="dialog-overlay" @click.self="closeDialog">
        <div class="dialog">
          <h3>{{ $t('common.sessionInfo') }}</h3>
          <div class="session-info">
            <p>{{ $t('common.trainingType') }}: {{ currentModeTitle }}</p>
            <p>{{ $t('common.startTime') }}: {{ formatTime(sessionStartTime) }}</p>
            <p>{{ $t('common.currentProgress') }}: {{ currentUnit + 1 }}/{{ totalUnits }}</p>
          </div>
          <div class="dialog-actions">
            <button class="continue-btn" @click="continueTraining">{{ $t('common.continue') }}</button>
            <button class="delete-btn" @click="deleteSession">{{ $t('common.deleteTraining') }}</button>
            <button class="cancel-btn" @click="closeDialog">{{ $t('common.cancel') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTrainingStore } from '@/stores/training'
import { useI18n } from 'vue-i18n'
import { TRAINING_MODES } from '@/types'

const router = useRouter()
const trainingStore = useTrainingStore()
const { t } = useI18n()

const showDialog = ref(false)
const selectedMode = ref('mixed')

// 计算属性
const hasHistory = computed(() => trainingStore.trainingHistory.length > 0)
const hasCurrentSession = computed(() => !!trainingStore.currentSession)
const totalSessions = computed(() => trainingStore.trainingHistory.length)

// 只计算混合训练的次数
const mixedTrainingCount = computed(() => {
  // 直接从本地存储获取最新的训练记录
  const history = JSON.parse(localStorage.getItem('training_history') || '[]') as Array<{
    mode: string
    isCompleted: boolean
    endTime?: number
  }>
  const mixedSessions = history.filter(
    (session) => session.mode === TRAINING_MODES.MIXED && session.isCompleted,
  )
  return mixedSessions.length
})

const currentModeTitle = computed(() => {
  if (!trainingStore.currentSession) return ''
  const mode = trainingStore.currentSession.mode
  switch (mode) {
    case TRAINING_MODES.SINGLE_IMAGE:
      return t('selectMode.modes.SINGLE_IMAGE')
    case TRAINING_MODES.THREE_IMAGE:
      return t('selectMode.modes.THREE_IMAGE')
    case TRAINING_MODES.CLEAR_IMAGE:
      return t('selectMode.modes.CLEAR_IMAGE')
    case TRAINING_MODES.SHIFT_IMAGE:
      return t('selectMode.modes.SHIFT_IMAGE')
    case TRAINING_MODES.CROWDING:
      return t('selectMode.modes.CROWDING')
    case TRAINING_MODES.MIXED:
      return t('training.modes.mixed.title')
    default:
      return ''
  }
})

const averageQuality = computed(() => {
  const history = trainingStore.trainingHistory
  if (!history || history.length === 0) return 0

  // 找到最近的一条混合训练记录
  const latestMixedSession = [...history]
    .sort((a, b) => b.startTime - a.startTime)
    .find(
      (session) =>
        session.mode === TRAINING_MODES.MIXED &&
        typeof session.quality === 'number' &&
        session.quality > 0,
    )

  return latestMixedSession?.quality || 0
})

const sessionStartTime = computed(() => trainingStore.currentSession?.startTime || 0)

const currentUnit = computed(() => trainingStore.currentSession?.currentUnit || 0)

const totalUnits = computed(() => trainingStore.currentSession?.units.length || 0)

const lastMixedTrainingTime = computed(() => {
  const history = JSON.parse(localStorage.getItem('training_history') || '[]') as Array<{
    mode: string
    endTime?: number
  }>
  const mixedSessions = history.filter(
    (session) => session.mode === TRAINING_MODES.MIXED && session.endTime,
  )
  if (mixedSessions.length === 0) return null
  return new Date(mixedSessions[mixedSessions.length - 1].endTime!)
})

const remainingHours = computed(() => {
  if (!lastMixedTrainingTime.value) return 0
  const hoursSinceLastTraining =
    (Date.now() - lastMixedTrainingTime.value.getTime()) / (1000 * 60 * 60)
  const remaining = Math.ceil(8 - hoursSinceLastTraining)
  return remaining > 0 ? remaining : 0
})

// 检查最近8小时内是否有混合训练
const hasRecentMixedTraining = computed(() => {
  // 确保从 localStorage 加载最新的训练记录
  const history = JSON.parse(localStorage.getItem('training_history') || '[]') as Array<{
    mode: string
    endTime?: number
  }>
  const recentSessions = history.filter((session) => {
    if (!session.endTime) return false
    const timeDiff = (Date.now() - new Date(session.endTime).getTime()) / (1000 * 60 * 60)
    return timeDiff < 8 && session.mode === TRAINING_MODES.MIXED
  })
  return recentSessions.length > 0
})

const isTrainingTooSoon = computed(() => {
  return hasRecentMixedTraining.value
})

// 方法
const loadTrainingHistory = () => {
  trainingStore.loadTrainingHistory()
}

const startTraining = () => {
  // 再次检查训练记录
  if (hasRecentMixedTraining.value) {
    return
  }
  if (!trainingStore.currentSession) {
    trainingStore.setTrainingMode(TRAINING_MODES.MIXED)
    trainingStore.initializeSession()
  }
  router.push('/training')
}

const selectMode = () => {
  if (trainingStore.currentSession) {
    if (!confirm(t('common.confirmSwitchMode'))) {
      return
    }
    trainingStore.clearCurrentSession()
  }
  router.push('/select-mode')
}

const showSessionInfo = () => {
  if (hasCurrentSession.value) {
    showDialog.value = true
  }
}

const closeDialog = () => {
  showDialog.value = false
}

const continueTraining = () => {
  closeDialog()
  router.push('/training')
}

const deleteSession = () => {
  if (confirm(t('common.confirmDeleteSession'))) {
    trainingStore.clearCurrentSession()
    closeDialog()
  }
}

const handleRetry = () => {
  if (trainingStore.currentSession) {
    if (!confirm(t('common.confirmRetryTraining'))) {
      return
    }
    trainingStore.clearCurrentSession()
  }
  trainingStore.removeLastTrainingRecord()
  // 重新加载训练记录
  loadTrainingHistory()
  router.push('/training')
}

// 处理ESC键
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (showDialog.value) {
      closeDialog()
    } else if (router.currentRoute.value.path === '/training') {
      exitTraining()
    }
  }
}

const exitTraining = () => {
  if (confirm(t('common.confirmExitTraining'))) {
    if (trainingStore.currentSession) {
      // 使用 localStorage 直接保存
      localStorage.setItem('current_session', JSON.stringify(trainingStore.currentSession))
    }
    router.push('/')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  loadTrainingHistory() // 加载训练记录
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 格式化函数
function formatPercent(value: number): string {
  return value.toFixed(1)
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date)
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #fff;
  padding: 2rem;
  padding-top: 5rem;
}

.content {
  text-align: center;
  max-width: 800px;
  width: 100%;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: fadeIn 1s ease-out;
}

.training-count {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #4caf50;
  font-weight: 500;
}

.stats {
  margin: 2rem 0;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(30, 33, 40, 0.6);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #fff;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
  align-items: center;
}

.primary-button {
  background: #4caf50;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 300px;
}

.primary-button:hover {
  background: #45a049;
}

.primary-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.retry-button {
  background: #ffc107;
  color: #000;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 250px;
}

.retry-button:hover {
  background: #ffb300;
}

.secondary-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 250px;
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.resume-button {
  background: #2196f3;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 250px;
}

.resume-button:hover {
  background: #1e88e5;
}

.resume-button.disabled {
  background: #ccc;
  cursor: not-allowed;
}

.warning {
  color: #ffc107;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 1.5rem;
  min-width: 300px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dialog h3 {
  margin: 0 0 1rem 0;
  color: #fff;
  text-align: center;
}

.session-info {
  margin: 1rem 0;
}

.session-info p {
  margin: 0.5rem 0;
  color: #fff;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.continue-btn,
.delete-btn,
.cancel-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.continue-btn {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.4);
  color: #fff;
}

.continue-btn:hover {
  background: rgba(76, 175, 80, 0.3);
}

.delete-btn {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.4);
  color: #fff;
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.3);
}

.cancel-btn {
  background: rgba(158, 158, 158, 0.2);
  border: 1px solid rgba(158, 158, 158, 0.4);
  color: #fff;
}

.cancel-btn:hover {
  background: rgba(158, 158, 158, 0.3);
}
</style>
