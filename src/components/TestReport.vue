<template>
  <div class="test-report">
    <h2>{{ $t('report.testModeTitle') }}</h2>
    <div class="report-content">
      <div class="metric">
        <div class="metric-label">{{ $t('report.accuracy') }}</div>
        <div class="metric-value">{{ formatPercent(report.accuracy) }}%</div>
      </div>
      <div class="metric">
        <div class="metric-label">{{ $t('report.stability') }}</div>
        <div class="metric-value">{{ formatPercent(report.stability) }}%</div>
      </div>
      <div class="metric">
        <div class="metric-label">{{ $t('report.quality') }}</div>
        <div class="metric-value">{{ formatPercent(report.quality) }}%</div>
      </div>
      <div class="metric">
        <div class="metric-label">{{ $t('report.averageReactionTime') }}</div>
        <div class="metric-value">{{ formatTime(report.averageReactionTime) }}ms</div>
      </div>
    </div>
    <div class="actions">
      <button class="retry-button" @click="retryTest">
        {{ $t('report.retryTest') }}
      </button>
      <button class="home-button" @click="goHome">
        {{ $t('common.backToHome') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TestReport } from '@/types';
import { useRouter } from 'vue-router';
import { useTrainingStore } from '@/stores/training';

const props = defineProps<{
  report: TestReport;
}>();

const router = useRouter();
const trainingStore = useTrainingStore();

const formatPercent = (value: number) => Math.round(value * 100);
const formatTime = (value: number) => Math.round(value);

const retryTest = () => {
  trainingStore.initializeTestSession(props.report.mode);
  router.push('/training');
};

const goHome = () => {
  router.push('/');
};

const calculateTestResults = (): TestReport => {
  // 确保至少有一次有效的训练数据
  if (correctAnswers.value.length === 0) {
    return {
      accuracy: 0,
      stability: 0,
      quality: 0,
      averageReactionTime: 0,
      mode: currentMode.value
    };
  }

  const accuracy = correctAnswers.value.filter(x => x).length / correctAnswers.value.length;
  const stability = calculateStability();
  const avgReactionTime = reactionTimes.value.reduce((a, b) => a + b, 0) / reactionTimes.value.length;
  
  // 计算训练质量时考虑边界情况
  const normalizedReactionTime = Math.min(1, 2000 / Math.max(avgReactionTime, 100));
  const quality = correctAnswers.value.length >= 2
    ? (accuracy * 0.5 + stability * 0.3 + normalizedReactionTime * 0.2)
    : accuracy * 0.8 + normalizedReactionTime * 0.2;

  return {
    accuracy,
    stability,
    quality,
    averageReactionTime: avgReactionTime,
    mode: currentMode.value
  };
};
</script>

<style scoped>
.test-report {
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.report-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin: 2rem 0;
}

.metric {
  text-align: center;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.metric-label {
  color: #666;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4caf50;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

button {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.2s;
}

.retry-button {
  background-color: #4caf50;
  color: white;
}

.home-button {
  background-color: #f0f0f0;
  color: #333;
}

button:hover {
  transform: translateY(-2px);
}
</style> 