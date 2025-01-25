<template>
  <div class="unit-progress">
    <h2>{{ $t('training.unitProgress.title') }}</h2>
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
      <div class="progress-text">
        {{ $t('training.unitProgress.status', { 
          current: currentUnit + 1, 
          total: totalUnits 
        }) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentUnit: number;
  totalUnits: number;
}>();

const progressPercentage = computed(() => {
  return ((props.currentUnit + 1) / props.totalUnits) * 100;
});
</script>

<style scoped>
.unit-progress {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

h2 {
  color: #fff;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
}

.progress-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50 0%, #45a049 100%);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}
</style> 