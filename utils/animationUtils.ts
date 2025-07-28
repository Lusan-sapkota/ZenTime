/**
 * Animation Configuration and Management System
 * 
 * This module provides comprehensive animation utilities for the enhanced theming system,
 * including smooth theme transitions, performance monitoring, and animation optimization.
 */

import { Animated, Easing, Platform } from 'react-native';
import {
  AnimationConfig,
  EasingCurve,
  AnimationDirection,
  PerformanceLevel,
  PerformanceSettings
} from '../types/theme';
import {
  getHardwareAccelerationManager,
  getInteractionOptimizer,
  getFrameRateMonitor,
  optimizeForHardwareAcceleration,
} from './animationPerformance';

// ============================================================================
// Animation Configuration Constants
// ============================================================================

/**
 * Default animation configurations for different types of animations
 */
export const DEFAULT_ANIMATIONS: Record<string, AnimationConfig> = {
  // Theme transition animations
  colorTransition: {
    duration: 300,
    easing: 'ease-out',
    fillMode: 'forwards',
  },
  elevationTransition: {
    duration: 200,
    easing: 'ease-in-out',
    fillMode: 'forwards',
  },
  
  // Zen mode animations
  breathingCycle: {
    duration: 4000,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'alternate',
  },
  pulseEffect: {
    duration: 2000,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'alternate',
  },
  fadeTransitions: {
    duration: 250,
    easing: 'ease-out',
    fillMode: 'forwards',
  },
  
  // Timer visualizations
  digitTransition: {
    duration: 150,
    easing: 'ease-out',
    fillMode: 'forwards',
  },
  progressAnimation: {
    duration: 1000,
    easing: 'linear',
    fillMode: 'forwards',
  },
  
  // UI interactions
  rippleEffect: {
    duration: 300,
    easing: 'ease-out',
    fillMode: 'forwards',
  },
  scalePress: {
    duration: 100,
    easing: 'ease-out',
    fillMode: 'forwards',
  },
};

/**
 * Performance-optimized animation configurations
 */
export const PERFORMANCE_ANIMATIONS: Record<PerformanceLevel, Partial<AnimationConfig>> = {
  low: {
    duration: 0,
    iterations: 1,
  },
  medium: {
    duration: 150,
  },
  high: {
    // Use default durations
  },
};

// ============================================================================
// Easing Functions
// ============================================================================

/**
 * Convert easing curve string to React Native Easing function
 */
export const getEasingFunction = (curve: EasingCurve): any => {
  switch (curve) {
    case 'linear':
      return Easing.linear;
    case 'ease':
      return Easing.ease;
    case 'ease-in':
      return Easing.in(Easing.ease);
    case 'ease-out':
      return Easing.out(Easing.ease);
    case 'ease-in-out':
      return Easing.inOut(Easing.ease);
    case 'cubic-bezier':
      // Default cubic-bezier equivalent to ease-in-out
      return Easing.bezier(0.25, 0.1, 0.25, 1);
    default:
      return Easing.ease;
  }
};

/**
 * Material Design easing curves
 */
export const MATERIAL_EASING = {
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),
  sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
};

// ============================================================================
// Animation Manager Class
// ============================================================================

/**
 * Animation performance monitoring interface
 */
interface AnimationPerformanceMetrics {
  frameDrops: number;
  averageFrameTime: number;
  totalAnimations: number;
  activeAnimations: number;
  memoryUsage: number;
}

/**
 * Animation manager for handling complex animation sequences and performance monitoring
 */
export class AnimationManager {
  private activeAnimations: Map<string, Animated.CompositeAnimation> = new Map();
  private performanceMetrics: AnimationPerformanceMetrics = {
    frameDrops: 0,
    averageFrameTime: 16.67, // 60fps target
    totalAnimations: 0,
    activeAnimations: 0,
    memoryUsage: 0,
  };
  private performanceSettings: PerformanceSettings;
  private frameTimeHistory: number[] = [];
  private maxHistorySize = 60; // Track last 60 frames

  constructor(performanceSettings: PerformanceSettings) {
    this.performanceSettings = performanceSettings;
    
    // Initialize hardware acceleration and performance monitoring
    this.initializePerformanceOptimization();
  }

  /**
   * Initialize performance optimization systems
   */
  private initializePerformanceOptimization(): void {
    const hardwareManager = getHardwareAccelerationManager();
    const frameMonitor = getFrameRateMonitor(this.performanceSettings.frameRateTarget);
    
    // Start frame rate monitoring with frame drop callback
    frameMonitor.startMonitoring((droppedFrames) => {
      this.performanceMetrics.frameDrops += droppedFrames;
      
      // Auto-adjust performance if too many frame drops
      if (droppedFrames > 3) {
        this.handlePerformanceDegradation();
      }
    });
  }

  /**
   * Handle performance degradation by reducing animation quality
   */
  private handlePerformanceDegradation(): void {
    // Reduce concurrent animations
    if (this.performanceSettings.maxConcurrentAnimations > 2) {
      this.performanceSettings = {
        ...this.performanceSettings,
        maxConcurrentAnimations: Math.max(this.performanceSettings.maxConcurrentAnimations - 1, 2),
      };
    }
    
    // Consider enabling reduced motion if performance is critical
    const frameMonitor = getFrameRateMonitor();
    if (frameMonitor.getFrameDropPercentage() > 20) {
      this.performanceSettings = {
        ...this.performanceSettings,
        reducedMotion: true,
      };
    }
  }

  /**
   * Update performance settings
   */
  updatePerformanceSettings(settings: PerformanceSettings): void {
    this.performanceSettings = settings;
  }

  /**
   * Create an optimized animation configuration based on performance settings
   */
  createOptimizedConfig(baseConfig: AnimationConfig): AnimationConfig {
    const performanceOverrides = PERFORMANCE_ANIMATIONS[this.performanceSettings.performanceLevel];
    
    let optimizedConfig = { ...baseConfig, ...performanceOverrides };

    // Apply reduced motion settings
    if (this.performanceSettings.reducedMotion) {
      optimizedConfig = {
        ...optimizedConfig,
        duration: 0,
        iterations: 1,
      };
    }

    // Limit concurrent animations
    if (this.activeAnimations.size >= this.performanceSettings.maxConcurrentAnimations) {
      optimizedConfig = {
        ...optimizedConfig,
        duration: Math.min(optimizedConfig.duration || 0, 100),
      };
    }

    return optimizedConfig;
  }

  /**
   * Create and start an animated value transition with hardware acceleration optimization
   */
  animateValue(
    animatedValue: Animated.Value,
    toValue: number,
    config: AnimationConfig,
    animationId?: string,
    animationProps?: Record<string, any>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const optimizedConfig = this.createOptimizedConfig(config);
      const id = animationId || `animation_${Date.now()}_${Math.random()}`;

      // Stop existing animation with same ID
      if (this.activeAnimations.has(id)) {
        this.activeAnimations.get(id)?.stop();
        this.activeAnimations.delete(id);
      }

      // Optimize for hardware acceleration if properties are provided
      let useNativeDriver = this.performanceSettings.hardwareAcceleration && this.canUseNativeDriver(config);
      
      if (animationProps && this.performanceSettings.hardwareAcceleration) {
        const hardwareManager = getHardwareAccelerationManager();
        const optimization = hardwareManager.optimizeAnimation(animationProps);
        useNativeDriver = optimization.useNativeDriver;
        
        // Log performance recommendations in development
        if (__DEV__ && optimization.recommendations.length > 0) {
          console.log('Animation optimization recommendations:', optimization.recommendations);
        }
      }

      // Use interaction optimizer to defer non-critical animations
      const interactionOptimizer = getInteractionOptimizer();
      const executeAnimation = () => {
        const animation = Animated.timing(animatedValue, {
          toValue,
          duration: optimizedConfig.duration,
          easing: getEasingFunction(optimizedConfig.easing),
          delay: optimizedConfig.delay || 0,
          useNativeDriver,
        });

        // Handle iterations
        let finalAnimation: Animated.CompositeAnimation = animation;
        if (optimizedConfig.iterations && optimizedConfig.iterations !== 1) {
          if (optimizedConfig.iterations === 'infinite') {
            finalAnimation = Animated.loop(animation, { iterations: -1 });
          } else {
            finalAnimation = Animated.loop(animation, { iterations: optimizedConfig.iterations });
          }
        }

        // Track animation
        this.activeAnimations.set(id, finalAnimation);
        this.performanceMetrics.totalAnimations++;
        this.performanceMetrics.activeAnimations = this.activeAnimations.size;

        // Start animation with performance monitoring
        const startTime = Date.now();
        finalAnimation.start((finished) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Update performance metrics
          this.updateFrameTimeHistory(duration);
          this.activeAnimations.delete(id);
          this.performanceMetrics.activeAnimations = this.activeAnimations.size;

          if (finished) {
            resolve();
          } else {
            reject(new Error('Animation was interrupted'));
          }
        });
      };

      // Defer animation if there are active interactions (for better performance)
      if (interactionOptimizer.hasActiveInteractions() && !this.isEssentialAnimation(id)) {
        interactionOptimizer.deferAnimation(executeAnimation);
      } else {
        executeAnimation();
      }
    });
  }

  /**
   * Check if animation is essential and should not be deferred
   */
  private isEssentialAnimation(animationId: string): boolean {
    return animationId.includes('theme_transition') || 
           animationId.includes('essential') ||
           animationId.includes('loading');
  }

  /**
   * Create a smooth theme transition animation
   */
  createThemeTransition(
    animatedValue: Animated.Value,
    callback: () => void,
    config?: Partial<AnimationConfig>
  ): Promise<void> {
    const transitionConfig = this.createOptimizedConfig({
      ...DEFAULT_ANIMATIONS.colorTransition,
      ...config,
    });

    return new Promise((resolve) => {
      // Fade out
      this.animateValue(animatedValue, 0, {
        ...transitionConfig,
        duration: transitionConfig.duration / 2,
      }, 'theme_transition_out').then(() => {
        // Apply theme change
        callback();

        // Fade in
        this.animateValue(animatedValue, 1, {
          ...transitionConfig,
          duration: transitionConfig.duration / 2,
        }, 'theme_transition_in').then(resolve);
      });
    });
  }

  /**
   * Create a breathing animation for zen mode
   */
  createBreathingAnimation(
    animatedValue: Animated.Value,
    minValue: number = 0.8,
    maxValue: number = 1.0
  ): Animated.CompositeAnimation {
    const config = this.createOptimizedConfig(DEFAULT_ANIMATIONS.breathingCycle);
    
    const breatheIn = Animated.timing(animatedValue, {
      toValue: maxValue,
      duration: config.duration / 2,
      easing: getEasingFunction(config.easing),
      useNativeDriver: this.performanceSettings.hardwareAcceleration,
    });

    const breatheOut = Animated.timing(animatedValue, {
      toValue: minValue,
      duration: config.duration / 2,
      easing: getEasingFunction(config.easing),
      useNativeDriver: this.performanceSettings.hardwareAcceleration,
    });

    const sequence = Animated.sequence([breatheIn, breatheOut]);
    return Animated.loop(sequence, { iterations: -1 });
  }

  /**
   * Create a pulse animation effect
   */
  createPulseAnimation(
    animatedValue: Animated.Value,
    pulseScale: number = 1.1
  ): Animated.CompositeAnimation {
    const config = this.createOptimizedConfig(DEFAULT_ANIMATIONS.pulseEffect);
    
    const animation = Animated.timing(animatedValue, {
      toValue: pulseScale,
      duration: config.duration,
      easing: getEasingFunction(config.easing),
      useNativeDriver: this.performanceSettings.hardwareAcceleration,
    });

    return Animated.loop(animation, { 
      iterations: -1,
      resetBeforeIteration: true,
    });
  }

  /**
   * Create a digit transition animation for timer displays
   */
  createDigitTransition(
    animatedValue: Animated.Value,
    transitionType: 'flip' | 'slide' | 'fade' | 'scale' = 'fade'
  ): Promise<void> {
    const config = this.createOptimizedConfig(DEFAULT_ANIMATIONS.digitTransition);
    
    switch (transitionType) {
      case 'flip':
        return this.animateValue(animatedValue, 1, {
          ...config,
          easing: 'ease-in-out',
        });
      case 'slide':
        return this.animateValue(animatedValue, 1, {
          ...config,
          easing: 'ease-out',
        });
      case 'scale':
        return this.animateValue(animatedValue, 1.1, {
          ...config,
          duration: config.duration / 2,
        }).then(() => 
          this.animateValue(animatedValue, 1, {
            ...config,
            duration: config.duration / 2,
          })
        );
      case 'fade':
      default:
        return this.animateValue(animatedValue, 0, {
          ...config,
          duration: config.duration / 2,
        }).then(() => 
          this.animateValue(animatedValue, 1, {
            ...config,
            duration: config.duration / 2,
          })
        );
    }
  }

  /**
   * Stop all animations
   */
  stopAllAnimations(): void {
    this.activeAnimations.forEach((animation) => {
      animation.stop();
    });
    this.activeAnimations.clear();
    this.performanceMetrics.activeAnimations = 0;
  }

  /**
   * Stop specific animation by ID
   */
  stopAnimation(animationId: string): void {
    const animation = this.activeAnimations.get(animationId);
    if (animation) {
      animation.stop();
      this.activeAnimations.delete(animationId);
      this.performanceMetrics.activeAnimations = this.activeAnimations.size;
    }
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): AnimationPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Check if native driver can be used for the animation
   */
  private canUseNativeDriver(config: AnimationConfig): boolean {
    // Native driver doesn't support all animation types
    // Avoid for layout-affecting animations
    return this.performanceSettings.hardwareAcceleration && Platform.OS !== 'web';
  }

  /**
   * Update frame time history for performance monitoring
   */
  private updateFrameTimeHistory(frameTime: number): void {
    this.frameTimeHistory.push(frameTime);
    
    if (this.frameTimeHistory.length > this.maxHistorySize) {
      this.frameTimeHistory.shift();
    }

    // Calculate average frame time
    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    this.performanceMetrics.averageFrameTime = sum / this.frameTimeHistory.length;

    // Count frame drops (frames taking longer than target)
    const targetFrameTime = 1000 / this.performanceSettings.frameRateTarget;
    if (frameTime > targetFrameTime * 1.5) {
      this.performanceMetrics.frameDrops++;
    }
  }
}

// ============================================================================
// Animation Utility Functions
// ============================================================================

/**
 * Create a staggered animation sequence
 */
export const createStaggeredAnimation = (
  animations: Array<{ value: Animated.Value; toValue: number; config?: Partial<AnimationConfig> }>,
  staggerDelay: number = 100
): Animated.CompositeAnimation => {
  const animatedSequence = animations.map((anim, index) => {
    const config = {
      ...DEFAULT_ANIMATIONS.fadeTransitions,
      ...anim.config,
      delay: index * staggerDelay,
    };

    return Animated.timing(anim.value, {
      toValue: anim.toValue,
      duration: config.duration,
      easing: getEasingFunction(config.easing),
      delay: config.delay,
      useNativeDriver: true,
    });
  });

  return Animated.parallel(animatedSequence);
};

/**
 * Create a spring animation with material design feel
 */
export const createSpringAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  config?: {
    tension?: number;
    friction?: number;
    mass?: number;
  }
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue,
    tension: config?.tension || 300,
    friction: config?.friction || 35,
    mass: config?.mass || 1,
    useNativeDriver: true,
  });
};

/**
 * Create a ripple effect animation
 */
export const createRippleAnimation = (
  scaleValue: Animated.Value,
  opacityValue: Animated.Value
): Animated.CompositeAnimation => {
  const scaleAnimation = Animated.timing(scaleValue, {
    toValue: 1,
    duration: DEFAULT_ANIMATIONS.rippleEffect.duration,
    easing: getEasingFunction(DEFAULT_ANIMATIONS.rippleEffect.easing),
    useNativeDriver: true,
  });

  const opacityAnimation = Animated.timing(opacityValue, {
    toValue: 0,
    duration: DEFAULT_ANIMATIONS.rippleEffect.duration,
    easing: getEasingFunction(DEFAULT_ANIMATIONS.rippleEffect.easing),
    useNativeDriver: true,
  });

  return Animated.parallel([scaleAnimation, opacityAnimation]);
};

/**
 * Interpolate color values for smooth color transitions
 */
export const interpolateColor = (
  animatedValue: Animated.Value,
  inputRange: number[],
  outputRange: string[]
): Animated.AnimatedInterpolation<string> => {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
};

/**
 * Create a global animation manager instance
 */
let globalAnimationManager: AnimationManager | null = null;

export const getAnimationManager = (performanceSettings?: PerformanceSettings): AnimationManager => {
  if (!globalAnimationManager || performanceSettings) {
    const settings = performanceSettings || {
      reducedMotion: false,
      hardwareAcceleration: true,
      maxConcurrentAnimations: 5,
      frameRateTarget: 60,
      performanceLevel: 'high' as PerformanceLevel,
    };
    
    globalAnimationManager = new AnimationManager(settings);
  }
  
  return globalAnimationManager;
};

/**
 * Cleanup animation manager
 */
export const cleanupAnimationManager = (): void => {
  if (globalAnimationManager) {
    globalAnimationManager.stopAllAnimations();
    globalAnimationManager = null;
  }
};