import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Direction } from '@/types/maze';

export type PlayerShape = 'circle' | 'square' | 'diamond' | 'star' | 'heart';

export const PLAYER_SHAPES: { key: PlayerShape; label: string }[] = [
  { key: 'circle', label: '圆形' },
  { key: 'square', label: '方形' },
  { key: 'diamond', label: '菱形' },
  { key: 'star', label: '星形' },
  { key: 'heart', label: '爱心' },
];

export const PLAYER_ICONS = ['😀','😎','🤖','🐱','🦊','🎮','🚀','⭐','💎','🔥','🎯','🧩'];

export const usePlayerStore = defineStore('player', () => {
  const gridRow = ref(0);
  const gridCol = ref(0);
  const stepCount = ref(0);
  const dir = ref<Direction | null>(null);

  // 自定义外观
  const shape = ref<PlayerShape>('circle');
  const icon = ref('');
  const image = ref('');     // base64 data URL
  const size = ref(0.6);     // 0.2 ~ 1.0，相对 cell 尺寸的比例

  const pos = computed(() => ({ row: gridRow.value, col: gridCol.value }));

  const reset = (row = 0, col = 0) => {
    gridRow.value = row;
    gridCol.value = col;
    stepCount.value = 0;
    dir.value = null;
  };

  const move = (direction: Direction, row: number, col: number) => {
    gridRow.value = row;
    gridCol.value = col;
    stepCount.value++;
    dir.value = direction;
  };

  const setShape = (s: PlayerShape) => { shape.value = s; save(); };
  const setIcon = (i: string) => { icon.value = i; image.value = ''; save(); };
  const setImage = (d: string) => { image.value = d; icon.value = ''; save(); };
  const clearImage = () => { image.value = ''; save(); };
  const setSize = (s: number) => { size.value = Math.max(0.2, Math.min(1, s)); save(); };

  // 持久化
  const save = () => {
    try {
      localStorage.setItem('maze_player', JSON.stringify({
        shape: shape.value,
        icon: icon.value,
        image: image.value,
        size: size.value,
      }));
    } catch {}
  };
  const load = () => {
    try {
      const d = JSON.parse(localStorage.getItem('maze_player') || '{}');
      if (d.shape) shape.value = d.shape;
      if (d.icon) icon.value = d.icon;
      if (d.image) image.value = d.image;
      if (d.size) size.value = d.size;
    } catch {}
  };

  return {
    gridRow, gridCol, stepCount, dir, pos,
    shape, icon, image, size,
    reset, move, setShape, setIcon, setImage, clearImage, setSize,
    save, load,
  };
});
