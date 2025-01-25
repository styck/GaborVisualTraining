<template>
  <div v-if="error" class="error-boundary">
    <h2>{{ $t('error.title') }}</h2>
    <p>{{ $t('error.message') }}</p>
    <pre>{{ error.message }}</pre>
    <button @click="handleReset">{{ $t('error.retry') }}</button>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';

const error = ref<Error | null>(null);

onErrorCaptured((err: Error) => {
  error.value = err;
  return false;
});

const handleReset = () => {
  error.value = null;
};
</script> 