import { computed } from 'vue';
import { usePlayerStore } from '@/store/playerStore';

/**
 * 玩家相关逻辑组合式函数
 */
export function usePlayer() {
  const playerStore = usePlayerStore();

  // 当前玩家位置
  const playerPos = computed(() => ({
    x: playerStore.x,
    y: playerStore.y,
    gridRow: playerStore.gridRow,
    gridCol: playerStore.gridCol
  }));

  // 目标位置
  const targetPos = computed(() => ({
    x: playerStore.targetX,
    y: playerStore.targetY
  }));

  // 是否正在移动
  const isMoving = computed(() => playerStore.isMoving);

  // 移动方向
  const direction = computed(() => playerStore.direction);

  // 移动速度
  const speed = computed(() => playerStore.speed);

  // 步数
  const stepCount = computed(() => playerStore.stepCount);

  // 更新速度
  const updateSpeed = (value: number) => {
    playerStore.updateSpeed(value);
  };

  // 移动玩家
  const movePlayer = (newDirection: any) => {
    playerStore.movePlayer(newDirection);
  };

  // 停止动画
  const stopAnimation = () => {
    playerStore.stopAnimation();
  };

  // 重置玩家
  const resetPlayer = () => {
    playerStore.resetPlayer();
  };

  // 设置位置
  const setPosition = (row: number, col: number, targetRow?: number, targetCol?: number) => {
    playerStore.setPosition(row, col, targetRow, targetCol);
  };

  return {
    playerPos,
    targetPos,
    isMoving,
    direction,
    speed,
    stepCount,
    updateSpeed,
    movePlayer,
    stopAnimation,
    resetPlayer,
    setPosition
  };
}
