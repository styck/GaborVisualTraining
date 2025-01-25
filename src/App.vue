<template>
  <div class="app">
    <nav v-if="showNav">
      <router-link to="/">{{ $t('nav.home') }}</router-link>
      <router-link to="/settings">{{ $t('nav.settings') }}</router-link>
      <router-link to="/report">{{ $t('nav.report') }}</router-link>
    </nav>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import { storeToRefs } from 'pinia';

const route = useRoute();
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

const showNav = computed(() => route.name !== 'training');
const currentRoute = computed(() => route.path);
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #fff;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app {
  min-height: 100vh;
}

nav {
  padding: 1rem;
  background: #2c3e50;
  display: flex;
  gap: 1rem;
}

nav a {
  color: #fff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

nav a:hover {
  background: rgba(255, 255, 255, 0.1);
}

nav a.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.debug-info {
  position: fixed;
  top: 0;
  right: 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 0.8rem;
  z-index: 9999;
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