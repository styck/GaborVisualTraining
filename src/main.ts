import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import zhLocale from './locales/zh';

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  messages: {
    zh: zhLocale
  }
});

const app = createApp(App);

const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

app.mount('#app'); 