import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { MovementDirection } from '@/types/player';
import { PLAYER_CONFIG } from '@/constants/config';

export const usePlayerStore = defineStore('player', () => {
  const x = ref<number>(0);
  const y = ref<number>(0);
  const gridRow = ref<number>(0);
  const gridCol = ref<number>(0);
  const targetX = ref<number>(0);
  const targetY = ref<number>(0);
  const isMoving = ref<boolean>(false);
  const direction = ref<MovementDirection | null>(null);
  const animationFrameId = ref<number | null>(null);
  const speed = ref<number>(PLAYER_CONFIG.defaultSpeed);
  const stepCount = ref<number>(0);

  let lastTime = 0;
  let accumulatedDelta = 0;

  const updateSpeed = (value: number) => {
    const clampedSpeed = Math.max(1, Math.min(10, value));
    if (isNaN(clampedSpeed) || clampedSpeed < 1 || clampedSpeed > 10) {
      console.warn('Invalid speed value, clamping to valid range');
    }
    speed.value = clampedSpeed;
  };

  const movePlayer = (newDirection: MovementDirection) => {
    if (isMoving.value) {
      direction.value = newDirection;
      return;
    }

    if (!direction.value) {
      direction.value = newDirection;
    }

    isMoving.value = true;
    lastTime = performance.now();
    accumulatedDelta = 0;

    animate();
  };

  const animate = () => {
    if (!isMoving.value) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    if (deltaTime > 100) {
      animationFrameId.value = requestAnimationFrame(animate);
      return;
    }

    accumulatedDelta += deltaTime;

    const pixelSize = 40;
    const speedPerPixel = (speed.value * pixelSize) / 1000;

    const dx = targetX.value - x.value;
    const dy = targetY.value - y.value;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= speedPerPixel) {
      x.value = targetX.value;
      y.value = targetY.value;
      gridRow.value = Math.round(y.value / pixelSize);
      gridCol.value = Math.round(x.value / pixelSize);

      isMoving.value = false;
      direction.value = null;
      accumulatedDelta = 0;

      if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value);
        animationFrameId.value = null;
      }

      stepCount.value++;
      return;
    }

    const moveX = (dx / distance) * speedPerPixel;
    const moveY = (dy / distance) * speedPerPixel;
    x.value += moveX;
    y.value += moveY;

    animationFrameId.value = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    isMoving.value = false;
    accumulatedDelta = 0;

    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = null;
    }
  };

  const resetPlayer = () => {
    stopAnimation();
    x.value = 0;
    y.value = 0;
    gridRow.value = 0;
    gridCol.value = 0;
    targetX.value = 0;
    targetY.value = 0;
    isMoving.value = false;
    direction.value = null;
    stepCount.value = 0;
  };

  const setPosition = (row: number, col: number, targetRow?: number, targetCol?: number) => {
    if (row < 0 || col < 0) {
      console.warn(`Invalid position: row=${row}, col=${col}, clamping to 0`);
      row = Math.max(0, row);
      col = Math.max(0, col);
    }

    const pixelSize = 40;
    x.value = col * pixelSize;
    y.value = row * pixelSize;
    gridRow.value = row;
    gridCol.value = col;

    if (targetRow !== undefined && targetCol !== undefined) {
      targetX.value = targetCol * pixelSize;
      targetY.value = targetRow * pixelSize;
    } else {
      targetX.value = x.value;
      targetY.value = y.value;
    }

    targetX.value = Math.max(0, targetX.value);
    targetY.value = Math.max(0, targetY.value);
  };

  const cleanup = () => {
    stopAnimation();
  };

  return {
    x,
    y,
    gridRow,
    gridCol,
    targetX,
    targetY,
    isMoving,
    direction,
    speed,
    stepCount,
    updateSpeed,
    movePlayer,
    stopAnimation,
    resetPlayer,
    setPosition,
    cleanup
  };
});
