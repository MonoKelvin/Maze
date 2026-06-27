<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePlayerStore, PLAYER_SHAPES, PLAYER_ICONS } from '@/store/playerStore';
import type { PlayerShape } from '@/store/playerStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Upload, X, Circle, Square, Diamond, Star, Heart } from 'lucide-vue-next';
import NumberInput from './NumberInput.vue';

const player = usePlayerStore();
const settings = useSettingsStore();
const fileInput = ref<HTMLInputElement>();

const shapeIcons: Record<PlayerShape, any> = {
  circle: Circle, square: Square, diamond: Diamond, star: Star, heart: Heart,
};

function pickShape(s: PlayerShape) { player.setShape(s); }
function pickIcon(e: string) { player.setIcon(e); }

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  compressImage(file, 128).then(dataUrl => { player.setImage(dataUrl); });
  if (fileInput.value) fileInput.value.value = '';
}

function compressImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          const ratio = Math.min(maxSize / w, maxSize / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const sizePct = computed({
  get: () => Math.round(player.size * 100),
  set: (v: number) => player.setSize(v / 100),
});
</script>

<template>
  <div class="ps">

    <!-- 速度 -->
    <div class="ps-row">
      <span class="ps-lbl">速度</span>
      <div class="ps-speed-row">
        <input type="range" min="1" max="10" step="1"
          :value="settings.speed"
          @input="settings.setSpeed(parseInt(($event.target as HTMLInputElement).value))" />
        <NumberInput :modelValue="settings.speed" :min="1" :max="10" @update:modelValue="settings.setSpeed" />
      </div>
    </div>

    <!-- 形状 -->
    <div class="ps-row">
      <span class="ps-lbl">形状</span>
      <div class="ps-shapes">
        <button
          v-for="s in PLAYER_SHAPES" :key="s.key"
          class="ps-shape"
          :class="{ 'ps--sel': player.shape === s.key }"
          :title="s.label"
          @click="pickShape(s.key)"
        >
          <component :is="shapeIcons[s.key]" :size="13" />
        </button>
      </div>
    </div>

    <!-- 图标 -->
    <div class="ps-row">
      <span class="ps-lbl">图标</span>
      <div class="ps-icons">
        <button
          v-for="ic in PLAYER_ICONS" :key="ic"
          class="ps-icon"
          :class="{ 'ps--sel': player.icon === ic }"
          @click="pickIcon(ic)"
        >{{ ic }}</button>
        <button v-if="player.icon" class="ps-icon ps-icon--clear" @click="player.setIcon('')" title="清除">
          <X :size="11" />
        </button>
      </div>
    </div>

    <!-- 图片 -->
    <div class="ps-row">
      <span class="ps-lbl">图片</span>
      <div class="ps-img-row">
        <div v-if="player.image" class="ps-img-preview">
          <img :src="player.image" alt="" />
          <button class="ps-img-remove" @click="player.clearImage()"><X :size="9" /></button>
        </div>
        <button class="ps-upload" @click="fileInput?.click()">
          <Upload :size="11" /> {{ player.image ? '更换' : '上传' }}
        </button>
        <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
      </div>
    </div>

    <!-- 大小 -->
    <div class="ps-row">
      <span class="ps-lbl">大小</span>
      <div class="ps-size-row">
        <input type="range" min="20" max="100" step="5"
          :value="sizePct"
          @input="sizePct = parseInt(($event.target as HTMLInputElement).value)" />
        <span class="ps-size-val">{{ sizePct }}%</span>
      </div>
    </div>

  </div>
</template>

<style scoped>
.ps { display:flex; flex-direction:column; gap:7px; }

.ps-row { display:flex; align-items:center; gap:6px; }

.ps-lbl {
  width:24px; font-size:10px; font-weight:600;
  color:var(--text-sec); opacity:0.75; flex-shrink:0;
  display:flex; align-items:center;
}

/* 速度 */
.ps-speed-row { display:flex; align-items:center; gap:4px; flex:1; min-width:0; }
.ps-speed-row input[type="range"] {
  flex:1; height:4px; min-width:0;
  -webkit-appearance:none; appearance:none;
  background:rgba(128,128,128,0.15); border-radius:4px; outline:none; margin:0;
}
.ps-speed-row input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance:none; appearance:none;
  width:12px; height:12px; border-radius:50%;
  background:var(--accent); cursor:pointer;
  box-shadow:0 1px 4px var(--accent-soft);
}

/* 形状 */
.ps-shapes { display:flex; gap:3px; }
.ps-shape {
  width:28px; height:28px;
  display:flex; align-items:center; justify-content:center;
  border-radius:6px; color:var(--text-sec);
  transition:all 0.12s ease; border:1px solid transparent;
}
.ps-shape:hover { background:rgba(128,128,128,0.10); color:var(--text-pri); }
.ps--sel { background:var(--accent-soft); color:var(--accent); border-color:rgba(128,128,128,0.10); }

/* 图标 */
.ps-icons { display:flex; flex-wrap:wrap; gap:3px; }
.ps-icon {
  width:26px; height:26px;
  display:flex; align-items:center; justify-content:center;
  border-radius:6px; font-size:13px;
  transition:all 0.12s ease; border:1px solid transparent;
}
.ps-icon:hover { background:rgba(128,128,128,0.10); transform:scale(1.08); }
.ps--sel { background:var(--accent-soft); border-color:rgba(128,128,128,0.10); }
.ps-icon--clear { color:var(--text-sec); font-size:0; }
.ps-icon--clear:hover { color:#ef4444; background:rgba(239,68,68,0.08); }

/* 图片 */
.ps-img-row { display:flex; align-items:center; gap:5px; }
.ps-img-preview {
  position:relative; width:28px; height:28px;
  border-radius:6px; overflow:hidden;
  border:1px solid rgba(128,128,128,0.10);
}
.ps-img-preview img { width:100%; height:100%; object-fit:cover; }
.ps-img-remove {
  position:absolute; top:-2px; right:-2px;
  width:13px; height:13px;
  display:flex; align-items:center; justify-content:center;
  border-radius:50%; background:#ef4444; color:#fff;
  opacity:0; transition:opacity 0.12s;
}
.ps-img-preview:hover .ps-img-remove { opacity:1; }

.ps-upload {
  display:inline-flex; align-items:center; gap:4px;
  padding:4px 10px; border-radius:6px; font-size:10px; font-weight:500;
  color:var(--text-sec); background:rgba(128,128,128,0.05);
  border:1px solid rgba(128,128,128,0.08); transition:all 0.12s;
}
.ps-upload:hover { background:rgba(128,128,128,0.10); color:var(--text-pri); }

/* 大小 */
.ps-size-row { display:flex; align-items:center; gap:4px; flex:1; min-width:0; }
.ps-size-row input[type="range"] {
  flex:1; height:4px; min-width:0;
  -webkit-appearance:none; appearance:none;
  background:rgba(128,128,128,0.15); border-radius:4px; outline:none; margin:0;
}
.ps-size-row input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance:none; appearance:none;
  width:12px; height:12px; border-radius:50%;
  background:var(--accent); cursor:pointer;
  box-shadow:0 1px 4px var(--accent-soft);
}
.ps-size-val {
  width:28px; text-align:right;
  font-size:10px; font-weight:700; color:var(--accent);
  font-family:'JetBrains Mono',monospace; flex-shrink:0;
}
</style>
