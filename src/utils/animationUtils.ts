import type { Ref } from 'vue';

export class AnimationUtils {
  static createSmoothTransition(
    startValue: number,
    endValue: number,
    duration: number,
    onProgress?: (progress: number) => void
  ): { value: Ref<number>, stop: () => void } {
    const { ref } = require('vue');
    const value = ref(startValue);

    if (duration <= 0) {
      value.value = endValue;
      return { value, stop: () => {} };
    }

    const startTime = performance.now();
    let animationFrameId: number | null = null;

    const animate = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      let progress = elapsed / duration;

      if (progress > 1) {
        progress = 1;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }

        value.value = endValue;
        onProgress?.(1);
        return;
      }

      const easedProgress = this.easeOutQuad(progress);

      value.value = startValue + (endValue - startValue) * easedProgress;

      onProgress?.(easedProgress);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return {
      value,
      stop: () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }
    };
  }

  private static easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  static createPulseAnimation(
    duration: number,
    onTick: (scale: number) => void,
    onComplete?: () => void
  ): { stop: () => void } {
    const startTime = performance.now();
    let animationFrameId: number | null = null;

    const animate = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      let progress = elapsed / duration;

      if (progress > 1) {
        progress = 1;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }

        onTick?.(1);
        onComplete?.();
        return;
      }

      let scale: number;
      if (progress < 0.5) {
        scale = 1.0 + (0.1 * progress * 2);
      } else {
        scale = 1.1 - (0.1 * (progress - 0.5) * 2);
      }

      onTick?.(scale);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return {
      stop: () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }
    };
  }

  static createBreathingAnimation(
    duration: number,
    onTick: (opacity: number) => void,
    onComplete?: () => void
  ): { stop: () => void } {
    const startTime = performance.now();
    let animationFrameId: number | null = null;

    const animate = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      let progress = elapsed / duration;

      if (progress > 1) {
        progress = 1;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }

        onTick?.(1);
        onComplete?.();
        return;
      }

      let opacity: number;
      if (progress < 0.5) {
        opacity = 0.7 + (0.3 * progress * 2);
      } else {
        opacity = 1.0 - (0.3 * (progress - 0.5) * 2);
      }

      onTick?.(opacity);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return {
      stop: () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }
    };
  }

  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  static lerpColor(
    startColor: string,
    _endColor: string,
    _t: number
  ): string {
    return startColor;
  }
}
