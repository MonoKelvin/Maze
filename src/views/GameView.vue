<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
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

import { RotateCcw, RefreshCw, Square, Eye, EyeOff, Maximize2, ZoomIn } from 'lucide-vue-next';

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

// 玩家像素位置（动画插值用）
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

const ts = computed(() => {
  const t = settings.themes[settings.theme];
  return t ? { '--ac': t.accent, '--tx': t.text, '--txs': t.textSecondary, background: t.background } as any : {};
});

// ---- 绘制 ----
function draw() {
  const c = canvas.value, m = maze.value;
  if (!c || !m) return;
  const ctx = c.getContext('2d');
  if (!ctx) return;
  const t = settings.themes[settings.theme];
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

// ---- 缩放（鼠标居中） ----
function onWheel(e: WheelEvent) {
  if (!maze.value || loading.value) return;
  e.preventDefault();
  const rect = canvas.value!.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const old = zoom.value;
  const nz = Math.max(0.1, Math.min(10, +(old + (e.deltaY > 0 ? -0.12 : 0.12)).toFixed(2)));
  panX.value = mx - (mx - panX.value) * (nz / old);
  panY.value = my - (my - panY.value) * (nz / old);
  zoom.value = nz;
  draw();
}

// ---- 拖拽 ----
function onMD(e: MouseEvent) {
  if (!maze.value || loading.value) return;
  const c = canvas.value; if (!c) return;
  // 检测迷宫是否超出视口
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
const ANIM_DURATION = 80; // ms per cell
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
    // ease-out
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

      // 胜利检测
      const _m = maze.value;
      if (_m && t.row === _m.exit.row && t.col === _m.exit.col) {
        stats.stop(); showVictory.value = true;
        heldDir.value = null;
        return;
      }
      // 按住连走
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

function setRows(v: string) { mazeStore.setRows(parseInt(v) || 1); setTimeout(fitCanvas, 20); }
function setCols(v: string) { mazeStore.setCols(parseInt(v) || 1); setTimeout(fitCanvas, 20); }
function setZoomPct(v: string) { zoom.value = Math.max(0.1, Math.min(10, (parseInt(v) || 100) / 100)); draw(); }

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
  <div class="gv" :style="ts">
    <WindowTitleBar />
    <div class="body">

      <!-- 迷宫 -->
      <div class="mz">
        <canvas ref="canvas" v-show="!loading"
          @wheel.prevent="onWheel" @mousedown="onMD"
          @mousemove="onMM" @mouseup="onMU" @mouseleave="onMU"
          :style="{ cursor: dragging ? 'grabbing' : 'grab' }"
        ></canvas>

        <div v-if="loading" class="ld">
          <div class="spin"></div>
          <div class="ld-bar"><div class="ld-fill" :style="{ width: loadPct + '%' }"></div></div>
          <span class="ld-txt">{{ loadPct }}%</span>
          <button class="ld-cancel" @click="cancelGen"><Square :size="11" /> 停止</button>
        </div>

        <div class="ft" v-if="!loading">
          <span>{{ maze?.rows }}×{{ maze?.cols }}</span>
          <span>{{ Math.round(zoom * 100) }}%</span>
          <span>方向键/WASD 移动 · 滚轮缩放 · 拖拽</span>
        </div>
      </div>

      <!-- 面板 -->
      <div class="pn">
        <div class="sc">
          <div class="st">状态</div>
          <div class="rw g6">
            <div class="stat"><span class="sl">用时</span><span class="sv">{{ stats.formatTime(stats.elapsed) }}</span></div>
            <div class="stat"><span class="sl">步数</span><span class="sv">{{ playerStore.stepCount.toLocaleString() }}</span></div>
          </div>
        </div>

        <div class="sc"><ThemeSwitcher /></div>

        <div class="sc">
          <div class="st"><Maximize2 :size="11" /> 尺寸</div>
          <div class="rc">
            <div class="rc-i"><span class="rl">行</span>
              <input type="range" min="1" max="1000" step="1"
                :value="mazeStore.rows" @input="setRows(($event.target as any).value)" class="sli" />
              <span class="sv w-40">{{ mazeStore.rows }}</span>
            </div>
            <div class="rc-i"><span class="rl">列</span>
              <input type="range" min="1" max="1000" step="1"
                :value="mazeStore.cols" @input="setCols(($event.target as any).value)" class="sli" />
              <span class="sv w-40">{{ mazeStore.cols }}</span>
            </div>
          </div>
        </div>

        <div class="sc g6">
          <button class="btn primary" :disabled="loading" @click="generate">
            <RefreshCw :size="13" /> {{ loading ? '生成中…' : '重新生成' }}
          </button>
          <button class="btn" :disabled="loading || !maze" @click="resetPos">
            <RotateCcw :size="13" /> 重置位置
          </button>
          <button v-if="maze" class="btn" :class="{ act: showPath }" @click="togglePath">
            <Eye v-if="!showPath" :size="13" /><EyeOff v-else :size="13" /> {{ showPath ? '隐藏路径' : '显示路径' }}
          </button>
        </div>

        <div class="sc" v-if="maze">
          <div class="st"><ZoomIn :size="11" /> 缩放</div>
          <div class="rw g8">
            <button class="z-btn" @click="zoom = Math.max(0.1, +(zoom - 0.25).toFixed(2)); draw()">−</button>
            <input type="range" min="10" max="1000" step="1"
              :value="Math.round(zoom * 100)" @input="setZoomPct(($event.target as any).value)" class="sli" />
            <button class="z-btn" @click="zoom = Math.min(10, +(zoom + 0.25).toFixed(2)); draw()">+</button>
            <span class="sv w-36">{{ Math.round(zoom * 100) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <VictoryModal v-if="showVictory" :time="stats.elapsed" :steps="playerStore.stepCount"
      @restart="generate" @close="showVictory = false" />
  </div>
</template>

<style scoped>
.gv { display:flex; flex-direction:column; height:100%; width:100%; }
.body { display:flex; flex:1; min-height:0; }

/* 迷宫区 */
.mz { flex:1; position:relative; display:flex; align-items:center; justify-content:center; padding:6px; min-width:0; }
.mz canvas { width:100%; height:100%; border-radius:8px; user-select:none; }
.ft { position:absolute; bottom:8px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:10px; font-size:9px; color:var(--txs); opacity:0.35; pointer-events:none; white-space:nowrap; }

/* 加载 */
.ld { display:flex; flex-direction:column; align-items:center; gap:8px; }
.spin { width:20px; height:20px; border:2px solid var(--ac); border-top-color:transparent; border-radius:50%; animation:s .6s linear infinite; }
@keyframes s { to { transform:rotate(360deg); } }
.ld-bar { width:140px; height:3px; background:rgba(0,0,0,0.06); border-radius:4px; overflow:hidden; }
.ld-fill { height:100%; background:var(--ac); border-radius:4px; transition:width .15s; }
.ld-txt { font-size:11px; font-weight:600; color:var(--txs); font-family:'JetBrains Mono',monospace; }
.ld-cancel { padding:3px 10px; border:none; border-radius:5px; font-size:10px; color:#fff; background:rgba(200,50,50,0.7); cursor:pointer; display:flex; align-items:center; gap:4px; }
.ld-cancel:hover { background:rgba(200,50,50,0.9); }

/* 面板 */
.pn { width:230px; flex-shrink:0; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding:12px 10px; background:var(--panel-bg); backdrop-filter:blur(16px); border-left:1px solid rgba(0,0,0,0.04); }
.pn::-webkit-scrollbar { width:3px; }
.pn::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.08); border-radius:4px; }

.sc { display:flex; flex-direction:column; gap:6px; }
.st { font-size:10px; font-weight:600; color:var(--txs); text-transform:uppercase; letter-spacing:1px; }
.rw { display:flex; align-items:center; }
.g6 { gap:8px; } .g8 { gap:8px; }

.rc { display:flex; flex-direction:column; gap:5px; }
.rc-i { display:flex; align-items:center; gap:6px; }
.rl { min-width:14px; font-size:11px; font-weight:500; color:var(--txs); }

.stat { flex:1; display:flex; flex-direction:column; gap:2px; padding:8px 10px; background:rgba(0,0,0,0.02); border-radius:6px; }
.sl { font-size:11px; color:var(--txs); }
.sv { font-size:15px; font-weight:700; color:var(--tx); font-family:'JetBrains Mono',monospace; letter-spacing:-.5px; }
.w-40 { min-width:40px; text-align:right; }
.w-36 { min-width:36px; text-align:right; }

.sli { flex:1; height:3px; appearance:none; background:rgba(0,0,0,0.06); border-radius:4px; outline:none; }
.sli::-webkit-slider-thumb { appearance:none; width:11px; height:11px; border-radius:50%; background:var(--ac); cursor:pointer; }
.sli:disabled { opacity:.35; }

.z-btn { width:24px; height:24px; display:flex; align-items:center; justify-content:center; border:none; border-radius:5px; background:rgba(0,0,0,0.03); color:var(--tx); cursor:pointer; flex-shrink:0; font-size:14px; line-height:1; }
.z-btn:hover { background:rgba(0,0,0,0.07); }

.btn { width:100%; padding:9px 0; border:none; border-radius:6px; font-size:13px; font-weight:500; display:inline-flex; align-items:center; justify-content:center; gap:5px; background:rgba(0,0,0,0.03); color:var(--tx); transition:all .12s; }
.btn:disabled { opacity:.35; cursor:default; }
.btn:not(:disabled):hover { background:rgba(0,0,0,0.07); }
.btn.act { background:var(--ac); color:#fff; }
.btn.primary { background:var(--ac); color:#fff; }
.btn.primary:not(:disabled):hover { opacity:.85; }
</style>
