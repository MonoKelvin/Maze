<script setup lang="ts">
const electronAPI = (window as any).electronAPI;
</script>

<template>
  <div class="titlebar">
    <span class="logo">Maze</span>
    <div v-if="electronAPI" class="btns">
      <button class="btn" @click="electronAPI.minimizeWindow()">─</button>
      <button class="btn" @click="electronAPI.maximizeWindow()">□</button>
      <button class="btn close" @click="electronAPI.closeWindow()">✕</button>
    </div>
  </div>
</template>

<style scoped>
.titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 12px;
  -webkit-app-region: drag;
  flex-shrink: 0;
}
.logo { font-size: 12px; font-weight: 600; color: var(--text-sec); letter-spacing: 1px; }
.btns { display: flex; gap: 4px; -webkit-app-region: no-drag; }
.btn {
  width: 28px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  border: none; background: transparent;
  font-size: 12px; color: var(--text-sec);
  border-radius: 4px; transition: all 0.12s;
}
.btn:hover { background: rgba(0,0,0,0.06); }
.btn.close:hover { background: #e81123; color: #fff; }
</style>
