<template>
  <Transition name="fade">
    <div v-if="show" class="training-feedback" :class="type">
      <div class="feedback-content">
        <div class="feedback-icon">
          <IconCheck v-if="type === 'success'" />
          <IconX v-else-if="type === 'error'" />
          <IconInfo v-else />
        </div>
        <div class="feedback-message">{{ message }}</div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import IconCheck from '@/components/icons/IconCheck.vue';
import IconX from '@/components/icons/IconX.vue';
import IconInfo from '@/components/icons/IconInfo.vue';

const props = defineProps<{
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}>();

const show = ref(false);
let timer: number | null = null;

watch(() => props.message, () => {
  show.value = true;
  if (timer) clearTimeout(timer);
  if (props.duration) {
    timer = window.setTimeout(() => {
      show.value = false;
    }, props.duration);
  }
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<style scoped>
.training-feedback {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  border-radius: 8px;
  color: white;
  z-index: 1000;
}

.feedback-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.success {
  background: #4CAF50;
}

.error {
  background: #F44336;
}

.info {
  background: #2196F3;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 