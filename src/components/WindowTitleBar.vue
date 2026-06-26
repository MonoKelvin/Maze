<script setup lang="ts">
import { ref } from 'vue';
import { CircleHelp, Minus, Square, X } from 'lucide-vue-next';
import AboutModal from './AboutModal.vue';

const electronAPI = (window as any).electronAPI;
const showAbout = ref(false);
</script>

<template>
  <div class="tb">
    <span class="tb-logo">Maze</span>
    <div class="tb-acts">
      <button class="tb-btn about" title="关于" @click="showAbout = true">
        <CircleHelp :size="14" />
      </button>
      <span v-if="electronAPI" class="tb-sep"></span>
      <div v-if="electronAPI" class="tb-wins">
        <button class="tb-btn" title="最小化" @click="electronAPI.minimizeWindow()">
          <Minus :size="13" />
        </button>
        <button class="tb-btn" title="最大化" @click="electronAPI.maximizeWindow()">
          <Square :size="11" />
        </button>
        <button class="tb-btn close" title="关闭" @click="electronAPI.closeWindow()">
          <X :size="14" />
        </button>
      </div>
    </div>
    <AboutModal v-if="showAbout" @close="showAbout = false" />
  </div>
</template>

<style scoped>
.tb {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 14px;
  -webkit-app-region: drag;
  flex-shrink: 0;
  user-select: none;
}

.tb-logo {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-sec);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  opacity: 0.7;
}

.tb-acts {
  display: flex;
  align-items: center;
  gap: 2px;
  -webkit-app-region: no-drag;
}

.tb-btn {
  width: 30px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  color: var(--text-sec);
  transition: all 0.12s ease;
  opacity: 0.65;
}
.tb-btn:hover { background: rgba(128,128,128,0.12); opacity: 1; }
.tb-btn.close:hover { background: #e81123; color: #fff; opacity: 1; }
.tb-btn.about:hover { opacity: 1; color: var(--accent); }

.tb-sep {
  width: 1px;
  height: 14px;
  background: rgba(128,128,128,0.15);
  margin: 0 4px;
}

.tb-wins { display: flex; gap: 2px; }
</style>
