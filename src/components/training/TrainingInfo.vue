<template>
  <div class="training-info">
    <div class="mode-name">
      {{ $t(`training.modes.${mode}.title`) }}
    </div>
    <template v-if="settings.display.showUnitCounter">
      <div class="unit-info">
        {{ $t('training.unit', { current: unit + 1, total: totalUnits }) }}
      </div>
    </template>
    <template v-if="settings.display.showTrialCounter">
      <div class="trial-info">
        {{ $t('training.trial', { current: trial + 1, total: 50 }) }}
      </div>
    </template>

    <DebugInfo 
      v-if="settings.debug.enabled"
      :metrics="metrics"
      :params="params"
      :show-metrics="settings.debug.showPerformanceMetrics"
      :show-params="settings.debug.showStimulusParams"
    />
  </div>
</template>

<script setup lang="ts">
import { TrainingMode } from '@/types';
import DebugInfo from './DebugInfo.vue';

defineProps<{
  mode: TrainingMode;
  unit: number;
  trial: number;
  totalUnits: number;
  settings: any;
  metrics: {
    correctRate: number;
    stability: number;
    reactionTime: number;
  };
  params: {
    size: number;
    contrast: number;
    spacing?: number;
    shift?: number;
  };
}>();
</script> 