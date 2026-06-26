import { onUnmounted } from 'vue';
import { usePlayerStore } from '@/store/playerStore';
import type { PlayerConfig } from '@/types/player';

export function usePlayerAnimation(
    playerStore: ReturnType<typeof usePlayerStore>,
    cellSize: number,
    _config: PlayerConfig,
    onMoveComplete?: () => void
) {
    let animationFrameId: number | null = null;
    let lastTime = 0;
    let isAnimating = false;
    let accumulatedDelta = 0;

    const startAnimation = (_direction: any) => {
        if (isAnimating) {
            return;
        }

        isAnimating = true;
        lastTime = performance.now();
        accumulatedDelta = 0;

        animate();
    };

    const animate = () => {
        if (!isAnimating) {
            return;
        }

        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        if (deltaTime > 100) {
            animationFrameId = requestAnimationFrame(animate);
            return;
        }

        accumulatedDelta += deltaTime;

        const speed = playerStore.speed;
        const stepSize = (speed * accumulatedDelta) / 1000;

        const dx = playerStore.targetX - playerStore.x;
        const dy = playerStore.targetY - playerStore.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= stepSize) {
            playerStore.x = playerStore.targetX;
            playerStore.y = playerStore.targetY;

            playerStore.gridRow = Math.round(playerStore.y / cellSize);
            playerStore.gridCol = Math.round(playerStore.x / cellSize);

            isAnimating = false;
            accumulatedDelta = 0;

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }

            onMoveComplete?.();
            return;
        }

        const moveX = (dx / distance) * stepSize;
        const moveY = (dy / distance) * stepSize;
        playerStore.x += moveX;
        playerStore.y += moveY;

        animationFrameId = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
        isAnimating = false;
        accumulatedDelta = 0;

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    };

    const resetAnimation = () => {
        stopAnimation();
        isAnimating = false;
        accumulatedDelta = 0;
        lastTime = performance.now();
    };

    onUnmounted(() => {
        stopAnimation();
    });

    return {
        startAnimation,
        stopAnimation,
        resetAnimation
    };
}

export class AnimationManager {
    private animations: Set<() => void> = new Set();
    private animationFrameId: number | null = null;

    addAnimation(callback: () => void): () => void {
        this.animations.add(callback);

        if (this.animations.size === 1) {
            this.startAnimationLoop();
        }

        return () => {
            this.animations.delete(callback);
            if (this.animations.size === 0) {
                this.stopAnimationLoop();
            }
        };
    }

    private startAnimationLoop(): void {
        const loop = () => {
            if (this.animations.size === 0) {
                this.animationFrameId = null;
                return;
            }

            this.animations.forEach(callback => callback());

            this.animationFrameId = requestAnimationFrame(loop);
        };

        this.animationFrameId = requestAnimationFrame(loop);
    }

    private stopAnimationLoop(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    getAnimationCount(): number {
        return this.animations.size;
    }

    clear(): void {
        this.animations.clear();
        this.stopAnimationLoop();
    }
}

export const globalAnimationManager = new AnimationManager();
