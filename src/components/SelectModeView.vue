<template>
  <div class="select-mode-view">
    <h1>{{ $t('selectMode.title') }}</h1>
    <div class="modes-grid">
      <div v-for="(mode, key) in modes" :key="key" class="mode-card" @click="selectMode(key)">
        <div class="mode-icon">
          <i :class="mode.icon"></i>
        </div>
        <h3>{{ $t(`selectMode.modes.${key}.title`) }}</h3>
        <p>{{ $t(`selectMode.modes.${key}.description`) }}</p>
      </div>
    </div>
    <button class="back-button" @click="goBack">
      {{ $t('common.back') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useTrainingStore } from '@/stores/training';

const router = useRouter();
const trainingStore = useTrainingStore();

const modes = {
  single: {
    icon: 'fas fa-eye',
  },
  triple: {
    icon: 'fas fa-images',
  },
  clarity: {
    icon: 'fas fa-adjust',
  },
  movement: {
    icon: 'fas fa-arrows-alt',
  },
  crowding: {
    icon: 'fas fa-object-group',
  }
};

const selectMode = (mode: string) => {
  trainingStore.setTrainingMode(mode, true);
  router.push('/training');
};

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.select-mode-view {
  padding: 2rem;
  width: 100%;
  min-height: 100vh;
  background: #1a1a1a;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: var(--header-height);
  left: 0;
  right: 0;
  bottom: 0;
}

h1 {
  text-align: center;
  color: #fff;
  margin-bottom: 3rem;
  font-size: 2.5rem;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  flex: 1;
}

.mode-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 200px;
  backdrop-filter: blur(10px);
}

.mode-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.15);
}

.mode-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #4caf50;
}

h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #fff;
}

p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-top: auto;
}

.back-button {
  display: block;
  margin: 2rem auto 0;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 480px) {
  h1 {
    font-size: 2rem;
  }
  
  .mode-card {
    padding: 1.5rem;
  }
}
</style> 