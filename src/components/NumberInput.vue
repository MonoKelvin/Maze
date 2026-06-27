<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { Minus, Plus } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
}>(), {
  min: 0,
  max: 100,
  step: 1,
});

const emit = defineEmits<{ 'update:modelValue': [v: number] }>();

const editing = ref(false);
const editVal = ref('');

const displayVal = computed(() => {
  const v = props.modelValue;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
});

function clamp(v: number) {
  return Math.max(props.min, Math.min(props.max, Math.round(v)));
}

function inc() { emit('update:modelValue', clamp(props.modelValue + props.step)); }
function dec() { emit('update:modelValue', clamp(props.modelValue - props.step)); }

function startEdit() {
  editing.value = true;
  editVal.value = String(props.modelValue);
  nextTick(() => {
    const el = document.querySelector('.ni-input') as HTMLInputElement;
    if (el) { el.focus(); el.select(); }
  });
}
function commitEdit() {
  const v = parseFloat(editVal.value);
  if (!isNaN(v)) emit('update:modelValue', clamp(v));
  editing.value = false;
}
function cancelEdit() { editing.value = false; }
function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter') commitEdit();
  else if (e.key === 'Escape') cancelEdit();
}
</script>

<template>
  <div class="ni">
    <button class="ni-btn" @click="dec" :disabled="modelValue <= min">
      <Minus :size="10" />
    </button>
    <span v-if="!editing" class="ni-val" @click="startEdit" title="点击编辑">{{ displayVal }}</span>
    <input v-else class="ni-input" type="number" :min="min" :max="max" :step="step"
      v-model="editVal" @blur="commitEdit" @keydown="onKey" />
    <button class="ni-btn" @click="inc" :disabled="modelValue >= max">
      <Plus :size="10" />
    </button>
  </div>
</template>

<style scoped>
.ni {
  display:inline-flex; align-items:center;
  gap:0; padding:0;
  background:rgba(128,128,128,0.05);
  border:1px solid rgba(128,128,128,0.08);
  border-radius:6px;
  flex-shrink:0;
}

.ni-btn {
  width:16px; height:20px;
  display:flex; align-items:center; justify-content:center;
  border-radius:3px; color:var(--text-sec);
  transition:all 0.1s ease; flex-shrink:0;
}
.ni-btn:hover:not(:disabled) { background:rgba(128,128,128,0.15); color:var(--text-pri); }
.ni-btn:disabled { opacity:0.2; cursor:default; }

.ni-val {
  min-width:20px; text-align:center;
  font-size:10px; font-weight:700;
  color:var(--accent);
  font-family:'JetBrains Mono',monospace;
  cursor:pointer; padding:1px 2px;
  border-radius:3px; transition:all 0.1s;
  user-select:none; line-height:1.5;
}
.ni-val:hover { background:var(--accent-soft); }

.ni-input {
  width:28px; padding:1px 2px;
  font-size:10px; font-weight:700;
  font-family:'JetBrains Mono',monospace;
  color:var(--text-pri);
  background:rgba(128,128,128,0.08);
  border:1px solid var(--accent);
  border-radius:3px; outline:none;
  text-align:center;
  -moz-appearance:textfield;
  line-height:1.5;
}
.ni-input::-webkit-outer-spin-button,
.ni-input::-webkit-inner-spin-button {
  -webkit-appearance:none; margin:0;
}
</style>
