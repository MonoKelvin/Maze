<script setup lang="ts">
import { useSettingsStore } from '@/store/settingsStore';
import type { ThemeName } from '@/types/theme';
import { Check } from 'lucide-vue-next';

const emit = defineEmits<{ change: [t: ThemeName] }>();
const settings = useSettingsStore();

const themes: { name: ThemeName; label: string; color: string }[] = [
  { name: 'dark', label: '深色', color: '#60A5FA' },
  { name: 'warm', label: '暖色', color: '#E07B39' },
  { name: 'ocean', label: '海洋', color: '#0EA5E9' },
  { name: 'forest', label: '森林', color: '#22C55E' },
  { name: 'purple', label: '紫色', color: '#A855F7' }
];

const pick = (name: ThemeName) => {
  settings.setTheme(name);
  emit('change', name);
};
</script>

<template>
  <div class="ts">
    <button
      v-for="t in themes" :key="t.name"
      class="ts-btn"
      :class="{ 'ts--sel': settings.theme === t.name }"
      :title="t.label"
      @click="pick(t.name)"
    >
      <span class="ts-dot" :style="{ background: t.color }"></span>
      <span class="ts-label">{{ t.label }}</span>
      <Check v-if="settings.theme === t.name" :size="12" class="ts-check" />
    </button>
  </div>
</template>

<style scoped>
.ts {
  display:flex; flex-direction:column; gap:3px;
}

.ts-btn {
  display:flex; align-items:center; gap:9px;
  width:100%; padding:8px 10px;
  border-radius:8px;
  text-align:left;
  transition:all 0.15s ease;
  border:1px solid transparent;
}
.ts-btn:hover {
  background:rgba(128,128,128,0.10);
}

.ts--sel {
  background:rgba(128,128,128,0.10);
  border-color:rgba(128,128,128,0.12);
}

.ts-dot {
  width:18px; height:18px;
  border-radius:50%;
  flex-shrink:0;
  box-shadow:0 0 0 3px rgba(128,128,128,0.06);
  transition:transform 0.15s;
}
.ts-btn:hover .ts-dot { transform:scale(1.1); }

.ts-label {
  flex:1;
  font-size:12px; font-weight:500;
  color:var(--text-pri);
}

.ts-check {
  color:var(--accent);
  flex-shrink:0;
}
</style>
