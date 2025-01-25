<template>
  <div class="report-view">
    <div class="report-header">
      <h1>{{ t('report.title') }}</h1>
      <div class="controls">
        <button @click="showChart = !showChart">
          {{ t(showChart ? 'report.hideChart' : 'report.showChart') }}
        </button>
        <button @click="showDetails = !showDetails">
          {{ t(showDetails ? 'report.hideDetails' : 'report.showDetails') }}
        </button>
        <button class="danger-button" @click="confirmClearHistory">
          {{ t('report.clearHistory') }}
        </button>
      </div>
      <div class="actions">
        <button class="retry-btn" @click="handleRetry">
          {{ t('report.retry') }}
        </button>
        <button class="back-button" @click="goBack">
          {{ t('common.back') }}
        </button>
      </div>
    </div>

    <div v-if="hasHistory" class="report-content">
      <div v-if="showChart" class="progress-chart">
        <h2>{{ t('report.progressTrend') }}</h2>
        <Line :data="chartData" :options="chartOptions" />
      </div>

      <div class="recent-sessions">
        <h2>{{ t('report.recentSessions') }}</h2>
        <div class="sessions-table">
          <table>
            <thead>
              <tr>
                <th>{{ t('report.date') }}</th>
                <th>{{ t('report.mode') }}</th>
                <th>{{ t('report.quality') }}</th>
                <th>{{ t('report.accuracy') }}</th>
                <th>{{ t('report.stability') }}</th>
                <th>{{ t('report.reactionTime') }}</th>
                <th>{{ t('report.size') }}</th>
                <th>{{ t('report.contrast') }}</th>
                <th>{{ t('report.flashRate') }}</th>
                <th v-if="showDetails">{{ t('report.spacing') }}</th>
                <th v-if="showDetails">{{ t('report.shift') }}</th>
                <th v-if="showDetails">{{ t('report.contrastDiff') }}</th>
                <th>{{ t('report.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(session, sessionIndex) in recentSessions" :key="sessionIndex">
                <tr v-if="!showDetails" :class="{ 'session-row': true }">
                  <td>{{ formatDateTime(session.startTime) }}</td>
                  <td>
                    {{
                      session.units?.length > 1 &&
                      session.units.some((u) => u.mode !== session.units[0].mode)
                        ? t('training.modes.mixed.title')
                        : t(`training.modes.${session.units?.[0]?.mode || 'single_image'}.title`)
                    }}
                  </td>
                  <td>{{ formatPercent(session.quality) }}%</td>
                  <td>{{ formatPercent(session.accuracy) }}%</td>
                  <td>{{ formatPercent(session.stability) }}%</td>
                  <td>{{ formatTime(session.averageReactionTime) }}ms</td>
                  <td>{{ formatPercent((session.difficulty?.size || 0) * 100) }}%</td>
                  <td>{{ formatPercent((session.difficulty?.contrast || 0) * 100) }}%</td>
                  <td>{{ session.flashRate || 0 }}ms</td>
                  <td>
                    <button class="delete-btn" @click="deleteRecord(sessionIndex)">
                      {{ t('report.delete') }}
                    </button>
                  </td>
                </tr>
                <template
                  v-else
                  v-for="(unit, unitIndex) in session.units || []"
                  :key="`${sessionIndex}-${unitIndex}`"
                >
                  <tr :class="{ 'first-unit': unitIndex === 0 }">
                    <td>{{ unitIndex === 0 ? formatDateTime(session.startTime) : '' }}</td>
                    <td>{{ t(`training.modes.${unit.mode || 'single_image'}.title`) }}</td>
                    <td>{{ formatPercent(unit.quality) }}%</td>
                    <td>{{ formatPercent(unit.accuracy) }}%</td>
                    <td>{{ formatPercent(unit.stability) }}%</td>
                    <td>{{ formatTime(unit.averageReactionTime) }}ms</td>
                    <td>{{ formatPercent((unit.difficulty?.size || 0) * 100) }}%</td>
                    <td>{{ formatPercent((unit.difficulty?.contrast || 0) * 100) }}%</td>
                    <td>{{ unit.flashRate || 0 }}ms</td>
                    <td>
                      {{
                        unit.difficulty?.spacing
                          ? formatPercent(unit.difficulty.spacing * 100) + '%'
                          : '-'
                      }}
                    </td>
                    <td>{{ unit.difficulty?.shift || '-' }}</td>
                    <td>
                      {{
                        unit.difficulty?.contrastDiff
                          ? formatPercent(unit.difficulty.contrastDiff * 100) + '%'
                          : '-'
                      }}
                    </td>
                    <td v-if="unitIndex === 0">
                      <button class="delete-btn" @click="deleteRecord(sessionIndex)">
                        {{ t('report.delete') }}
                      </button>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="no-data">
      <p>{{ t('report.noData') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTrainingStore } from '@/stores/training'
import { useI18n } from 'vue-i18n'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const router = useRouter()
const trainingStore = useTrainingStore()
const { t } = useI18n()

const showChart = ref(false)
const showDetails = ref(false)

// 在组件挂载时加载训练历史记录
onMounted(() => {
  console.log('Loading training history...')
  trainingStore.loadTrainingHistory()
})

const hasHistory = computed(() => {
  const history = trainingStore.trainingHistory
  console.log('Current history:', history)
  return Array.isArray(history) && history.length > 0
})

const recentSessions = computed(() => {
  const sessions = [...(trainingStore.trainingHistory || [])]
  // 按时间排序，最新的在最上面
  sessions.sort((a, b) => b.startTime - a.startTime)
  return sessions
})

const chartData = computed(() => {
  // 反转顺序，使最新的记录显示在右侧
  const reversedSessions = [...recentSessions.value].reverse()
  return {
    labels: reversedSessions.map((_, index) => `#${reversedSessions.length - index}`),
    datasets: [
      {
        label: t('report.quality'),
        data: reversedSessions.map((record) => {
          // 确保 quality 是有效的数字
          const quality = typeof record.quality === 'number' ? record.quality : 0
          return parseFloat(quality.toFixed(1))
        }),
        borderColor: '#4CAF50',
        tension: 0.1,
        fill: false,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2, // 设置宽高比为2:1
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        color: '#fff',
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
    x: {
      ticks: {
        color: '#fff',
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: '#fff',
      },
    },
  },
}

function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0.0'
  return value.toFixed(1)
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(time: number | undefined | null): string {
  if (time === undefined || time === null) return '0'
  return Math.round(time).toString()
}

function goBack() {
  router.back()
}

function handleRetry() {
  trainingStore.removeLastTrainingRecord()
  router.push('/training')
}

function confirmClearHistory() {
  if (confirm(t('report.confirmClearHistory'))) {
    trainingStore.clearTrainingHistory()
  }
}

function deleteRecord(index: number) {
  if (confirm(t('report.confirmDeleteRecord'))) {
    // 由于 recentSessions 已经重新排序，我们需要找到原始数组中的正确索引
    const targetRecord = recentSessions.value[index]
    const originalIndex = trainingStore.trainingHistory.findIndex(
      (record) => record.startTime === targetRecord.startTime,
    )
    if (originalIndex !== -1) {
      trainingStore.deleteTrainingRecord(originalIndex)
    }
  }
}
</script>

<style scoped>
.report-view {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #fff;
}

.report-container {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(40, 44, 52, 0.8);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
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

.sessions-list {
  margin-top: 2rem;
}

.session-item {
  background: rgba(30, 33, 40, 0.6);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.session-date {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.session-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.chart-container {
  background: rgba(30, 33, 40, 0.6);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.recommendations {
  background: rgba(30, 33, 40, 0.6);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.recommendation-item {
  margin: 1rem 0;
  padding-left: 1rem;
  border-left: 3px solid rgba(74, 158, 255, 0.4);
}

button {
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.4);
  color: #fff;
  padding: 0.8rem 2rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

button:hover {
  background: rgba(74, 158, 255, 0.3);
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
}

.sessions-table {
  margin-top: 1rem;
  overflow-x: auto;
  background: rgba(30, 33, 40, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

th {
  background: rgba(0, 0, 0, 0.2);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.first-unit {
  border-top: 2px solid rgba(255, 255, 255, 0.2);
}

.progress-chart {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(30, 33, 40, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.controls {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.controls button {
  padding: 0.5rem 1rem;
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.4);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.controls button:hover {
  background: rgba(74, 158, 255, 0.3);
}

.session-row {
  background: rgba(30, 33, 40, 0.4);
}

.danger-button {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.4);
}

.danger-button:hover {
  background: rgba(244, 67, 54, 0.3);
}

.delete-btn {
  padding: 0.3rem 0.8rem;
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.4);
  font-size: 0.9rem;
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.3);
}
</style>
