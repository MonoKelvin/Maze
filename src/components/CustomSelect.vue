<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Option {
  value: string;
  label: string;
}

const props = defineProps<{
  modelValue: string;
  options: Option[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const isOpen = ref(false);
const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue) || props.options[0];
});

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.custom-select-wrapper')) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="custom-select-wrapper">
    <button
      class="custom-select-trigger"
      @click.stop="isOpen = !isOpen"
    >
      <span class="select-label">{{ selectedOption?.label }}</span>
      <span class="select-arrow" :class="{ open: isOpen }">▾</span>
    </button>
    
    <div v-if="isOpen" class="custom-select-dropdown">
      <button
        v-for="option in options"
        :key="option.value"
        class="dropdown-option"
        :class="{ active: option.value === modelValue }"
        @click.stop="selectOption(option)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.custom-select-wrapper {
  position: relative;
  width: 100%;
}

.custom-select-trigger {
  width: 100%;
  height: 32px;
  padding: 0 var(--space-3);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--theme-primary-text);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.custom-select-trigger:hover {
  border-color: var(--theme-accent-color);
  background: rgba(255, 255, 255, 0.8);
}

.custom-select-trigger:focus {
  outline: none;
  border-color: var(--theme-accent-color);
  box-shadow: 0 0 0 2px var(--theme-accent-light);
}

.select-label {
  flex: 1;
  text-align: left;
}

.select-arrow {
  font-size: 10px;
  color: var(--theme-secondary-text);
  transition: transform var(--transition-fast);
}

.select-arrow.open {
  transform: rotate(180deg);
}

.custom-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(var(--blur-lg));
  -webkit-backdrop-filter: blur(var(--blur-lg));
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
  animation: dropdownFadeIn var(--transition-fast);
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-option {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  font-size: var(--font-size-sm);
  color: var(--theme-primary-text);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.dropdown-option:hover {
  background: rgba(0, 0, 0, 0.04);
}

.dropdown-option.active {
  background: var(--theme-accent-light);
  color: var(--theme-accent-color);
}
</style>
