import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import App from './App.vue';

import './assets/styles/design-tokens.css';
import './assets/styles/global.css';

const app = createApp(App);
app.use(createPinia());
app.use(PrimeVue, {
  // 不引入 PrimeVue 主题 CSS，完全使用自定义样式
  unstyled: true,
});
app.mount('#app');
