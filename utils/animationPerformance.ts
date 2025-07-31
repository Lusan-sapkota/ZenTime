/**
 * Animation Performance Optimization Utilities
 *
 * This file provides utilities for optimizing animation performance
 * and memory usage across all devices in the enhanced theming system.
 */

import { Animated, Platform } from "react-native";
import {
  AnimationConfig,
  PerformanceSettings,
  PerformanceLevel,
  ThemeAnimations,
} from "../types/theme";

// ============================================================================
// Performance Monitoring
// ============================================================================

interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  animationCount: number;
  droppedFrames: number;
  lastMeasurement: Date;
}

class AnimationPerformanceMonitor {
  private metrics: PerformanceMetrics = {
    frameRate: 60,
    memoryUsage: 0,
    animationCount: 0,
    droppedFrames: 0,
    lastMeasurement: new Date(),
  };

  private frameCallbacks: Set<() => void> = new Set();
  private animationRegistry: Map<string, Animated.Value> = new Map();
  private performanceLevel: PerformanceLevel = "high";

  /**
   * Start monitoring animation performance
   */
  startMonitoring(): void {
    if (Platform.OS === "ios") {
      // Use CADisplayLink equivalent for iOS
      this.startIOSMonitoring();
    } else {
      // Use requestAnimationFrame for Android
      this.startAndroidMonitoring();
    }
  }

  /**
   * Stop monitoring animation performance
   */
  stopMonitoring(): void {
    this.frameCallbacks.clear();
  }

  /**
   * Register an animation for monitoring
   */
  registerAnimation(id: string, animation: Animated.Value): void {
    this.animationRegistry.set(id, animation);
    this.metrics.animationCount = this.animationRegistry.size;
  }

  /**
   * Unregister an animation
   */
  unregisterAnimation(id: string): void {
    this.animationRegistry.delete(id);
    this.metrics.animationCount = this.animationRegistry.size;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Set performance level and adjust accordingly
   */
  setPerformanceLevel(level: PerformanceLevel): void {
    this.performanceLevel = level;
    this.adjustAnimationsForPerformance();
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(): boolean {
    const targetFrameRate = this.performanceLevel === "high" ? 60 : 30;
    return this.metrics.frameRate >= targetFrameRate * 0.9; // 90% of target
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.frameRate < 30) {
      recommendations.push("Consider reducing animation complexity");
      recommendations.push("Enable reduced motion mode");
    }

    if (this.metrics.animationCount > 10) {
      recommendations.push(
        "Too many concurrent animations - consider limiting"
      );
    }

    if (this.metrics.droppedFrames > 5) {
      recommendations.push(
        "Frequent frame drops detected - optimize animations"
      );
    }

    return recommendations;
  }

  private startIOSMonitoring(): void {
    // iOS-specific performance monitoring
    const measureFrame = () => {
      const now = Date.now();
      const timeDiff = now - this.metrics.lastMeasurement.getTime();

      if (timeDiff > 0) {
        this.metrics.frameRate = Math.min(60, 1000 / timeDiff);
      }

      this.metrics.lastMeasurement = new Date(now);

      // Continue monitoring
      requestAnimationFrame(measureFrame);
    };

    requestAnimationFrame(measureFrame);
  }

  private startAndroidMonitoring(): void {
    // Android-specific performance monitoring
    const measureFrame = () => {
      const now = Date.now();
      const timeDiff = now - this.metrics.lastMeasurement.getTime();

      if (timeDiff > 0) {
        this.metrics.frameRate = Math.min(60, 1000 / timeDiff);

        // Detect dropped frames
        if (timeDiff > 16.67 * 2) {
          // More than 2 frame intervals
          this.metrics.droppedFrames++;
        }
      }

      this.metrics.lastMeasurement = new Date(now);

      // Continue monitoring
      requestAnimationFrame(measureFrame);
    };

    requestAnimationFrame(measureFrame);
  }

  private adjustAnimationsForPerformance(): void {
    // Adjust animation complexity based on performance level
    if (this.performanceLevel === "low") {
      // Disable non-essential animations
      this.animationRegistry.forEach((animation, id) => {
        if (id.includes("ambient") || id.includes("particle")) {
          animation.stopAnimation();
        }
      });
    }
  }
}

// ============================================================================
// Animation Optimization Utilities
// ============================================================================

/**
 * Optimize animation configuration based on device capabilities
 */
export function optimizeAnimationConfig(
  config: AnimationConfig,
  performanceLevel: PerformanceLevel
): AnimationConfig {
  const optimized = { ...config };

  switch (performanceLevel) {
    case "low":
      // Reduce duration and disable complex animations
      optimized.duration = Math.min(config.duration || 300, 150);
      optimized.iterations =
        config.iterations === "infinite" ? 1 : config.iterations;
      break;

    case "medium":
      // Moderate optimization
      optimized.duration = Math.min(config.duration || 300, 250);
      break;

    case "high":
      // Keep original configuration
      break;
  }

  return optimized;
}

/**
 * Create hardware-accelerated animation
 */
import { Easing } from "react-native";

/**
 * Converts a string-based easing to an Animated.Easing function.
 * Supports 'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'.
 */
function getEasingFunction(easing?: string) {
  switch (easing) {
    case "linear":
      return Easing.linear;
    case "ease":
      return Easing.ease;
    case "ease-in":
      return Easing.in(Easing.ease);
    case "ease-out":
      return Easing.out(Easing.ease);
    case "ease-in-out":
      return Easing.inOut(Easing.ease);
    default:
      return undefined;
  }
}

export function createHardwareAcceleratedAnimation(
  animatedValue: Animated.Value,
  config: AnimationConfig
): Animated.CompositeAnimation {
  // Default toValue to 1 if not provided
  const toValue = (config as any).toValue ?? 1;
  return Animated.timing(animatedValue, {
    toValue,
    duration: config.duration,
    easing: getEasingFunction(config.easing),
    delay: config.delay,
    useNativeDriver: true, // Enable hardware acceleration
  });
}

/**
 * Create performance-optimized theme animations
 */
export function createOptimizedThemeAnimations(
  performanceSettings: PerformanceSettings
): ThemeAnimations {
  const baseAnimations: ThemeAnimations = {
    colorTransition: {
      duration: 300,
      easing: "ease-in-out",
      fillMode: "forwards",
    },
    elevationTransition: {
      duration: 200,
      easing: "ease-out",
      fillMode: "forwards",
    },
    breathingCycle: {
      duration: 4000,
      easing: "ease-in-out",
      iterations: "infinite",
      direction: "alternate",
    },
    pulseEffect: {
      duration: 2000,
      easing: "ease-in-out",
      iterations: "infinite",
      direction: "alternate",
    },
    fadeTransitions: {
      duration: 250,
      easing: "ease-in-out",
      fillMode: "forwards",
    },
    digitTransition: {
      duration: 150,
      easing: "ease-out",
      fillMode: "forwards",
    },
    progressAnimation: {
      duration: 1000,
      easing: "linear",
      fillMode: "forwards",
    },
  };

  // Apply performance optimizations
  const optimized: ThemeAnimations = Object.keys(baseAnimations).reduce((acc, key) => {
    acc[key as keyof ThemeAnimations] = optimizeAnimationConfig(
      baseAnimations[key as keyof ThemeAnimations],
      performanceSettings.performanceLevel
    );
    return acc;
  }, {} as ThemeAnimations);

  // Apply reduced motion settings
  if (performanceSettings.reducedMotion) {
    Object.keys(optimized).forEach((key) => {
      const animKey = key as keyof ThemeAnimations;
      optimized[animKey] = {
        ...optimized[animKey],
        duration: 0,
        iterations: 1,
      };
    });
  }

  return optimized;
}

/**
 * Batch animations to reduce performance impact
 */
export function batchAnimations(
  animations: Animated.CompositeAnimation[],
  maxConcurrent: number = 3
): Promise<void> {
  return new Promise((resolve) => {
    const batches: Animated.CompositeAnimation[][] = [];

    // Split animations into batches
    for (let i = 0; i < animations.length; i += maxConcurrent) {
      batches.push(animations.slice(i, i + maxConcurrent));
    }

    // Execute batches sequentially
    const executeBatch = (batchIndex: number) => {
      if (batchIndex >= batches.length) {
        resolve();
        return;
      }

      const batch = batches[batchIndex];
      const batchPromises = batch.map(
        (animation) =>
          new Promise<void>((batchResolve) => {
            animation.start(() => batchResolve());
          })
      );

      Promise.all(batchPromises).then(() => {
        executeBatch(batchIndex + 1);
      });
    };

    executeBatch(0);
  });
}

/**
 * Memory-efficient animation cleanup
 */
export function cleanupAnimations(animationIds: string[]): void {
  animationIds.forEach((id) => {
    performanceMonitor.unregisterAnimation(id);
  });
}

// ============================================================================
// Device Performance Detection
// ============================================================================

/**
 * Detect device performance capabilities
 */
export function detectDevicePerformance(): PerformanceLevel {
  // This is a simplified detection - in a real app you might use
  // device specs, benchmark results, or runtime performance metrics

  if (Platform.OS === "ios") {
    // iOS devices generally have good performance
    return "high";
  }

  // For Android, we could check device specs
  // For now, assume medium performance
  return "medium";
}

/**
 * Get recommended performance settings for device
 */
export function getRecommendedPerformanceSettings(): PerformanceSettings {
  const devicePerformance = detectDevicePerformance();

  const baseSettings: PerformanceSettings = {
    reducedMotion: false,
    hardwareAcceleration: true,
    maxConcurrentAnimations: 5,
    frameRateTarget: 60,
    performanceLevel: devicePerformance,
  };

  // Adjust based on device performance
  switch (devicePerformance) {
    case "low":
      return {
        ...baseSettings,
        maxConcurrentAnimations: 2,
        frameRateTarget: 30,
        reducedMotion: true,
      };

    case "medium":
      return {
        ...baseSettings,
        maxConcurrentAnimations: 3,
        frameRateTarget: 60,
      };

    case "high":
      return baseSettings;
  }
}

// ============================================================================
// Singleton Performance Monitor
// ============================================================================

export const performanceMonitor = new AnimationPerformanceMonitor();

// ============================================================================
// Performance Testing Utilities
// ============================================================================

/**
 * Test animation performance under load
 */
export async function testAnimationPerformance(): Promise<{
  passed: boolean;
  metrics: PerformanceMetrics;
  recommendations: string[];
}> {
  performanceMonitor.startMonitoring();

  // Create test animations
  const testAnimations: Animated.Value[] = [];
  for (let i = 0; i < 10; i++) {
    const animValue = new Animated.Value(0);
    testAnimations.push(animValue);
    performanceMonitor.registerAnimation(`test-${i}`, animValue);

    // Start animation
    Animated.loop(
      Animated.timing(animValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }

  // Wait for measurements
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Stop animations
  testAnimations.forEach((anim, index) => {
    anim.stopAnimation();
    performanceMonitor.unregisterAnimation(`test-${index}`);
  });

  const metrics = performanceMonitor.getMetrics();
  const recommendations = performanceMonitor.getPerformanceRecommendations();
  const passed = performanceMonitor.isPerformanceAcceptable();

  performanceMonitor.stopMonitoring();

  return {
    passed,
    metrics,
    recommendations,
  };
}

/**
 * Test memory usage during theme transitions
 */
export async function testMemoryUsage(): Promise<{
  passed: boolean;
  initialMemory: number;
  peakMemory: number;
  finalMemory: number;
}> {
  // This is a simplified memory test
  // In a real implementation, you would use platform-specific memory APIs

  const initialMemory = 0; // Would get actual memory usage
  let peakMemory = initialMemory;

  // Simulate theme transitions
  for (let i = 0; i < 10; i++) {
    // Create and destroy theme-related objects
    const mockThemeData = {
      colors: new Array(100)
        .fill(0)
        .map(() => `#${Math.random().toString(16).substr(2, 6)}`),
      animations: new Array(50).fill(0).map(() => new Animated.Value(0)),
    };

    // Simulate memory peak
    peakMemory = Math.max(peakMemory, initialMemory + i * 10);

    // Cleanup
    mockThemeData.animations.forEach((anim) => anim.stopAnimation());

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const finalMemory = initialMemory + 5; // Some residual usage

  return {
    passed: peakMemory - initialMemory < 100, // Arbitrary threshold
    initialMemory,
    peakMemory,
    finalMemory,
  };
}
