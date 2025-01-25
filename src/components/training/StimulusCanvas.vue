<template>
  <canvas 
    ref="canvas" 
    :width="width" 
    :height="height"
    @contextmenu.prevent
  ></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { GaborPatch } from '@/utils/gaborPatch';

const props = defineProps<{
  width: number;
  height: number;
  stimulusParams?: {
    size: number;
    contrast: number;
    position: { x: number; y: number };
  };
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
let gabor: GaborPatch | null = null;

// 使用 requestAnimationFrame 优化渲染
let animationFrame: number | null = null;

const draw = () => {
  if (!canvas.value || !props.stimulusParams) return;
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  
  animationFrame = requestAnimationFrame(() => {
    const ctx = canvas.value?.getContext('2d');
    if (!ctx) return;
    
    // 绘制逻辑...
  });
};

// 只在必要时重新渲染
watch(() => props.stimulusParams, draw, { deep: true });

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
});
</script> 