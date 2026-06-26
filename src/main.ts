import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

import './assets/styles/design-tokens.css';
import './assets/styles/components.css';
import './assets/styles/theme.css';
import './assets/styles/global.css';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

import * as LucideIcons from 'lucide-vue-next';

Object.entries(LucideIcons).forEach(([name, component]) => {
    (window as any).$lucideIcons = (window as any).$lucideIcons || {};
    (window as any).$lucideIcons[name] = component;
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
    },
});

app.mount('#app');
