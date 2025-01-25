<template>
  <div class="unit-summary">
    <h2>单元总结</h2>
    
    <div class="progress-info">
      <div class="completed-units">
        已完成单元：{{ currentUnit + 1 }}/{{ totalUnits }}
      </div>
      <div v-if="hasNextUnit" class="next-unit-info">
        下一单元训练类型：{{ $t(`training.modes.${nextUnitMode}.title`) }}
      </div>
    </div>

    <div class="summary-content">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">正确率</div>
          <div class="stat-value">{{ formatPercent(accuracy) }}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">稳定性</div>
          <div class="stat-value">{{ formatPercent(stability) }}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">训练质量</div>
          <div class="stat-value">{{ formatPercent(quality) }}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">平均反应时间</div>
          <div class="stat-value">{{ formatTime(averageReactionTime) }}ms</div>
        </div>
      </div>

      <div class="difficulty-info">
        <h3>难度参数</h3>
        <div class="difficulty-grid">
          <div class="difficulty-item">
            <span>视标大小</span>
            <div class="progress-bar">
              <div class="progress" :style="{ width: `${difficulty.size * 100}%` }"></div>
            </div>
            <span class="value">{{ formatPercent(difficulty.size * 100) }}%</span>
          </div>
          <div class="difficulty-item">
            <span>对比度</span>
            <div class="progress-bar">
              <div class="progress" :style="{ width: `${difficulty.contrast * 100}%` }"></div>
            </div>
            <span class="value">{{ formatPercent(difficulty.contrast * 100) }}%</span>
          </div>
          <div class="difficulty-item" v-if="difficulty.spacing !== undefined">
            <span>间距系数</span>
            <div class="progress-bar">
              <div class="progress" :style="{ width: `${difficulty.spacing * 50}%` }"></div>
            </div>
            <span class="value">{{ formatPercent(difficulty.spacing * 100) }}%</span>
          </div>
          <div class="difficulty-item" v-if="difficulty.shift !== undefined">
            <span>偏移范围</span>
            <div class="progress-bar">
              <div class="progress" :style="{ width: `${(difficulty.shift ?? 0) / 30 * 100}%` }"></div>
            </div>
            <span class="value">{{ difficulty.shift }}px</span>
          </div>
          <div class="difficulty-item" v-if="difficulty.contrastDiff !== undefined">
            <span>对比度差异</span>
            <div class="progress-bar">
              <div class="progress" :style="{ width: `${(difficulty.contrastDiff ?? 0) / 0.3 * 100}%` }"></div>
            </div>
            <span class="value">{{ formatPercent(difficulty.contrastDiff * 100) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <button v-if="hasNextUnit" class="continue-btn" @click="$emit('next-unit')">
        继续训练
      </button>
      <button v-else class="finish-btn" @click="$emit('finish')">
        完成训练
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TrainingMode, TrainingDifficulty } from '@/types';

const props = defineProps<{
  accuracy: number;
  stability: number;
  quality: number;
  averageReactionTime: number;
  hasNextUnit: boolean;
  currentUnit: number;
  totalUnits: number;
  nextUnitMode?: TrainingMode;
  difficulty: TrainingDifficulty;
}>();

const formatPercent = (value: number) => value.toFixed(1);
const formatTime = (value: number) => Math.round(value);
</script>

<style scoped>
.unit-summary {
  background: rgba(30, 33, 40, 0.95);
  border-radius: 12px;
  padding: 2rem;
  color: #fff;
  max-width: 800px;
  margin: 2rem auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-info {
  margin: 1rem 0;
  text-align: center;
  font-size: 1.1rem;
}

.completed-units {
  margin-bottom: 0.5rem;
  color: #4caf50;
}

.next-unit-info {
  color: #2196f3;
}

.summary-content {
  margin: 2rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
}

.difficulty-info {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.difficulty-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.difficulty-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.8rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #4CAF50;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.value {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: right;
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
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

.finish-btn {
  background: rgba(255, 69, 58, 0.2);
  border: 1px solid rgba(255, 69, 58, 0.4);
}

.finish-btn:hover {
  background: rgba(255, 69, 58, 0.3);
}
</style> 