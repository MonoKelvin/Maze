<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useMazeStore } from '@/store/mazeStore';
import { usePlayerStore } from '@/store/playerStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useStatsStore } from '@/store/statsStore';
import { MazeRenderer } from '@/utils/mazeRenderer';
import { CollisionDetector } from '@/utils/collisionDetector';
import { solveMaze } from '@/utils/mazeSolver';
import { Direction } from '@/types/maze';
import type { SimpleMaze } from '@/types/maze';
import { generateSync, generateAsync } from '@/utils/mazeGenerator';
import type { GenToken } from '@/utils/mazeGenerator';

import WindowTitleBar from '@/components/WindowTitleBar.vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import VictoryModal from '@/components/VictoryModal.vue';

import {
  RotateCcw, RefreshCw, Square, Eye, EyeOff,
  Grid3X3, Hash, Timer, Footprints,
  PanelRightClose, Palette
} from 'lucide-vue-next';

const mazeStore = useMazeStore();
const playerStore = usePlayerStore();
const settings = useSettingsStore();
const stats = useStatsStore();

const canvas = ref<HTMLCanvasElement>();
const maze = ref<SimpleMaze | null>(null);
const showVictory = ref(false);
const loading = ref(false);
const loadPct = ref(0);
const genToken = ref<GenToken>({ aborted: false });
const showPath = ref(false);
const solutionPath = ref<{ row: number; col: number }[]>([]);

// 玩家像素位置
const playerPx = ref(0);
const playerPy = ref(0);
const playerRow = ref(0);
const playerCol = ref(0);

// 缩放 & 平移
const zoom = ref(1);
const panX = ref(0);
const panY = ref(0);
const dragging = ref(false);
const dragStart = { x: 0, y: 0 };
const panStart = { x: 0, y: 0 };

// 连续移动
const heldDir = ref<Direction | null>(null);
const moveBusy = ref(false);

// 尺寸编辑
const editingDim = ref<'rows' | 'cols' | null>(null);
const editVal = ref('');

const theme = computed(() => settings.themes[settings.theme]);

// 面板折叠
const panelOpen = ref(true);

// ---- 绘制 ----
function draw() {
  const c = canvas.value, m = maze.value;
  if (!c || !m) return;
  const ctx = c.getContext('2d');
  if (!ctx) return;
  const t = theme.value;
  if (!t) return;

  ctx.fillStyle = t.background;
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.save();
  ctx.translate(c.width / 2 + panX.value, c.height / 2 + panY.value);
  ctx.scale(zoom.value, zoom.value);
  ctx.translate(-c.width / 2, -c.height / 2);

  const sz = MazeRenderer.fitSize(m.rows, m.cols, c.width, c.height);
  MazeRenderer.renderWalls(ctx, m.walls, m.rows, m.cols, sz.cs, sz.ox, sz.oy, t);
  if (showPath.value && solutionPath.value.length) {
    MazeRenderer.renderPath(ctx, solutionPath.value, sz.cs, sz.ox, sz.oy, t.accent);
  }
  MazeRenderer.renderPoints(ctx, sz.cs, sz.ox, sz.oy, m.entry, m.exit,
    { row: playerRow.value, col: playerCol.value }, t, playerPx.value, playerPy.value);
  ctx.restore();
}

// 主题切换 → 重绘迷宫
watch(() => settings.theme, () => { draw(); });

function getCellSize() {
  const m = maze.value; if (!m) return 40;
  const c = canvas.value; if (!c) return 40;
  return MazeRenderer.fitSize(m.rows, m.cols, c.width, c.height).cs;
}

function fitCanvas() {
  const c = canvas.value;
  if (!c) return;
  const p = c.parentElement;
  if (!p) return;
  c.width = p.clientWidth;
  c.height = p.clientHeight;
  draw();
}

// ---- 缩放（鼠标居中 —— 修正公式）----
function onWheel(e: WheelEvent) {
  if (!maze.value || loading.value) return;
  e.preventDefault();
  const c = canvas.value!;
  const rect = c.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const cx = c.width / 2;
  const cy = c.height / 2;
  const old = zoom.value;
  const nz = Math.max(0.1, Math.min(10, +(old + (e.deltaY > 0 ? -0.12 : 0.12)).toFixed(2)));
  const ratio = nz / old;
  panX.value = (mx - cx) * (1 - ratio) + ratio * panX.value;
  panY.value = (my - cy) * (1 - ratio) + ratio * panY.value;
  zoom.value = nz;
  draw();
}

// ---- 拖拽 ----
function onMD(e: MouseEvent) {
  if (!maze.value || loading.value) return;
  const c = canvas.value; if (!c) return;
  const m = maze.value;
  const sz = MazeRenderer.fitSize(m.rows, m.cols, c.width, c.height);
  const mw = m.cols * sz.cs * zoom.value;
  const mh = m.rows * sz.cs * zoom.value;
  if (mw <= c.width * 0.95 && mh <= c.height * 0.95 && Math.abs(panX.value) < 5 && Math.abs(panY.value) < 5) return;
  dragging.value = true;
  dragStart.x = e.clientX; dragStart.y = e.clientY;
  panStart.x = panX.value; panStart.y = panY.value;
}
function onMM(e: MouseEvent) {
  if (!dragging.value) return;
  panX.value = panStart.x + (e.clientX - dragStart.x);
  panY.value = panStart.y + (e.clientY - dragStart.y);
  draw();
}
function onMU() { dragging.value = false; }

// ---- 玩家动画 ----
const ANIM_DURATION = 80;
function movePlayer(dir: Direction) {
  const m = maze.value; if (!m) return;
  const r = playerRow.value, c = playerCol.value;
  if (!CollisionDetector.canMove(m.walls, r, c, m.cols, dir)) return;
  const t = CollisionDetector.target(r, c, dir);
  if (!CollisionDetector.inBounds(t.row, t.col, m.rows, m.cols)) return;

  const cs = getCellSize();
  const fromX = playerPx.value;
  const fromY = playerPy.value;
  const toX = t.col * cs + cs / 2;
  const toY = t.row * cs + cs / 2;
  const start = performance.now();

  moveBusy.value = true;

  function anim(now: number) {
    const pct = Math.min(1, (now - start) / ANIM_DURATION);
    const e = 1 - Math.pow(1 - pct, 2);
    playerPx.value = fromX + (toX - fromX) * e;
    playerPy.value = fromY + (toY - fromY) * e;
    if (pct < 1) {
      requestAnimationFrame(anim);
    } else {
      playerPx.value = toX;
      playerPy.value = toY;
      playerRow.value = t.row;
      playerCol.value = t.col;
      playerStore.move(dir, t.row, t.col);
      moveBusy.value = false;

      const _m = maze.value;
      if (_m && t.row === _m.exit.row && t.col === _m.exit.col) {
        stats.stop(); showVictory.value = true;
        heldDir.value = null;
        return;
      }
      if (heldDir.value) movePlayer(heldDir.value);
    }
    draw();
  }
  requestAnimationFrame(anim);
}

// ---- 键盘 ----
const pressed = new Set<string>();

function onKD(e: KeyboardEvent) {
  if (pressed.has(e.code)) return;
  pressed.add(e.code);
  let dir: Direction | null = null;
  switch (e.code) {
    case 'ArrowUp': case 'KeyW': dir = Direction.UP; break;
    case 'ArrowDown': case 'KeyS': dir = Direction.DOWN; break;
    case 'ArrowLeft': case 'KeyA': dir = Direction.LEFT; break;
    case 'ArrowRight': case 'KeyD': dir = Direction.RIGHT; break;
    default: return;
  }
  e.preventDefault();
  heldDir.value = dir;
  if (!moveBusy.value) movePlayer(dir);
}
function onKU(e: KeyboardEvent) {
  pressed.delete(e.code);
  let dir: Direction | null = null;
  switch (e.code) {
    case 'ArrowUp': case 'KeyW': dir = Direction.UP; break;
    case 'ArrowDown': case 'KeyS': dir = Direction.DOWN; break;
    case 'ArrowLeft': case 'KeyA': dir = Direction.LEFT; break;
    case 'ArrowRight': case 'KeyD': dir = Direction.RIGHT; break;
  }
  if (dir === heldDir.value) {
    heldDir.value = null;
    const remaining = [...pressed].map(c => {
      switch (c) {
        case 'ArrowUp': case 'KeyW': return Direction.UP;
        case 'ArrowDown': case 'KeyS': return Direction.DOWN;
        case 'ArrowLeft': case 'KeyA': return Direction.LEFT;
        case 'ArrowRight': case 'KeyD': return Direction.RIGHT;
      }
      return null;
    }).find(d => d !== null);
    heldDir.value = remaining || null;
  }
}

// ---- 生成 ----
async function generate() {
  if (loading.value) return;
  genToken.value.aborted = true;
  const token: GenToken = { aborted: false };
  genToken.value = token;
  loading.value = true;
  loadPct.value = 0;
  const rows = mazeStore.rows, cols = mazeStore.cols;

  try {
    let data: SimpleMaze | null;
    if (rows * cols <= 10000) data = generateSync(rows, cols, token);
    else data = await generateAsync(rows, cols, p => { loadPct.value = Math.min(p, 100); }, token);
    if (!data || token.aborted) { loading.value = false; return; }

    maze.value = data;
    solutionPath.value = solveMaze(data.walls, data.rows, data.cols, data.entry, data.exit);
    showPath.value = false;
    zoom.value = 1; panX.value = 0; panY.value = 0;
    heldDir.value = null; moveBusy.value = false; pressed.clear();

    const cs = MazeRenderer.fitSize(data.rows, data.cols, canvas.value?.width || 800, canvas.value?.height || 600).cs;
    playerRow.value = data.entry.row; playerCol.value = data.entry.col;
    playerPx.value = data.entry.col * cs + cs / 2;
    playerPy.value = data.entry.row * cs + cs / 2;
    playerStore.reset(data.entry.row, data.entry.col);
    stats.reset(); stats.start();
    showVictory.value = false;
    loading.value = false; loadPct.value = 0;
    await new Promise(r => setTimeout(r, 16));
    fitCanvas();
  } catch (e) { console.error(e); loading.value = false; loadPct.value = 0; }
}

function cancelGen() { genToken.value.aborted = true; loading.value = false; loadPct.value = 0; }
function togglePath() { showPath.value = !showPath.value; draw(); }

function setRows(v: number) { mazeStore.setRows(v); }
function setCols(v: number) { mazeStore.setCols(v); }

function resetPos() {
  const m = maze.value; if (!m) return;
  const cs = getCellSize();
  playerRow.value = m.entry.row; playerCol.value = m.entry.col;
  playerPx.value = m.entry.col * cs + cs / 2;
  playerPy.value = m.entry.row * cs + cs / 2;
  playerStore.reset(m.entry.row, m.entry.col);
  heldDir.value = null; moveBusy.value = false; pressed.clear();
  stats.reset(); stats.start(); draw();
}

// ---- 尺寸编辑 ----
function startEdit(dim: 'rows' | 'cols') {
  editingDim.value = dim;
  editVal.value = String(mazeStore[dim]);
  nextTick(() => {
    const el = document.querySelector('.gv-dim-input') as HTMLInputElement;
    if (el) { el.focus(); el.select(); }
  });
}
function commitEdit() {
  const v = parseInt(editVal.value);
  if (!isNaN(v) && editingDim.value) {
    if (editingDim.value === 'rows') mazeStore.setRows(v);
    else mazeStore.setCols(v);
  }
  editingDim.value = null;
}
function cancelEdit() { editingDim.value = null; }
function onEditKey(e: KeyboardEvent) {
  if (e.key === 'Enter') commitEdit();
  else if (e.key === 'Escape') cancelEdit();
}

onMounted(() => {
  fitCanvas();
  generate();
  window.addEventListener('resize', fitCanvas);
  window.addEventListener('keydown', onKD);
  window.addEventListener('keyup', onKU);
});
onUnmounted(() => {
  genToken.value.aborted = true;
  window.removeEventListener('resize', fitCanvas);
  window.removeEventListener('keydown', onKD);
  window.removeEventListener('keyup', onKU);
});
</script>

<template>
  <div class="gv">
    <WindowTitleBar />
    <div class="gv-body">

      <!-- === 迷宫画布 === -->
      <div class="gv-maze">
        <canvas ref="canvas" v-show="!loading"
          @wheel.prevent="onWheel" @mousedown="onMD"
          @mousemove="onMM" @mouseup="onMU" @mouseleave="onMU"
          :style="{ cursor: dragging ? 'grabbing' : 'grab' }"
        ></canvas>

        <!-- 加载状态 -->
        <div v-if="loading" class="gv-load">
          <div class="gv-load-ring"></div>
          <div class="gv-load-track"><div class="gv-load-bar" :style="{ width: loadPct + '%' }"></div></div>
          <span class="gv-load-pct">{{ loadPct }}%</span>
          <button class="gv-load-cancel" @click="cancelGen"><Square :size="11" /> 取消</button>
        </div>

        <!-- 底部状态条 -->
        <div class="gv-foot" v-if="!loading">
          <div class="gv-foot-l">
            <span class="gv-foot-badge">
              <Grid3X3 :size="10" /> {{ maze?.rows }} × {{ maze?.cols }}
            </span>
            <span class="gv-foot-badge">{{ Math.round(zoom * 100) }}%</span>
          </div>
          <span class="gv-foot-hint">滚轮缩放 · 拖拽平移 · 方向键 / WASD 移动</span>
        </div>
      </div>

      <!-- === 右侧面板 === -->
      <div class="gv-panel" :class="{ 'gv-panel--closed': !panelOpen }">
        <!-- 折叠按钮 -->
        <button class="gv-toggle" @click="panelOpen = !panelOpen" :title="panelOpen ? '收起面板' : '展开面板'">
          <PanelRightClose :size="15" class="gv-toggle-icon" :class="{ 'gv-toggle-icon--flip': !panelOpen }" />
        </button>

        <div class="gv-pn-inner" v-show="panelOpen">

          <!-- 状态 -->
          <div class="gv-sec">
            <div class="gv-sec-hd"><Timer :size="13" /> 状态</div>
            <div class="gv-stats">
              <div class="gv-stat">
                <div class="gv-stat-icon"><Timer :size="14" /></div>
                <div class="gv-stat-body">
                  <span class="gv-stat-label">用时</span>
                  <span class="gv-stat-val">{{ stats.formatTime(stats.elapsed) }}</span>
                </div>
              </div>
              <div class="gv-stat">
                <div class="gv-stat-icon"><Footprints :size="14" /></div>
                <div class="gv-stat-body">
                  <span class="gv-stat-label">步数</span>
                  <span class="gv-stat-val">{{ playerStore.stepCount.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 尺寸 -->
          <div class="gv-sec">
            <div class="gv-sec-hd"><Hash :size="13" /> 尺寸</div>
            <div class="gv-dims">
              <div class="gv-dim">
                <span class="gv-dim-lbl">行</span>
                <input type="range" min="1" max="200" step="1"
                  :value="mazeStore.rows" @input="setRows(parseInt(($event.target as HTMLInputElement).value))" />
                <span v-if="editingDim !== 'rows'" class="gv-dim-val" @click="startEdit('rows')" title="点击编辑">{{ mazeStore.rows }}</span>
                <input v-else class="gv-dim-input" type="number" min="1" max="200"
                  v-model="editVal" @blur="commitEdit" @keydown="onEditKey" />
              </div>
              <div class="gv-dim">
                <span class="gv-dim-lbl">列</span>
                <input type="range" min="1" max="200" step="1"
                  :value="mazeStore.cols" @input="setCols(parseInt(($event.target as HTMLInputElement).value))" />
                <span v-if="editingDim !== 'cols'" class="gv-dim-val" @click="startEdit('cols')" title="点击编辑">{{ mazeStore.cols }}</span>
                <input v-else class="gv-dim-input" type="number" min="1" max="200"
                  v-model="editVal" @blur="commitEdit" @keydown="onEditKey" />
              </div>
            </div>
          </div>

          <!-- 操作 -->
          <div class="gv-sec gv-acts">
            <button class="gv-btn gv-btn--pri" :disabled="loading" @click="generate">
              <RefreshCw :size="14" /> {{ loading ? '生成中…' : '重新生成' }}
            </button>
            <button class="gv-btn" :disabled="loading || !maze" @click="resetPos">
              <RotateCcw :size="14" /> 重置位置
            </button>
            <button v-if="maze" class="gv-btn" :class="{ 'gv-btn--on': showPath }" @click="togglePath">
              <Eye v-if="!showPath" :size="14" /><EyeOff v-else :size="14" />
              {{ showPath ? '隐藏路径' : '显示路径' }}
            </button>
          </div>

          <!-- 主题 -->
          <div class="gv-sec">
            <div class="gv-sec-hd"><Palette :size="13" /> 主题</div>
            <ThemeSwitcher />
          </div>

        </div>
      </div>
    </div>

    <VictoryModal v-if="showVictory" :time="stats.elapsed" :steps="playerStore.stepCount"
      @restart="generate" @close="showVictory = false" />
  </div>
</template>

<style scoped>
/* === 整体布局 === */
.gv { display:flex; flex-direction:column; height:100%; width:100%; }
.gv-body { display:flex; flex:1; min-height:0; }

/* === 迷宫区域 === */
.gv-maze {
  flex:1; position:relative;
  display:flex; align-items:center; justify-content:center;
  padding: 10px; min-width:0;
}
.gv-maze canvas {
  width:100%; height:100%;
  border-radius: 10px;
  user-select:none;
}

/* === 底部状态条 === */
.gv-foot {
  position:absolute; bottom:14px; left:50%; transform:translateX(-50%);
  display:flex; align-items:center; gap:12px;
  pointer-events:none; user-select:none;
  background: var(--panel-bg);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 20px;
  padding: 5px 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px var(--panel-border);
}
.gv-foot-l { display:flex; align-items:center; gap:6px; }
.gv-foot-badge {
  display:inline-flex; align-items:center; gap:3px;
  font-size:10px; font-weight:600;
  color: var(--text-sec);
  opacity:0.7;
  font-family:'JetBrains Mono','SF Mono',monospace;
  letter-spacing:-.2px;
}
.gv-foot-hint {
  font-size:9px; color: var(--text-sec);
  opacity:0.55;
  white-space:nowrap;
}

/* === 加载 === */
.gv-load {
  display:flex; flex-direction:column; align-items:center; gap:12px;
}
.gv-load-ring {
  width:28px; height:28px;
  border:2.5px solid rgba(128,128,128,0.15);
  border-top-color: var(--accent);
  border-radius:50%;
  animation: gv-spin .7s linear infinite;
}
@keyframes gv-spin { to { transform:rotate(360deg); } }
.gv-load-track {
  width:160px; height:3px;
  background:rgba(128,128,128,0.12);
  border-radius:4px; overflow:hidden;
}
.gv-load-bar {
  height:100%;
  background:var(--accent);
  border-radius:4px;
  transition:width .15s ease;
}
.gv-load-pct {
  font-size:12px; font-weight:600;
  color:var(--text-sec);
  font-family:'JetBrains Mono',monospace;
}
.gv-load-cancel {
  display:inline-flex; align-items:center; gap:5px;
  padding:5px 14px;
  border-radius:7px;
  font-size:11px; font-weight:500;
  color:#fff; background:rgba(220,60,60,0.75);
  transition:all 0.15s;
}
.gv-load-cancel:hover { background:rgba(220,60,60,0.92); }

/* === 右侧面板 === */
.gv-panel {
  width:240px; flex-shrink:0;
  background: var(--panel-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-left: 1px solid var(--panel-border);
  box-shadow: -2px 0 24px rgba(0,0,0,0.04);
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow:hidden;
  display:flex; flex-direction:column;
  position:relative;
}
.gv-panel--closed {
  width:36px;
}
.gv-panel::-webkit-scrollbar { width:3px; }
.gv-panel::-webkit-scrollbar-thumb { background:rgba(128,128,128,0.15); border-radius:4px; }

.gv-pn-inner {
  display:flex; flex-direction:column; gap:18px;
  padding:16px 14px;
  overflow-y:auto;
  flex:1;
}
.gv-pn-inner::-webkit-scrollbar { width:3px; }
.gv-pn-inner::-webkit-scrollbar-thumb { background:rgba(128,128,128,0.15); border-radius:4px; }

/* 折叠按钮 */
.gv-toggle {
  position:absolute; top:12px; right:8px;
  width:26px; height:26px;
  display:flex; align-items:center; justify-content:center;
  border-radius:6px;
  color:var(--text-sec);
  opacity:0.5;
  z-index:1;
  transition:all 0.15s ease;
}
.gv-toggle:hover { opacity:1; background:rgba(128,128,128,0.10); }
.gv-panel--closed .gv-toggle { right:5px; }

.gv-toggle-icon {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.gv-toggle-icon--flip {
  transform: rotate(180deg);
}

/* === 区块 === */
.gv-sec {
  display:flex; flex-direction:column; gap:8px;
}
.gv-sec-hd {
  font-size:11px; font-weight:600;
  color:var(--text-sec); opacity:0.8;
  text-transform:uppercase; letter-spacing:1.5px;
  display:flex; align-items:center; gap:5px;
}

/* === 状态卡片 === */
.gv-stats { display:flex; flex-direction:column; gap:6px; }
.gv-stat {
  display:flex; align-items:center; gap:10px;
  padding:11px 12px;
  background:rgba(128,128,128,0.06);
  border-radius:10px;
  border:1px solid rgba(128,128,128,0.06);
  transition:all 0.15s;
}
.gv-stat:hover { background:rgba(128,128,128,0.09); }
.gv-stat-icon {
  width:32px; height:32px;
  display:flex; align-items:center; justify-content:center;
  border-radius:8px;
  background: var(--accent-soft);
  color: var(--accent);
  flex-shrink:0;
}
.gv-stat-body { display:flex; flex-direction:column; gap:1px; }
.gv-stat-label {
  font-size:10px; font-weight:500;
  color:var(--text-sec); opacity:0.8;
}
.gv-stat-val {
  font-size:16px; font-weight:700;
  color:var(--text-pri);
  font-family:'JetBrains Mono','SF Mono',monospace;
  letter-spacing:-.5px; line-height:1.2;
}

/* === 尺寸滑块 === */
.gv-dims { display:flex; flex-direction:column; gap:6px; }
.gv-dim {
  display:flex; align-items:center; gap:8px;
}
.gv-dim-lbl {
  min-width:16px; font-size:11px; font-weight:500;
  color:var(--text-sec); opacity:0.85;
}
.gv-dim input[type="range"] {
  flex:1; height:4px;
  -webkit-appearance:none; appearance:none;
  background:rgba(128,128,128,0.15);
  border-radius:4px; outline:none;
}
.gv-dim input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance:none; appearance:none;
  width:14px; height:14px; border-radius:50%;
  background:var(--accent);
  cursor:pointer;
  box-shadow:0 2px 6px var(--accent-soft);
  transition:transform 0.12s;
}
.gv-dim input[type="range"]::-webkit-slider-thumb:hover { transform:scale(1.15); }
.gv-dim input[type="range"]:disabled { opacity:.3; }
.gv-dim-val {
  min-width:34px; text-align:right;
  font-size:12px; font-weight:600;
  color:var(--accent);
  font-family:'JetBrains Mono',monospace;
  cursor:pointer;
  padding:2px 5px;
  border-radius:4px;
  transition:all .12s;
}
.gv-dim-val:hover {
  background:var(--accent-soft);
}
.gv-dim-input {
  width:48px; padding:2px 4px;
  font-size:12px; font-weight:600;
  font-family:'JetBrains Mono',monospace;
  color:var(--text-pri);
  background:rgba(128,128,128,0.08);
  border:1px solid var(--accent);
  border-radius:4px;
  outline:none;
  text-align:right;
}

/* === 按钮 === */
.gv-acts { gap:6px !important; }
.gv-btn {
  width:100%;
  padding:10px 0;
  border-radius:8px;
  font-size:12px; font-weight:500;
  display:inline-flex; align-items:center; justify-content:center; gap:6px;
  background:rgba(128,128,128,0.08);
  color:var(--text-pri);
  transition:all 0.15s ease;
  border:1px solid transparent;
}
.gv-btn:disabled {
  opacity:.3; cursor:default;
}
.gv-btn:not(:disabled):hover {
  background:rgba(128,128,128,0.14);
}
.gv-btn--pri {
  background:var(--accent) !important;
  color:#fff !important;
  box-shadow:0 2px 8px var(--accent-soft);
  border-color:transparent !important;
}
.gv-btn--pri:not(:disabled):hover {
  filter:brightness(1.08);
  box-shadow:0 4px 14px var(--accent-soft);
}
.gv-btn--on {
  background:var(--accent);
  color:#fff;
  border-color:transparent;
}
</style>
