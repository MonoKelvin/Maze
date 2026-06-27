<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { X, Github, Heart, ExternalLink } from 'lucide-vue-next';

const emit = defineEmits<{ close: [] }>();

const APP_NAME = 'Maze';
const APP_DESC = '一款简单好玩的桌面迷宫游戏，支持多种主题，流畅的交互体验。';
const APP_AUTHOR = 'MonoKelvin';
const APP_LICENSE = 'MIT';
const APP_REPO = 'https://github.com/MonoKelvin/Maze';

const APP_VERSION = ref('加载中...');
const loadingVersion = ref(true);

async function loadVersion() {
  try {
    if ((window as any).electronAPI?.getAppVersion) {
      const version = await (window as any).electronAPI.getAppVersion();
      APP_VERSION.value = version;
    } else {
      // 非 Electron 环境下，从环境变量获取
      APP_VERSION.value = import.meta.env.VITE_APP_VERSION || '1.0.0';
    }
  } catch (e) {
    console.error('加载版本号失败:', e);
    APP_VERSION.value = '1.0.0';
  } finally {
    loadingVersion.value = false;
  }
}

function openGitHub() {
  if ((window as any).electronAPI?.openExternal) {
    (window as any).electronAPI.openExternal(APP_REPO);
  } else {
    // 非 Electron 环境下，直接使用 window.open
    window.open(APP_REPO, '_blank');
  }
}

onMounted(() => loadVersion());
</script>

<template>
  <div class="amo">
    <div class="amo-card" @click.stop>
      <button class="amo-close" @click="emit('close')"><X :size="16" /></button>

      <div class="amo-logo">
        <img src="@/assets/app/logo.png" alt="Maze" class="amo-logo-img" />
      </div>

      <div class="amo-meta">
        <h2 class="amo-name">{{ APP_NAME }}</h2>
        <span class="amo-ver" v-if="!loadingVersion">v{{ APP_VERSION }}</span>
      </div>

      <p class="amo-desc">{{ APP_DESC }}</p>

      <div class="amo-info">
        <div class="amo-row">
          <span class="amo-label">作者</span>
          <span class="amo-value">{{ APP_AUTHOR }}</span>
        </div>
        <div class="amo-row">
          <span class="amo-label">许可</span>
          <span class="amo-value">{{ APP_LICENSE }}</span>
        </div>
        <div class="amo-row">
          <span class="amo-label">仓库</span>
          <button class="amo-link" @click="openGitHub">
            <Github :size="13" /> GitHub
            <ExternalLink :size="10" class="amo-ext" />
          </button>
        </div>
      </div>

      <div class="amo-foot">
        <Heart :size="11" class="amo-heart" />
        <span>Crafted with care</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.amo {
  position:fixed; inset:0; z-index:2000;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,0.30);
  animation:amo-fade 0.2s ease;
}
@keyframes amo-fade { from{opacity:0} to{opacity:1} }

.amo-card {
  position:relative;
  width:380px; max-width:92vw;
  background:color-mix(in srgb, var(--bg) 95%, white 5%);
  backdrop-filter:blur(32px) saturate(1.3);
  -webkit-backdrop-filter:blur(32px) saturate(1.3);
  border-radius:18px;
  padding:36px 32px 28px;
  box-shadow:
    0 24px 80px rgba(0,0,0,0.18),
    0 4px 16px rgba(0,0,0,0.08),
    0 0 0 1px var(--panel-border);
  animation:amo-pop 0.25s cubic-bezier(0.16,1,0.3,1);
  display:flex; flex-direction:column; align-items:center; gap:16px;
}
@keyframes amo-pop {
  from{transform:scale(0.94) translateY(8px);opacity:0}
  to{transform:scale(1) translateY(0);opacity:1}
}

.amo-close {
  position:absolute; top:12px; right:12px;
  width:30px; height:30px;
  display:flex; align-items:center; justify-content:center;
  border-radius:8px; color:var(--text-sec);
  opacity:0.5; transition:all 0.15s ease;
}
.amo-close:hover { opacity:1; background:rgba(128,128,128,0.10); }

.amo-logo {
  width:64px; height:64px; border-radius:16px;
  display:flex; align-items:center; justify-content:center;
  overflow:hidden;
  box-shadow:0 8px 24px rgba(0,0,0,0.15);
}
.amo-logo-img { width:100%; height:100%; object-fit:contain; }

.amo-meta {
  display: flex; align-items: center; width: 100%; justify-content: center;
}
.amo-name {
  font-size: 20px; font-weight: 700; color: var(--text-pri);
  letter-spacing: -0.3px;
}
.amo-ver {
  margin-left: 8px;
  font-size: 12px; font-weight: 500; color: var(--text-sec);
  background: rgba(128,128,128,0.10); padding: 2px 8px; border-radius: 10px;
}

.amo-desc {
  font-size:13px; line-height:1.65; color:var(--text-sec);
  opacity:0.85; text-align:center; max-width:320px;
}

.amo-info {
  width:100%; display:flex; flex-direction:column;
  background:rgba(128,128,128,0.05); border-radius:12px; padding:4px 0;
}
.amo-row {
  display:flex; align-items:center; justify-content:space-between;
  padding:10px 16px;
}
.amo-row + .amo-row { border-top:1px solid rgba(128,128,128,0.08); }
.amo-label { font-size:12px; color:var(--text-sec); opacity:0.8; }
.amo-value { font-size:13px; font-weight:500; color:var(--text-pri); }
.amo-link {
  display:inline-flex; align-items:center; gap:4px;
  font-size:13px; font-weight:500; color:var(--accent);
  text-decoration:none; transition:opacity 0.15s;
}
.amo-link:hover { opacity:0.75; }
.amo-ext { opacity:0.5; }

.amo-foot {
  display:flex; align-items:center; gap:5px;
  font-size:11px; color:var(--text-sec); opacity:0.55;
}
.amo-heart { color:#ef4444; }
</style>
