/**
 * Animation Management Hook
 * 
 * This hook provides a comprehensive interface for managing animations
 * with performance monitoring, theme transitions, and optimization.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { Animated } from 'react-native';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import {
  AnimationManager,
  getAnimationManager,
  DEFAULT_ANIMATIONS,
  createStaggeredAnimation,
  createSpringAnimation,
  createRippleAnimation,
} from '../utils/animationUtils';
import {
  AnimationPerformanceMonitor,
  getPerformanceMonitor,
  PerformanceMetrics,
  shouldEnableReducedMotion,
  getAnimationQualityLevel,
} from '../utils/animationPerformance';
import {
  AnimationConfig,
  PerformanceSettings,
  ThemeAnimations,
} from '../types/theme';

// ============================================================================
// Animation Hook Interface
// ============================================================================

export interface UseAnimationsReturn {
  // Animation values
  createAnimatedValue: (initialValue?: number) => Animated.Value;
  
  // Theme transitions
  animateThemeTransition: (callback: () => void, config?: Partial<AnimationConfig>) => Promise<void>;
  
  // Zen mode animations
  createBreathingAnimation: (animatedValue: Animated.Value, minValue?: number, maxValue?: number) => Animated.CompositeAnimation;
  createPulseAnimation: (animatedValue: Animated.Value, pulseScale?: number) => Animated.CompositeAnimation;
  
  // Timer animations
  animateDigitTransition: (animatedValue: Animated.Value, type?: 'flip' | 'slide' | 'fade' | 'scale') => Promise<void>;
  
  // UI animations
  createRipple: (scaleValue: Animated.Value, opacityValue: Animated.Value) => Animated.CompositeAnimation;
  createSpring: (animatedValue: Animated.Value, toValue: number, config?: any) => Animated.CompositeAnimation;
  createStaggered: (animations: Array<{ value: Animated.Value; toValue: number; config?: Partial<AnimationConfig> }>, delay?: number) => Animated.CompositeAnimation;
  
  // Animation control
  stopAllAnimations: () => void;
  stopAnimation: (id: string) => void;
  
  // Performance monitoring
  performanceMetrics: PerformanceMetrics;
  isPerformanceOptimal: boolean;
  
  // Configuration
  getAnimationConfig: (type: keyof ThemeAnimations) => AnimationConfig;
  isReducedMotionEnabled: boolean;
}

// ============================================================================
// Animation Hook Implementation
// ============================================================================

export const useAnimations = (): UseAnimationsReturn => {
  const {
    performanceSettings,
    getAnimationConfig: getThemeAnimationConfig,
    updatePerformanceSettings,
  } = useEnhancedTheme();

  // Animation manager and performance monitor
  const animationManagerRef = useRef<AnimationManager>();
  const performanceMonitorRef = useRef<AnimationPerformanceMonitor>();
  const transitionValueRef = useRef(new Animated.Value(1));

  // Performance state
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    frameRate: 60,
    averageFrameTime: 16.67,
    frameDrops: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    batteryImpact: 'low',
    thermalState: 'nominal',
  });

  const [isPerformanceOptimal, setIsPerformanceOptimal] = useState(true);

  // Initialize animation manager and performance monitor
  useEffect(() => {
    animationManagerRef.current = getAnimationManager(performanceSettings);
    performanceMonitorRef.current = getPerformanceMonitor();

    // Start performance monitoring
    performanceMonitorRef.current.startMonitoring(1000);

    // Subscribe to performance updates
    const unsubscribe = performanceMonitorRef.current.onPerformanceUpdate((metrics) => {
      setPerformanceMetrics(metrics);
      
      // Check if performance is optimal
      const optimal = metrics.frameRate >= 45 && 
                     metrics.frameDrops < 5 && 
                     metrics.thermalState !== 'critical';
      setIsPerformanceOptimal(optimal);

      // Auto-optimize performance settings if needed
      if (!optimal && performanceSettings.performanceLevel !== 'low') {
        const recommendations = performanceMonitorRef.current?.getPerformanceRecommendations();
        if (recommendations?.shouldReduceQuality) {
          updatePerformanceSettings(recommendations.recommendedSettings);
        }
      }
    });

    return () => {
      unsubscribe();
      performanceMonitorRef.current?.stopMonitoring();
    };
  }, [performanceSettings, updatePerformanceSettings]);

  // Update animation manager when performance settings change
  useEffect(() => {
    if (animationManagerRef.current) {
      animationManagerRef.current.updatePerformanceSettings(performanceSettings);
    }
  }, [performanceSettings]);

  // Create animated value with performance tracking
  const createAnimatedValue = useCallback((initialValue: number = 0): Animated.Value => {
    return new Animated.Value(initialValue);
  }, []);

  // Theme transition animation
  const animateThemeTransition = useCallback(
    (callback: () => void, config?: Partial<AnimationConfig>): Promise<void> => {
      if (!animationManagerRef.current) {
        callback();
        return Promise.resolve();
      }

      return animationManagerRef.current.createThemeTransition(
        transitionValueRef.current,
        callback,
        config
      );
    },
    []
  );

  // Zen mode breathing animation
  const createBreathingAnimation = useCallback(
    (animatedValue: Animated.Value, minValue: number = 0.8, maxValue: number = 1.0): Animated.CompositeAnimation => {
      if (!animationManagerRef.current) {
        return Animated.timing(animatedValue, {
          toValue: maxValue,
          duration: 0,
          useNativeDriver: true,
        });
      }

      return animationManagerRef.current.createBreathingAnimation(animatedValue, minValue, maxValue);
    },
    []
  );

  // Zen mode pulse animation
  const createPulseAnimation = useCallback(
    (animatedValue: Animated.Value, pulseScale: number = 1.1): Animated.CompositeAnimation => {
      if (!animationManagerRef.current) {
        return Animated.timing(animatedValue, {
          toValue: pulseScale,
          duration: 0,
          useNativeDriver: true,
        });
      }

      return animationManagerRef.current.createPulseAnimation(animatedValue, pulseScale);
    },
    []
  );

  // Timer digit transition animation
  const animateDigitTransition = useCallback(
    (animatedValue: Animated.Value, type: 'flip' | 'slide' | 'fade' | 'scale' = 'fade'): Promise<void> => {
      if (!animationManagerRef.current) {
        return Promise.resolve();
      }

      return animationManagerRef.current.createDigitTransition(animatedValue, type);
    },
    []
  );

  // UI animation creators
  const createRipple = useCallback(
    (scaleValue: Animated.Value, opacityValue: Animated.Value): Animated.CompositeAnimation => {
      return createRippleAnimation(scaleValue, opacityValue);
    },
    []
  );

  const createSpring = useCallback(
    (animatedValue: Animated.Value, toValue: number, config?: any): Animated.CompositeAnimation => {
      return createSpringAnimation(animatedValue, toValue, config);
    },
    []
  );

  const createStaggered = useCallback(
    (
      animations: Array<{ value: Animated.Value; toValue: number; config?: Partial<AnimationConfig> }>,
      delay: number = 100
    ): Animated.CompositeAnimation => {
      return createStaggeredAnimation(animations, delay);
    },
    []
  );

  // Animation control
  const stopAllAnimations = useCallback(() => {
    animationManagerRef.current?.stopAllAnimations();
  }, []);

  const stopAnimation = useCallback((id: string) => {
    animationManagerRef.current?.stopAnimation(id);
  }, []);

  // Get animation configuration with theme and performance optimizations
  const getAnimationConfig = useCallback(
    (type: keyof ThemeAnimations): AnimationConfig => {
      const themeConfig = getThemeAnimationConfig(type);
      
      // Apply performance optimizations
      if (performanceSettings.reducedMotion) {
        return {
          ...themeConfig,
          duration: 0,
          iterations: 1,
        };
      }

      // Adjust based on performance level
      const performanceMultiplier = performanceSettings.performanceLevel === 'low' ? 0.5 :
                                   performanceSettings.performanceLevel === 'medium' ? 0.75 : 1;

      return {
        ...themeConfig,
        duration: themeConfig.duration * performanceMultiplier,
      };
    },
    [getThemeAnimationConfig, performanceSettings]
  );

  // Check if reduced motion is enabled
  const isReducedMotionEnabled = useCallback((): boolean => {
    return performanceSettings.reducedMotion || shouldEnableReducedMotion(performanceMetrics);
  }, [performanceSettings.reducedMotion, performanceMetrics]);

  return {
    // Animation values
    createAnimatedValue,
    
    // Theme transitions
    animateThemeTransition,
    
    // Zen mode animations
    createBreathingAnimation,
    createPulseAnimation,
    
    // Timer animations
    animateDigitTransition,
    
    // UI animations
    createRipple,
    createSpring,
    createStaggered,
    
    // Animation control
    stopAllAnimations,
    stopAnimation,
    
    // Performance monitoring
    performanceMetrics,
    isPerformanceOptimal,
    
    // Configuration
    getAnimationConfig,
    isReducedMotionEnabled: isReducedMotionEnabled(),
  };
};

// ============================================================================
// Specialized Animation Hooks
// ============================================================================

/**
 * Hook for theme transition animations
 */
export const useThemeTransition = () => {
  const { animateThemeTransition } = useAnimations();
  const transitionValue = useRef(new Animated.Value(1));

  const executeTransition = useCallback(
    (callback: () => void, config?: Partial<AnimationConfig>) => {
      return animateThemeTransition(callback, config);
    },
    [animateThemeTransition]
  );

  return {
    transitionValue: transitionValue.current,
    executeTransition,
  };
};

/**
 * Hook for zen mode animations
 */
export const useZenAnimations = () => {
  const { createBreathingAnimation, createPulseAnimation, isReducedMotionEnabled } = useAnimations();
  
  const breathingValue = useRef(new Animated.Value(1));
  const pulseValue = useRef(new Animated.Value(1));
  const breathingAnimationRef = useRef<Animated.CompositeAnimation>();
  const pulseAnimationRef = useRef<Animated.CompositeAnimation>();

  const startBreathing = useCallback(() => {
    if (isReducedMotionEnabled) return;
    
    breathingAnimationRef.current?.stop();
    breathingAnimationRef.current = createBreathingAnimation(breathingValue.current);
    breathingAnimationRef.current.start();
  }, [createBreathingAnimation, isReducedMotionEnabled]);

  const stopBreathing = useCallback(() => {
    breathingAnimationRef.current?.stop();
  }, []);

  const startPulse = useCallback(() => {
    if (isReducedMotionEnabled) return;
    
    pulseAnimationRef.current?.stop();
    pulseAnimationRef.current = createPulseAnimation(pulseValue.current);
    pulseAnimationRef.current.start();
  }, [createPulseAnimation, isReducedMotionEnabled]);

  const stopPulse = useCallback(() => {
    pulseAnimationRef.current?.stop();
  }, []);

  useEffect(() => {
    return () => {
      stopBreathing();
      stopPulse();
    };
  }, [stopBreathing, stopPulse]);

  return {
    breathingValue: breathingValue.current,
    pulseValue: pulseValue.current,
    startBreathing,
    stopBreathing,
    startPulse,
    stopPulse,
  };
};

/**
 * Hook for timer digit animations
 */
export const useTimerAnimations = () => {
  const { animateDigitTransition, isReducedMotionEnabled } = useAnimations();
  
  const digitValues = useRef({
    hours1: new Animated.Value(1),
    hours2: new Animated.Value(1),
    minutes1: new Animated.Value(1),
    minutes2: new Animated.Value(1),
    seconds1: new Animated.Value(1),
    seconds2: new Animated.Value(1),
  });

  const animateDigitChange = useCallback(
    (digit: keyof typeof digitValues.current, type?: 'flip' | 'slide' | 'fade' | 'scale') => {
      if (isReducedMotionEnabled) return Promise.resolve();
      
      return animateDigitTransition(digitValues.current[digit], type);
    },
    [animateDigitTransition, isReducedMotionEnabled]
  );

  return {
    digitValues: digitValues.current,
    animateDigitChange,
  };
};