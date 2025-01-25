<template>
  <div class="settings-view">
    <div class="settings-container">
      <h1>{{ $t('settings.title') }}</h1>

      <!-- 显示设置 -->
      <section class="settings-section">
        <h2>
          {{ $t('settings.display.title') }}
          <button class="reset-button" @click="handleResetSection('display')">
            {{ $t('settings.resetSection') }}
          </button>
        </h2>
        <div class="settings-group">
          <label class="setting-item">
            <input
              type="checkbox"
              v-model="settings.display.showUnitCounter"
              @change="saveSettings"
            >
            {{ $t('settings.display.showUnitCounter') }}
          </label>
          <label class="setting-item">
            <input
              type="checkbox"
              v-model="settings.display.showTrialCounter"
              @change="saveSettings"
            >
            {{ $t('settings.display.showTrialCounter') }}
          </label>
          <label class="setting-item">
            <input
              type="checkbox"
              v-model="settings.display.showPerformanceMetrics"
              @change="saveSettings"
            >
            {{ $t('settings.display.showPerformanceMetrics') }}
          </label>
        </div>
      </section>

      <!-- 反馈设置 -->
      <section class="settings-section">
        <h2>
          {{ $t('settings.feedback.title') }}
          <button class="reset-button" @click="handleResetSection('feedback')">
            {{ $t('settings.resetSection') }}
          </button>
        </h2>
        <div class="settings-group">
          <h3>{{ $t('settings.feedback.visual.title') }}</h3>
          <label class="setting-item">
            <input
              type="checkbox"
              v-model="settings.feedback.visual.enabled"
              @change="saveSettings"
            >
            {{ $t('settings.feedback.visual.enabled') }}
          </label>
          <div class="color-settings" :class="{ disabled: !settings.feedback.visual.enabled }">
            <div class="color-setting">
              <label>{{ $t('settings.feedback.visual.correctColor') }}</label>
              <input
                type="color"
                v-model="settings.feedback.visual.correctColor"
                :disabled="!settings.feedback.visual.enabled"
                @change="saveSettings"
              >
            </div>
            <div class="color-setting">
              <label>{{ $t('settings.feedback.visual.incorrectColor') }}</label>
              <input
                type="color"
                v-model="settings.feedback.visual.incorrectColor"
                :disabled="!settings.feedback.visual.enabled"
                @change="saveSettings"
              >
            </div>
          </div>
        </div>

        <div class="settings-group">
          <h3>{{ $t('settings.feedback.audio.title') }}</h3>
          <label class="setting-item">
            <input
              type="checkbox"
              v-model="settings.feedback.audio.enabled"
              @change="saveSettings"
            >
            {{ $t('settings.feedback.audio.enabled') }}
          </label>
          <label class="setting-item" :class="{ disabled: !settings.feedback.audio.enabled }">
            <input
              type="checkbox"
              v-model="settings.feedback.audio.correctSound"
              :disabled="!settings.feedback.audio.enabled"
              @change="saveSettings"
            >
            {{ $t('settings.feedback.audio.correctSound') }}
          </label>
          <label class="setting-item" :class="{ disabled: !settings.feedback.audio.enabled }">
            <input
              type="checkbox"
              v-model="settings.feedback.audio.incorrectSound"
              :disabled="!settings.feedback.audio.enabled"
              @change="saveSettings"
            >
            {{ $t('settings.feedback.audio.incorrectSound') }}
          </label>
        </div>
      </section>

      <!-- 训练设置部分 -->
      <section class="settings-section">
        <h2>
          {{ $t('settings.training.title') }}
          <button class="reset-button" @click="handleResetSection('training')">
            {{ $t('settings.resetSection') }}
          </button>
        </h2>
        
        <!-- 训练设置 -->
        <div class="settings-group">
          <div class="setting-item">
            <label>{{ $t('settings.training.unitsCount') }}</label>
            <input 
              type="number" 
              v-model.number="settings.training.unitsCount"
              min="1"
              max="20"
              @change="saveSettings"
            >
          </div>
          <div class="setting-item">
            <label>{{ $t('settings.training.trialsPerUnit') }}</label>
            <input 
              type="number" 
              v-model.number="settings.training.trialsPerUnit"
              min="10"
              max="100"
              step="10"
              @change="saveSettings"
            >
          </div>
          <div class="setting-item">
            <label>{{ $t('settings.training.flashRate') }}</label>
            <input 
              type="number" 
              v-model.number="settings.training.flashRate"
              min="500"
              max="2000"
              step="100"
              @change="saveSettings"
            >
          </div>

          <h3>{{ $t('settings.training.modeProbabilities.title') }}</h3>
          <div class="probability-settings">
            <div class="setting-item">
              <label>{{ $t('settings.training.modeProbabilities.singleImage') }}</label>
              <input 
                type="number" 
                v-model.number="settings.training.modeProbabilities.single_image"
                min="0"
                max="1"
                step="0.05"
                @change="handleProbabilityChange"
              >
            </div>
            <div class="setting-item">
              <label>{{ $t('settings.training.modeProbabilities.threeImage') }}</label>
              <input 
                type="number" 
                v-model.number="settings.training.modeProbabilities.three_image"
                min="0"
                max="1"
                step="0.05"
                @change="handleProbabilityChange"
              >
            </div>
            <div class="setting-item">
              <label>{{ $t('settings.training.modeProbabilities.clearImage') }}</label>
              <input 
                type="number" 
                v-model.number="settings.training.modeProbabilities.clear_image"
                min="0"
                max="1"
                step="0.05"
                @change="handleProbabilityChange"
              >
            </div>
            <div class="setting-item">
              <label>{{ $t('settings.training.modeProbabilities.shiftImage') }}</label>
              <input 
                type="number" 
                v-model.number="settings.training.modeProbabilities.shift_image"
                min="0"
                max="1"
                step="0.05"
                @change="handleProbabilityChange"
              >
            </div>
            <div class="setting-item">
              <label>{{ $t('settings.training.modeProbabilities.crowding') }}</label>
              <input 
                type="number" 
                v-model.number="settings.training.modeProbabilities.crowding"
                min="0"
                max="1"
                step="0.05"
                @change="handleProbabilityChange"
              >
            </div>
            <div class="probability-total">
              {{ $t('settings.training.modeProbabilities.total') }}: {{ totalProbability }}
            </div>
          </div>
        </div>
      </section>

      <div class="settings-actions">
        <button class="reset-all-button" @click="handleResetAll">
          {{ $t('settings.resetAll') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import type { Settings } from '@/types/settings';
import { computed } from 'vue';

const { t } = useI18n();
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

const totalProbability = computed(() => {
  const probs = settings.value.training.modeProbabilities;
  const total = probs.single_image + 
                probs.three_image + 
                probs.clear_image + 
                probs.shift_image + 
                probs.crowding;
  return total.toFixed(2);
});

function handleProbabilityChange() {
  // 确保所有概率都在0到1之间
  const probs = settings.value.training.modeProbabilities;
  for (const key in probs) {
    if (probs[key as keyof typeof probs] < 0) {
      probs[key as keyof typeof probs] = 0;
    } else if (probs[key as keyof typeof probs] > 1) {
      probs[key as keyof typeof probs] = 1;
    }
  }
  saveSettings();
}

function handleResetSection(section: keyof Settings) {
  if (confirm(t('settings.confirmResetSection'))) {
    settingsStore.resetSection(section);
  }
}

function handleResetAll() {
  if (confirm(t('settings.confirmResetAll'))) {
    settingsStore.resetAll();
  }
}

function saveSettings() {
  settingsStore.saveSettings();
}
</script>

<style scoped>
.settings-view {
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #fff;
}

.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(40, 44, 52, 0.8);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.settings-section {
  background: rgba(30, 33, 40, 0.6);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-section:last-child {
  border-bottom: none;
}

h1, h2, h3 {
  color: #fff;
  margin-bottom: 1.5rem;
}

.settings-group {
  margin-left: 1rem;
  width: 100%;
  max-width: 800px;
}

.settings-item {
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #fff;
}

.setting-item {
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
  cursor: pointer;
}

.setting-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.color-settings {
  margin: 1rem 0;
}

.color-setting {
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
}

.color-setting label {
  margin-right: 1rem;
  min-width: 120px;
}

.color-setting input[type="color"] {
  padding: 0;
  width: 50px;
  height: 30px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background: rgba(74, 158, 255, 0.2);
  border: 1px solid rgba(74, 158, 255, 0.4);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  background: rgba(74, 158, 255, 0.3);
}

button:active {
  background: rgba(74, 158, 255, 0.4);
}

input[type="number"],
input[type="text"] {
  background: rgba(20, 22, 27, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.5rem;
  border-radius: 4px;
  width: 120px;
}

input[type="checkbox"] {
  accent-color: #4a9eff;
  width: 18px;
  height: 18px;
}

.reset-button {
  background: rgba(255, 69, 58, 0.2);
  border: 1px solid rgba(255, 69, 58, 0.4);
}

.reset-button:hover {
  background: rgba(255, 69, 58, 0.3);
}

.reset-all-button {
  background: rgba(255, 69, 58, 0.2);
  border: 1px solid rgba(255, 69, 58, 0.4);
  padding: 0.8rem 2rem;
  font-size: 1rem;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-all-button:hover {
  background: rgba(255, 69, 58, 0.3);
}

.settings-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.setting-item input[type="number"] {
  width: 80px;
  padding: 0.3rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.probability-settings {
  margin-top: 1rem;
}

.probability-settings .setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
}

.probability-settings input {
  width: 80px;
  padding: 0.3rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.probability-total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-weight: bold;
  text-align: right;
}

.setting-item label {
  flex: 1;
  margin-right: 1rem;
}

.setting-item input[type="number"] {
  width: 80px;
  padding: 0.3rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style> 