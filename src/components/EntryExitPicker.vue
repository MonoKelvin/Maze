<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Target } from 'lucide-vue-next';

interface Props {
  mode: string;
  entryType: string;
  exitType: string;
}

interface Emits {
  (e: 'update:entryType', value: string): void;
  (e: 'update:exitType', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const options = [
  { value: 'boundary', label: '边界位置' },
  { value: 'center', label: '中心位置' },
  { value: 'custom', label: '自定义点击' }
];

const entryType = ref<string>(props.entryType);
const exitType = ref<string>(props.exitType);

const isCustomMode = computed(() => props.mode === 'custom');

const toggleEntryType = (value: string) => {
  entryType.value = value;
  emit('update:entryType', value);
};

const toggleExitType = (value: string) => {
  exitType.value = value;
  emit('update:exitType', value);
};

const showCustomHint = computed(() => {
  return !isCustomMode.value && exitType.value === 'custom';
});
</script>

<template>
  <div class="entry-exit-picker">
    <div class="picker-section">
      <div class="section-title">
        <ArrowLeft :size="16" />
        入口位置
      </div>
      <div class="picker-options">
        <div
          v-for="option in options"
          :key="option.value"
          class="picker-option"
          :class="{ active: entryType === option.value }"
          @click="toggleEntryType(option.value)"
        >
          <span class="option-label">{{ option.label }}</span>
          <span v-if="option.value === 'custom'" class="option-icon">
            <Target :size="14" />
          </span>
        </div>
      </div>
    </div>

    <div class="picker-section">
      <div class="section-title">
        出口位置
        <ArrowRight :size="16" />
      </div>
      <div class="picker-options">
        <div
          v-for="option in options"
          :key="option.value"
          class="picker-option"
          :class="{ active: exitType === option.value }"
          @click="toggleExitType(option.value)"
        >
          <span class="option-label">{{ option.label }}</span>
          <span v-if="option.value === 'custom'" class="option-icon">
            <Target :size="14" />
          </span>
        </div>
      </div>
    </div>

    <div v-if="showCustomHint" class="custom-hint">
      <div class="hint-content">
        <ArrowUp :size="16" />
        <span>在迷宫上点击以选择自定义出入口</span>
        <ArrowDown :size="16" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.entry-exit-picker {
  padding: 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  margin-bottom: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--theme-primary-text, #2D241D);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.picker-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.picker-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.5);
  color: var(--theme-primary-text, #2D241D);
}

.picker-option:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.picker-option.active {
  background: var(--theme-accent-color, #E07B39);
  color: white;
  box-shadow: 0 0 0 3px var(--theme-accent-color, #E07B39);
  border-color: var(--theme-accent-color, #E07B39);
}

.option-label {
  font-size: 12px;
  font-weight: 500;
}

.option-icon {
  opacity: 0.8;
}

.custom-hint {
  margin-top: 12px;
  padding: 12px;
  background: rgba(224, 123, 57, 0.1);
  border-radius: 6px;
  border: 1px dashed var(--theme-accent-color, #E07B39);
}

.hint-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: var(--theme-accent-color, #E07B39);
  font-weight: 500;
}
</style>
