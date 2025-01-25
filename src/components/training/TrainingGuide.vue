<template>
  <div v-if="show" class="training-guide">
    <div class="guide-content">
      <h2>{{ $t('guide.title') }}</h2>
      <div class="guide-steps">
        <div v-for="(step, index) in currentSteps" :key="index" class="guide-step">
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">{{ step }}</div>
        </div>
      </div>
      <div class="guide-actions">
        <button @click="skipGuide">{{ $t('guide.skip') }}</button>
        <button @click="startTraining" class="primary">{{ $t('guide.start') }}</button>
      </div>
      <label class="guide-checkbox">
        <input type="checkbox" v-model="dontShowAgain">
        {{ $t('guide.dontShowAgain') }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { TrainingMode } from '@/types';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{
  mode: TrainingMode;
}>();

const emit = defineEmits<{
  (e: 'start'): void;
}>();

const settingsStore = useSettingsStore();
const show = ref(!localStorage.getItem('hideTrainingGuide'));
const dontShowAgain = ref(false);

const currentSteps = computed(() => {
  return [
    `guide.steps.${props.mode}.1`,
    `guide.steps.${props.mode}.2`,
    `guide.steps.${props.mode}.3`,
  ].map(key => $t(key));
});

function skipGuide() {
  if (dontShowAgain.value) {
    localStorage.setItem('hideTrainingGuide', 'true');
  }
  show.value = false;
}

function startTraining() {
  skipGuide();
  emit('start');
}
</script>

<style scoped>
.training-guide {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.guide-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
}

.guide-steps {
  margin: 2rem 0;
}

.guide-step {
  display: flex;
  align-items: flex-start;
  margin: 1rem 0;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #4CAF50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.guide-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.guide-checkbox {
  display: block;
  margin-top: 1rem;
  color: #666;
}
</style> 