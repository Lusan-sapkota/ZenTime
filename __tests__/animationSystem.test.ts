/**
 * Animation System Tests
 * 
 * Tests for the animation configuration, management, and performance optimization system.
 */

import { Animated } from 'react-native';
import {
  AnimationManager,
  getAnimationManager,
  DEFAULT_ANIMATIONS,
  getEasingFunction,
  createStaggeredAnimation,
  createSpringAnimation,
  createRippleAnimation,
} from '../utils/animationUtils';
import {
  AnimationPerformanceMonitor,
  getPerformanceMonitor,
} from '../utils/animationPerformance';
import { PerformanceSettings, AnimationConfig } from '../types/theme';

// Mock global functions
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 16);
  return 1;
});

global.cancelAnimationFrame = jest.fn();

// Mock React Native Animated
jest.mock('react-native', () => ({
  Animated: {
    Value: jest.fn().mockImplementation((value) => ({ _value: value })),
    timing: jest.fn().mockReturnValue({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
    }),
    loop: jest.fn().mockReturnValue({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
    }),
    sequence: jest.fn().mockReturnValue({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
    }),
    parallel: jest.fn().mockReturnValue({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
    }),
    spring: jest.fn().mockReturnValue({
      start: jest.fn((callback) => callback && callback({ finished: true })),
      stop: jest.fn(),
    }),
  },
  Easing: {
    linear: 'linear',
    ease: 'ease',
    in: jest.fn((easing) => `in(${easing})`),
    out: jest.fn((easing) => `out(${easing})`),
    inOut: jest.fn((easing) => `inOut(${easing})`),
    bezier: jest.fn((a, b, c, d) => `bezier(${a},${b},${c},${d})`),
  },
  Platform: {
    OS: 'ios',
    Version: '14.0',
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  PixelRatio: {
    get: jest.fn(() => 3),
  },
  InteractionManager: {
    runAfterInteractions: jest.fn((callback) => callback()),
  },
}));

describe('Animation System', () => {
  let performanceSettings: PerformanceSettings;
  let animationManager: AnimationManager;

  beforeEach(() => {
    performanceSettings = {
      reducedMotion: false,
      hardwareAcceleration: true,
      maxConcurrentAnimations: 5,
      frameRateTarget: 60,
      performanceLevel: 'high',
    };
    
    animationManager = new AnimationManager(performanceSettings);
    jest.clearAllMocks();
  });

  describe('Animation Configuration', () => {
    test('should have default animation configurations', () => {
      expect(DEFAULT_ANIMATIONS.colorTransition).toBeDefined();
      expect(DEFAULT_ANIMATIONS.breathingCycle).toBeDefined();
      expect(DEFAULT_ANIMATIONS.digitTransition).toBeDefined();
      expect(DEFAULT_ANIMATIONS.rippleEffect).toBeDefined();
    });

    test('should convert easing curves correctly', () => {
      expect(getEasingFunction('linear')).toBe('linear');
      expect(getEasingFunction('ease')).toBe('ease');
      expect(getEasingFunction('ease-in')).toBe('in(ease)');
      expect(getEasingFunction('ease-out')).toBe('out(ease)');
      expect(getEasingFunction('ease-in-out')).toBe('inOut(ease)');
    });

    test('should create optimized config based on performance settings', () => {
      const baseConfig: AnimationConfig = {
        duration: 300,
        easing: 'ease-out',
      };

      const optimizedConfig = animationManager.createOptimizedConfig(baseConfig);
      expect(optimizedConfig.duration).toBe(300);
      expect(optimizedConfig.easing).toBe('ease-out');
    });

    test('should disable animations when reduced motion is enabled', () => {
      const reducedMotionSettings: PerformanceSettings = {
        ...performanceSettings,
        reducedMotion: true,
      };
      
      const reducedMotionManager = new AnimationManager(reducedMotionSettings);
      const baseConfig: AnimationConfig = {
        duration: 300,
        easing: 'ease-out',
      };

      const optimizedConfig = reducedMotionManager.createOptimizedConfig(baseConfig);
      expect(optimizedConfig.duration).toBe(0);
      expect(optimizedConfig.iterations).toBe(1);
    });
  });

  describe('Animation Manager', () => {
    test('should create and track animations', async () => {
      const animatedValue = new Animated.Value(0);
      const config: AnimationConfig = {
        duration: 200,
        easing: 'ease-out',
      };

      await animationManager.animateValue(animatedValue, 1, config, 'test-animation');
      
      expect(Animated.timing).toHaveBeenCalledWith(
        animatedValue,
        expect.objectContaining({
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      );
    });

    test('should create theme transition animation', async () => {
      const animatedValue = new Animated.Value(1);
      const callback = jest.fn();

      await animationManager.createThemeTransition(animatedValue, callback);
      
      expect(callback).toHaveBeenCalled();
      expect(Animated.timing).toHaveBeenCalledTimes(2); // Fade out and fade in
    });

    test('should create breathing animation for zen mode', () => {
      const animatedValue = new Animated.Value(1);
      
      const breathingAnimation = animationManager.createBreathingAnimation(animatedValue, 0.8, 1.2);
      
      expect(Animated.sequence).toHaveBeenCalled();
      expect(Animated.loop).toHaveBeenCalled();
    });

    test('should create pulse animation', () => {
      const animatedValue = new Animated.Value(1);
      
      const pulseAnimation = animationManager.createPulseAnimation(animatedValue, 1.1);
      
      expect(Animated.timing).toHaveBeenCalled();
      expect(Animated.loop).toHaveBeenCalled();
    });

    test('should stop all animations', () => {
      const mockAnimation = {
        start: jest.fn(),
        stop: jest.fn(),
      };
      
      // Simulate active animation
      (animationManager as any).activeAnimations.set('test', mockAnimation);
      
      animationManager.stopAllAnimations();
      
      expect(mockAnimation.stop).toHaveBeenCalled();
    });

    test('should track performance metrics', () => {
      const metrics = animationManager.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('frameDrops');
      expect(metrics).toHaveProperty('averageFrameTime');
      expect(metrics).toHaveProperty('totalAnimations');
      expect(metrics).toHaveProperty('activeAnimations');
    });
  });

  describe('Animation Utilities', () => {
    test('should create staggered animation', () => {
      const animations = [
        { value: new Animated.Value(0), toValue: 1 },
        { value: new Animated.Value(0), toValue: 1 },
        { value: new Animated.Value(0), toValue: 1 },
      ];

      const staggeredAnimation = createStaggeredAnimation(animations, 100);
      
      expect(Animated.parallel).toHaveBeenCalled();
      expect(Animated.timing).toHaveBeenCalledTimes(3);
    });

    test('should create spring animation', () => {
      const animatedValue = new Animated.Value(0);
      
      const springAnimation = createSpringAnimation(animatedValue, 1, {
        tension: 300,
        friction: 35,
      });
      
      expect(Animated.spring).toHaveBeenCalledWith(
        animatedValue,
        expect.objectContaining({
          toValue: 1,
          tension: 300,
          friction: 35,
          useNativeDriver: true,
        })
      );
    });

    test('should create ripple animation', () => {
      const scaleValue = new Animated.Value(0);
      const opacityValue = new Animated.Value(1);
      
      const rippleAnimation = createRippleAnimation(scaleValue, opacityValue);
      
      expect(Animated.parallel).toHaveBeenCalled();
      expect(Animated.timing).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance Optimization', () => {
    test('should create performance monitor', () => {
      const monitor = getPerformanceMonitor();
      
      expect(monitor).toBeInstanceOf(AnimationPerformanceMonitor);
    });
  });

  describe('Global Animation Manager', () => {
    test('should create global animation manager instance', () => {
      const manager1 = getAnimationManager(performanceSettings);
      const manager2 = getAnimationManager();
      
      expect(manager1).toBe(manager2); // Should return same instance
    });

    test('should update performance settings', () => {
      const manager = getAnimationManager(performanceSettings);
      const newSettings: PerformanceSettings = {
        ...performanceSettings,
        reducedMotion: true,
      };
      
      manager.updatePerformanceSettings(newSettings);
      
      // Test that reduced motion is applied
      const config = manager.createOptimizedConfig({
        duration: 300,
        easing: 'ease-out',
      });
      
      expect(config.duration).toBe(0);
    });
  });
});

describe('Performance Monitoring', () => {
  let monitor: AnimationPerformanceMonitor;

  beforeEach(() => {
    monitor = new AnimationPerformanceMonitor();
  });

  test('should detect device capabilities', () => {
    const capabilities = monitor.getDeviceCapabilities();
    
    expect(capabilities).toHaveProperty('screenDensity');
    expect(capabilities).toHaveProperty('screenSize');
    expect(capabilities).toHaveProperty('platform');
    expect(capabilities).toHaveProperty('isLowEndDevice');
    expect(capabilities).toHaveProperty('supportsHardwareAcceleration');
    expect(capabilities).toHaveProperty('recommendedPerformanceLevel');
  });

  test('should record frame times', () => {
    monitor.recordFrameTime(16.67); // 60fps
    monitor.recordFrameTime(33.33); // 30fps
    monitor.recordFrameTime(50.0);  // 20fps
    
    const metrics = monitor.getMetrics();
    expect(metrics.frameRate).toBeLessThan(60);
    expect(metrics.frameDrops).toBeGreaterThan(0);
  });

  test('should provide performance recommendations', () => {
    // Simulate poor performance
    for (let i = 0; i < 10; i++) {
      monitor.recordFrameTime(50); // Slow frames
    }
    
    const recommendations = monitor.getPerformanceRecommendations();
    
    expect(recommendations.shouldReduceQuality).toBe(true);
    expect(recommendations.recommendations.length).toBeGreaterThan(0);
  });

  test('should start and stop monitoring', () => {
    expect(() => {
      monitor.startMonitoring(100);
      monitor.stopMonitoring();
    }).not.toThrow();
  });
});