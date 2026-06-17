<template>
  <header class="app-header">
    <div class="left">
      <router-link to="/" class="home-link">{{ $t('common.gaborTraining') }}</router-link>
    </div>

    <div class="right">
      <router-link to="/select-mode" class="mode-link">{{ $t('common.trainingMode') }}</router-link>
      <router-link to="/settings" class="settings-link">{{ $t('nav.settings') }}</router-link>
      <router-link to="/report" class="report-link">{{ $t('nav.report') }}</router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #1a1a1a;
  color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.left, .right {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.home-link, .settings-link, .report-link, .mode-link {
  color: #fff;
  text-decoration: none;
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.home-link:hover, .settings-link:hover, .report-link:hover, .mode-link:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
