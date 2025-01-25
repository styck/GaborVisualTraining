import { ref, onMounted, onUnmounted } from 'vue';

export function usePerformanceMonitor() {
  const fps = ref(0);
  const frameTime = ref(0);
  let lastTime = performance.now();
  let frames = 0;
  let rafId: number;

  function measure() {
    const now = performance.now();
    frames++;

    if (now >= lastTime + 1000) {
      fps.value = Math.round((frames * 1000) / (now - lastTime));
      frameTime.value = (now - lastTime) / frames;
      frames = 0;
      lastTime = now;
    }

    rafId = requestAnimationFrame(measure);
  }

  onMounted(() => {
    rafId = requestAnimationFrame(measure);
  });

  onUnmounted(() => {
    cancelAnimationFrame(rafId);
  });

  return {
    fps,
    frameTime
  };
} 