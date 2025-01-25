import { ref } from 'vue';

export function useFullscreen() {
  const isFullscreen = ref(false);
  const isSupported = ref(!!document.documentElement.requestFullscreen);
  const error = ref<Error | null>(null);

  async function enter() {
    if (!isSupported.value) {
      error.value = new Error('Fullscreen not supported');
      return false;
    }

    try {
      await document.documentElement.requestFullscreen();
      isFullscreen.value = true;
      return true;
    } catch (err) {
      error.value = err as Error;
      return false;
    }
  }

  async function exit() {
    if (!document.exitFullscreen) return;
    try {
      await document.exitFullscreen();
      isFullscreen.value = false;
    } catch (err) {
      error.value = err as Error;
    }
  }

  return {
    isFullscreen,
    isSupported,
    error,
    enter,
    exit
  };
} 