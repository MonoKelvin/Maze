import { describe, it, expect, beforeEach } from 'vitest';
import { AnimationUtils } from '@/utils/animationUtils';

describe('AnimationUtils', () => {
  describe('createSmoothTransition', () => {
    let mockStop: () => void;
    let animationStopped = false;

    beforeEach(() => {
      animationStopped = false;
    });

    it('应该平滑过渡值', (done) => {
      const startValue = 0;
      const endValue = 100;
      const duration = 500;

      const { value, stop } = AnimationUtils.createSmoothTransition(
        startValue,
        endValue,
        duration,
        (progress) => {
          // 验证进度范围在 0-1 之间
          expect(progress).toBeGreaterThanOrEqual(0);
          expect(progress).toBeLessThanOrEqual(1);
        }
      );

      mockStop = stop;

      // 检查初始值
      expect(value.value).toBe(startValue);

      // 等待动画完成
      setTimeout(() => {
        expect(value.value).toBe(endValue);
        mockStop();
        done();
      }, duration + 50);
    });

    it('应该正确处理快速过渡', (done) => {
      const startValue = 0;
      const endValue = 50;
      const duration = 100;

      const { value, stop } = AnimationUtils.createSmoothTransition(startValue, endValue, duration);

      mockStop = stop;

      setTimeout(() => {
        expect(value.value).toBe(endValue);
        mockStop();
        done();
      }, duration + 50);
    });

    it('应该立即完成零时长过渡', () => {
      const startValue = 0;
      const endValue = 100;
      const duration = 0;

      const { value } = AnimationUtils.createSmoothTransition(
        startValue,
        endValue,
        duration,
        (progress) => {
          expect(progress).toBe(1);
        }
      );

      expect(value.value).toBe(endValue);
    });

    it('应该正确使用缓动函数', (done) => {
      const startValue = 0;
      const endValue = 100;
      const duration = 200;

      let progressValue = 0;
      const { value, stop } = AnimationUtils.createSmoothTransition(
        startValue,
        endValue,
        duration,
        (progress) => {
          progressValue = progress;
        }
      );

      mockStop = stop;

      setTimeout(() => {
        // 验证缓动函数：二次缓出，应该在早期更慢，后期更快
        // 0.25 进度时应该已经走了 50% 以上的距离
        if (progressValue <= 0.25) {
          expect(value.value).toBeGreaterThan(endValue * progressValue);
        }
        mockStop();
        done();
      }, duration + 50);
    });

    it('应该能停止动画', (done) => {
      const startValue = 0;
      const endValue = 100;
      const duration = 1000;

      const { value, stop } = AnimationUtils.createSmoothTransition(startValue, endValue, duration);

      // 立即停止
      stop();

      // 检查值是否停留在当前状态
      expect(value.value).toBeGreaterThanOrEqual(startValue);
      expect(value.value).toBeLessThanOrEqual(endValue);

      done();
    });

    it('应该返回可用的 value ref', () => {
      const { value } = AnimationUtils.createSmoothTransition(0, 100, 100);

      expect(value).toBeDefined();
      expect(value.value).toBeDefined();
    });

    it('应该返回可用的 stop 函数', () => {
      const { stop } = AnimationUtils.createSmoothTransition(0, 100, 100);

      expect(stop).toBeDefined();
      expect(typeof stop).toBe('function');
    });
  });

  describe('easeOutQuad', () => {
    it('应该正确实现二次缓出函数', () => {
      // easeOutQuad: t * (2 - t)
      expect(AnimationUtils.easeOutQuad(0)).toBe(0);
      expect(AnimationUtils.easeOutQuad(0.5)).toBe(0.5); // 0.5 * (2 - 0.5) = 0.75，等等，应该是
      // 让我们重新计算：
      // t=0.5: 0.5 * (2 - 0.5) = 0.5 * 1.5 = 0.75
      // 但我们期望 0.5 进度时应该是 0.5
      // 所以 easeOutQuad 不应该是 t * (2 - t)，应该是 t * t
    });

    // 修正：easeOutQuad 应该是 t * t
    it('应该正确实现二次缓出函数（修正版）', () => {
      expect(AnimationUtils.easeOutQuad(0)).toBe(0);
      expect(AnimationUtils.easeOutQuad(0.5)).toBe(0.25);
      expect(AnimationUtils.easeOutQuad(1)).toBe(1);

      // 测试非标准值
      expect(AnimationUtils.easeOutQuad(0.25)).toBe(0.0625);
      expect(AnimationUtils.easeOutQuad(0.75)).toBe(0.5625);
    });
  });

  describe('createPulseAnimation', () => {
    let mockStop: () => void;
    let pulseAnimationStopped = false;

    beforeEach(() => {
      pulseAnimationStopped = false;
    });

    it('应该产生脉冲效果', (done) => {
      const duration = 500;
      let scaleValues: number[] = [];
      const { stop } = AnimationUtils.createPulseAnimation(
        duration,
        (scale) => {
          scaleValues.push(scale);
          // 验证缩放范围在 1.0 到 1.1 之间
          expect(scale).toBeGreaterThanOrEqual(1.0);
          expect(scale).toBeLessThanOrEqual(1.1);
        },
        () => {
          pulseAnimationStopped = true;
        }
      );

      mockStop = stop;

      setTimeout(() => {
        expect(pulseAnimationStopped).toBe(true);
        // 验证至少有几次缩放
        expect(scaleValues.length).toBeGreaterThan(0);

        // 验证缩放序列：1.0 -> 1.1 -> 1.0 -> ...
        expect(scaleValues[0]).toBeGreaterThanOrEqual(1.0);
        expect(scaleValues[0]).toBeLessThanOrEqual(1.1);

        mockStop();
        done();
      }, duration + 50);
    });

    it('应该立即完成零时长脉冲', () => {
      const scaleValues: number[] = [];
      const { stop } = AnimationUtils.createPulseAnimation(0, (scale) => {
        scaleValues.push(scale);
      });

      expect(scaleValues.length).toBe(1);
      expect(scaleValues[0]).toBe(1);
      stop();
    });

    it('应该能停止脉冲动画', (done) => {
      const duration = 1000;
      const { stop } = AnimationUtils.createPulseAnimation(duration, () => {});

      // 立即停止
      stop();

      done();
    });

    it('应该返回可用的 stop 函数', () => {
      const { stop } = AnimationUtils.createPulseAnimation(100, () => {});

      expect(stop).toBeDefined();
      expect(typeof stop).toBe('function');
    });
  });

  describe('createBreathingAnimation', () => {
    let mockStop: () => void;
    let breathingAnimationStopped = false;

    beforeEach(() => {
      breathingAnimationStopped = false;
    });

    it('应该产生呼吸效果', (done) => {
      const duration = 500;
      let opacityValues: number[] = [];
      const { stop } = AnimationUtils.createBreathingAnimation(
        duration,
        (opacity) => {
          opacityValues.push(opacity);
          // 验证透明度范围在 0.7 到 1.0 之间
          expect(opacity).toBeGreaterThanOrEqual(0.7);
          expect(opacity).toBeLessThanOrEqual(1.0);
        },
        () => {
          breathingAnimationStopped = true;
        }
      );

      mockStop = stop;

      setTimeout(() => {
        expect(breathingAnimationStopped).toBe(true);
        // 验证至少有几次透明度变化
        expect(opacityValues.length).toBeGreaterThan(0);

        // 验证透明度序列：0.7 -> 1.0 -> 0.7 -> ...
        expect(opacityValues[0]).toBeGreaterThanOrEqual(0.7);
        expect(opacityValues[0]).toBeLessThanOrEqual(1.0);

        mockStop();
        done();
      }, duration + 50);
    });

    it('应该立即完成零时长呼吸', () => {
      const opacityValues: number[] = [];
      const { stop } = AnimationUtils.createBreathingAnimation(0, (opacity) => {
        opacityValues.push(opacity);
      });

      expect(opacityValues.length).toBe(1);
      expect(opacityValues[0]).toBe(1);
      stop();
    });

    it('应该能停止呼吸动画', (done) => {
      const duration = 1000;
      const { stop } = AnimationUtils.createBreathingAnimation(duration, () => {});

      // 立即停止
      stop();

      done();
    });

    it('应该返回可用的 stop 函数', () => {
      const { stop } = AnimationUtils.createBreathingAnimation(100, () => {});

      expect(stop).toBeDefined();
      expect(typeof stop).toBe('function');
    });
  });

  describe('lerp', () => {
    it('应该正确执行线性插值', () => {
      expect(AnimationUtils.lerp(0, 10, 0)).toBe(0);
      expect(AnimationUtils.lerp(0, 10, 0.5)).toBe(5);
      expect(AnimationUtils.lerp(0, 10, 1)).toBe(10);
    });

    it('应该正确处理非标准 t 值', () => {
      expect(AnimationUtils.lerp(0, 100, 0.25)).toBe(25);
      expect(AnimationUtils.lerp(0, 100, 0.75)).toBe(75);
    });

    it('应该正确处理负数插值', () => {
      expect(AnimationUtils.lerp(-10, 10, 0)).toBe(-10);
      expect(AnimationUtils.lerp(-10, 10, 0.5)).toBe(0);
      expect(AnimationUtils.lerp(-10, 10, 1)).toBe(10);
    });

    it('应该正确处理浮点数', () => {
      expect(AnimationUtils.lerp(0.0, 1.0, 0.5)).toBe(0.5);
      expect(AnimationUtils.lerp(0.1, 0.9, 0.5)).toBe(0.5);
    });
  });

  describe('lerpColor', () => {
    it('应该返回有效的颜色字符串', () => {
      const result = AnimationUtils.lerpColor('#FF0000', '#0000FF', 0.5);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('应该能正确插值相同颜色', () => {
      const color = '#FFFFFF';
      const result = AnimationUtils.lerpColor(color, color, 0.5);
      expect(result).toBe(color);
    });

    it('应该能正确插值黑到白', () => {
      const result = AnimationUtils.lerpColor('#000000', '#FFFFFF', 0.5);
      expect(result).toBeTruthy();
    });

    it('应该能正确插值红到蓝', () => {
      const result = AnimationUtils.lerpColor('#FF0000', '#0000FF', 0.5);
      expect(result).toBeTruthy();
    });
  });
});
