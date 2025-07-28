/**
 * Animation Performance Monitoring and Optimization System
 * 
 * This module provides comprehensive performance monitoring for animations,
 * including frame rate tracking, memory usage monitoring, and automatic
 * performance optimization based on device capabilities.
 */

import { Platform, Dimensions, PixelRatio, InteractionManager } from 'react-native';
import { PerformanceLevel, PerformanceSettings } from '../types/theme';

// ============================================================================
// Performance Monitoring Interfaces
// ============================================================================

export interface PerformanceMetrics {
  frameRate: number;
  averageFrameTime: number;
  frameDrops: number;
  memoryUsage: number;
  cpuUsage: number;
  batteryImpact: 'low' | 'medium' | 'high';
  thermalState: 'nominal' | 'fair' | 'serious' | 'critical';
}

export interface DeviceCapabilities {
  screenDensity: number;
  screenSize: { width: number; height: number };
  platform: string;
  platformVersion: string;
  isLowEndDevice: boolean;
  supportsHardwareAcceleration: boolean;
  maxConcurrentAnimations: number;
  recommendedPerformanceLevel: PerformanceLevel;
}

export interface AnimationPerformanceConfig {
  targetFrameRate: number;
  maxFrameDrops: number;
  memoryThreshold: number;
  thermalThrottling: boolean;
  adaptiveQuality: boolean;
  batteryOptimization: boolean;
}

// ============================================================================
// Performance Monitor Class
// ============================================================================

export class AnimationPerformanceMonitor {
  private metrics: PerformanceMetrics;
  private config: AnimationPerformanceConfig;
  private deviceCapabilities: DeviceCapabilities;
  private frameTimeHistory: number[] = [];
  private performanceHistory: PerformanceMetrics[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private performanceCallbacks: Array<(metrics: PerformanceMetrics) => void> = [];

  constructor(config?: Partial<AnimationPerformanceConfig>) {
    this.config = {
      targetFrameRate: 60,
      maxFrameDrops: 5,
      memoryThreshold: 100, // MB
      thermalThrottling: true,
      adaptiveQuality: true,
      batteryOptimization: true,
      ...config,
    };

    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.metrics = this.initializeMetrics();
  }

  /**
   * Initialize performance metrics
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      frameRate: this.config.targetFrameRate,
      averageFrameTime: 1000 / this.config.targetFrameRate,
      frameDrops: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      batteryImpact: 'low',
      thermalState: 'nominal',
    };
  }

  /**
   * Detect device capabilities for performance optimization
   */
  private detectDeviceCapabilities(): DeviceCapabilities {
    const { width, height } = Dimensions.get('window');
    const density = PixelRatio.get();
    const totalPixels = width * height * density;

    // Heuristics for low-end device detection
    const isLowEndDevice = 
      totalPixels < 1000000 || // Less than ~1MP effective resolution
      Platform.OS === 'android' && Platform.Version < 23 ||
      density < 2;

    const maxConcurrentAnimations = isLowEndDevice ? 3 : 8;
    const recommendedPerformanceLevel: PerformanceLevel = 
      isLowEndDevice ? 'low' : totalPixels > 2000000 ? 'high' : 'medium';

    return {
      screenDensity: density,
      screenSize: { width, height },
      platform: Platform.OS,
      platformVersion: Platform.Version.toString(),
      isLowEndDevice,
      supportsHardwareAcceleration: Platform.OS !== 'web',
      maxConcurrentAnimations,
      recommendedPerformanceLevel,
    };
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(intervalMs: number = 1000): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
      this.notifyCallbacks();
    }, intervalMs);
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Record frame time for performance tracking
   */
  recordFrameTime(frameTime: number): void {
    this.frameTimeHistory.push(frameTime);
    
    // Keep only recent history
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }

    // Update frame rate metrics
    this.updateFrameRateMetrics();
  }

  /**
   * Update frame rate metrics based on recorded frame times
   */
  private updateFrameRateMetrics(): void {
    if (this.frameTimeHistory.length === 0) return;

    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    this.metrics.averageFrameTime = sum / this.frameTimeHistory.length;
    this.metrics.frameRate = 1000 / this.metrics.averageFrameTime;

    // Count frame drops
    const targetFrameTime = 1000 / this.config.targetFrameRate;
    const frameDrops = this.frameTimeHistory.filter(
      time => time > targetFrameTime * 1.5
    ).length;
    
    this.metrics.frameDrops = frameDrops;
  }

  /**
   * Update all performance metrics
   */
  private updateMetrics(): void {
    // Update memory usage (platform-specific implementation would be needed)
    this.updateMemoryUsage();
    
    // Update thermal state
    this.updateThermalState();
    
    // Update battery impact
    this.updateBatteryImpact();
    
    // Store metrics history
    this.performanceHistory.push({ ...this.metrics });
    
    // Keep only recent history
    if (this.performanceHistory.length > 60) {
      this.performanceHistory.shift();
    }
  }

  /**
   * Update memory usage metrics
   */
  private updateMemoryUsage(): void {
    // This would require platform-specific implementation
    // For now, we'll use a simplified estimation
    const estimatedUsage = this.frameTimeHistory.length * 0.1; // Rough estimation
    this.metrics.memoryUsage = Math.min(estimatedUsage, 200);
  }

  /**
   * Update thermal state based on performance degradation
   */
  private updateThermalState(): void {
    const recentMetrics = this.performanceHistory.slice(-10);
    if (recentMetrics.length < 5) return;

    const avgFrameRate = recentMetrics.reduce((sum, m) => sum + m.frameRate, 0) / recentMetrics.length;
    const frameRateRatio = avgFrameRate / this.config.targetFrameRate;

    if (frameRateRatio > 0.9) {
      this.metrics.thermalState = 'nominal';
    } else if (frameRateRatio > 0.7) {
      this.metrics.thermalState = 'fair';
    } else if (frameRateRatio > 0.5) {
      this.metrics.thermalState = 'serious';
    } else {
      this.metrics.thermalState = 'critical';
    }
  }

  /**
   * Update battery impact based on animation complexity
   */
  private updateBatteryImpact(): void {
    const frameDropRatio = this.metrics.frameDrops / Math.max(this.frameTimeHistory.length, 1);
    const memoryRatio = this.metrics.memoryUsage / this.config.memoryThreshold;

    if (frameDropRatio < 0.1 && memoryRatio < 0.5) {
      this.metrics.batteryImpact = 'low';
    } else if (frameDropRatio < 0.2 && memoryRatio < 0.8) {
      this.metrics.batteryImpact = 'medium';
    } else {
      this.metrics.batteryImpact = 'high';
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get device capabilities
   */
  getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  /**
   * Get performance recommendations based on current metrics
   */
  getPerformanceRecommendations(): {
    recommendedSettings: Partial<PerformanceSettings>;
    shouldReduceQuality: boolean;
    shouldDisableAnimations: boolean;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let shouldReduceQuality = false;
    let shouldDisableAnimations = false;

    const recommendedSettings: Partial<PerformanceSettings> = {
      frameRateTarget: this.config.targetFrameRate as 30 | 60,
      hardwareAcceleration: this.deviceCapabilities.supportsHardwareAcceleration,
      maxConcurrentAnimations: this.deviceCapabilities.maxConcurrentAnimations,
      performanceLevel: this.deviceCapabilities.recommendedPerformanceLevel,
    };

    // Check frame rate performance
    if (this.metrics.frameRate < this.config.targetFrameRate * 0.8) {
      shouldReduceQuality = true;
      recommendedSettings.performanceLevel = 'medium';
      recommendations.push('Reduce animation quality due to low frame rate');
    }

    // Check frame drops
    if (this.metrics.frameDrops > this.config.maxFrameDrops) {
      shouldReduceQuality = true;
      recommendedSettings.maxConcurrentAnimations = Math.max(
        (recommendedSettings.maxConcurrentAnimations || 5) - 2,
        2
      );
      recommendations.push('Reduce concurrent animations due to frame drops');
    }

    // Check thermal state
    if (this.metrics.thermalState === 'serious' || this.metrics.thermalState === 'critical') {
      shouldReduceQuality = true;
      if (this.metrics.thermalState === 'critical') {
        shouldDisableAnimations = true;
        recommendedSettings.reducedMotion = true;
        recommendations.push('Disable animations due to critical thermal state');
      } else {
        recommendedSettings.performanceLevel = 'low';
        recommendations.push('Reduce animation quality due to thermal throttling');
      }
    }

    // Check memory usage
    if (this.metrics.memoryUsage > this.config.memoryThreshold * 0.8) {
      shouldReduceQuality = true;
      recommendedSettings.performanceLevel = 'low';
      recommendations.push('Reduce animation quality due to high memory usage');
    }

    // Check battery impact
    if (this.metrics.batteryImpact === 'high' && this.config.batteryOptimization) {
      shouldReduceQuality = true;
      recommendedSettings.frameRateTarget = 30;
      recommendations.push('Reduce frame rate target to optimize battery usage');
    }

    return {
      recommendedSettings,
      shouldReduceQuality,
      shouldDisableAnimations,
      recommendations,
    };
  }

  /**
   * Subscribe to performance updates
   */
  onPerformanceUpdate(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.performanceCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.performanceCallbacks.indexOf(callback);
      if (index > -1) {
        this.performanceCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all performance callbacks
   */
  private notifyCallbacks(): void {
    this.performanceCallbacks.forEach(callback => {
      try {
        callback(this.metrics);
      } catch (error) {
        console.warn('Error in performance callback:', error);
      }
    });
  }

  /**
   * Reset performance metrics
   */
  reset(): void {
    this.metrics = this.initializeMetrics();
    this.frameTimeHistory = [];
    this.performanceHistory = [];
  }

  /**
   * Get performance summary for debugging
   */
  getPerformanceSummary(): {
    averageFrameRate: number;
    totalFrameDrops: number;
    peakMemoryUsage: number;
    thermalEvents: number;
    batteryImpactScore: number;
  } {
    const history = this.performanceHistory;
    
    if (history.length === 0) {
      return {
        averageFrameRate: this.config.targetFrameRate,
        totalFrameDrops: 0,
        peakMemoryUsage: 0,
        thermalEvents: 0,
        batteryImpactScore: 0,
      };
    }

    const averageFrameRate = history.reduce((sum, m) => sum + m.frameRate, 0) / history.length;
    const totalFrameDrops = history.reduce((sum, m) => sum + m.frameDrops, 0);
    const peakMemoryUsage = Math.max(...history.map(m => m.memoryUsage));
    const thermalEvents = history.filter(m => m.thermalState !== 'nominal').length;
    
    // Battery impact score (0-100, higher is worse)
    const batteryImpactScore = history.reduce((sum, m) => {
      const score = m.batteryImpact === 'low' ? 0 : m.batteryImpact === 'medium' ? 50 : 100;
      return sum + score;
    }, 0) / history.length;

    return {
      averageFrameRate,
      totalFrameDrops,
      peakMemoryUsage,
      thermalEvents,
      batteryImpactScore,
    };
  }
}

// ============================================================================
// Global Performance Monitor Instance
// ============================================================================

let globalPerformanceMonitor: AnimationPerformanceMonitor | null = null;

/**
 * Get or create global performance monitor instance
 */
export const getPerformanceMonitor = (config?: Partial<AnimationPerformanceConfig>): AnimationPerformanceMonitor => {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new AnimationPerformanceMonitor(config);
  }
  return globalPerformanceMonitor;
};

/**
 * Cleanup global performance monitor
 */
export const cleanupPerformanceMonitor = (): void => {
  if (globalPerformanceMonitor) {
    globalPerformanceMonitor.stopMonitoring();
    globalPerformanceMonitor = null;
  }
};

// ============================================================================
// Performance Optimization Utilities
// ============================================================================

/**
 * Automatically optimize performance settings based on device capabilities
 */
export const getOptimizedPerformanceSettings = (
  currentSettings: PerformanceSettings,
  deviceCapabilities?: DeviceCapabilities
): PerformanceSettings => {
  const capabilities = deviceCapabilities || getPerformanceMonitor().getDeviceCapabilities();
  
  return {
    ...currentSettings,
    performanceLevel: capabilities.recommendedPerformanceLevel,
    maxConcurrentAnimations: capabilities.maxConcurrentAnimations,
    hardwareAcceleration: capabilities.supportsHardwareAcceleration,
    frameRateTarget: capabilities.isLowEndDevice ? 30 : 60,
  };
};

/**
 * Check if reduced motion should be enabled based on performance
 */
export const shouldEnableReducedMotion = (metrics: PerformanceMetrics): boolean => {
  return (
    metrics.frameRate < 30 ||
    metrics.frameDrops > 10 ||
    metrics.thermalState === 'critical' ||
    metrics.batteryImpact === 'high'
  );
};

/**
 * Get animation quality level based on performance metrics
 */
export const getAnimationQualityLevel = (metrics: PerformanceMetrics): PerformanceLevel => {
  if (metrics.frameRate < 30 || metrics.thermalState === 'critical') {
    return 'low';
  } else if (metrics.frameRate < 45 || metrics.thermalState === 'serious') {
    return 'medium';
  } else {
    return 'high';
  }
};

// ============================================================================
// Hardware Acceleration Utilities
// ============================================================================

/**
 * Properties that can be hardware accelerated
 */
export const HARDWARE_ACCELERATED_PROPERTIES = [
  'opacity',
  'transform',
  'translateX',
  'translateY',
  'scale',
  'scaleX',
  'scaleY',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
];

/**
 * Properties that cannot be hardware accelerated
 */
export const NON_HARDWARE_ACCELERATED_PROPERTIES = [
  'width',
  'height',
  'backgroundColor',
  'borderRadius',
  'borderWidth',
  'margin',
  'padding',
  'left',
  'top',
  'right',
  'bottom',
];

/**
 * Check if a property can be hardware accelerated
 */
export const canUseHardwareAcceleration = (property: string): boolean => {
  return HARDWARE_ACCELERATED_PROPERTIES.includes(property);
};

/**
 * Optimize animation properties for hardware acceleration
 */
export const optimizeForHardwareAcceleration = (animationProps: Record<string, any>): {
  optimizedProps: Record<string, any>;
  useNativeDriver: boolean;
  warnings: string[];
} => {
  const optimizedProps: Record<string, any> = {};
  const warnings: string[] = [];
  let useNativeDriver = true;

  for (const [key, value] of Object.entries(animationProps)) {
    if (canUseHardwareAcceleration(key)) {
      optimizedProps[key] = value;
    } else {
      optimizedProps[key] = value;
      useNativeDriver = false;
      warnings.push(`Property '${key}' cannot be hardware accelerated`);
    }
  }

  return {
    optimizedProps,
    useNativeDriver: useNativeDriver && Platform.OS !== 'web',
    warnings,
  };
};

/**
 * Hardware acceleration manager for optimizing animations
 */
export class HardwareAccelerationManager {
  private isSupported: boolean;
  private enabledProperties: Set<string> = new Set();
  private performanceImpact: Map<string, number> = new Map();

  constructor() {
    this.isSupported = this.detectHardwareAccelerationSupport();
    this.initializePerformanceImpact();
  }

  /**
   * Detect if hardware acceleration is supported
   */
  private detectHardwareAccelerationSupport(): boolean {
    if (Platform.OS === 'web') {
      return false; // Web doesn't support native driver
    }

    // Check for specific platform capabilities
    if (Platform.OS === 'ios') {
      return true; // iOS generally supports hardware acceleration
    }

    if (Platform.OS === 'android') {
      // Android support depends on API level and hardware
      return Platform.Version >= 16;
    }

    return false;
  }

  /**
   * Initialize performance impact scores for different properties
   */
  private initializePerformanceImpact(): void {
    // Lower scores = better performance
    this.performanceImpact.set('opacity', 1);
    this.performanceImpact.set('transform', 2);
    this.performanceImpact.set('translateX', 1);
    this.performanceImpact.set('translateY', 1);
    this.performanceImpact.set('scale', 2);
    this.performanceImpact.set('rotate', 3);
    this.performanceImpact.set('backgroundColor', 8);
    this.performanceImpact.set('width', 10);
    this.performanceImpact.set('height', 10);
  }

  /**
   * Enable hardware acceleration for specific properties
   */
  enableForProperties(properties: string[]): void {
    properties.forEach(prop => {
      if (canUseHardwareAcceleration(prop)) {
        this.enabledProperties.add(prop);
      }
    });
  }

  /**
   * Disable hardware acceleration for specific properties
   */
  disableForProperties(properties: string[]): void {
    properties.forEach(prop => {
      this.enabledProperties.delete(prop);
    });
  }

  /**
   * Check if hardware acceleration is enabled for a property
   */
  isEnabledForProperty(property: string): boolean {
    return this.isSupported && 
           this.enabledProperties.has(property) && 
           canUseHardwareAcceleration(property);
  }

  /**
   * Get performance score for an animation configuration
   */
  getPerformanceScore(animationProps: Record<string, any>): number {
    let totalScore = 0;
    let propertyCount = 0;

    for (const property of Object.keys(animationProps)) {
      const impact = this.performanceImpact.get(property) || 5;
      const accelerated = this.isEnabledForProperty(property);
      
      // Hardware accelerated properties have lower impact
      totalScore += accelerated ? impact * 0.3 : impact;
      propertyCount++;
    }

    return propertyCount > 0 ? totalScore / propertyCount : 0;
  }

  /**
   * Optimize animation configuration for best performance
   */
  optimizeAnimation(animationProps: Record<string, any>): {
    optimizedProps: Record<string, any>;
    useNativeDriver: boolean;
    performanceScore: number;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    const optimizedProps: Record<string, any> = {};
    let useNativeDriver = this.isSupported;

    // Separate hardware-accelerated and non-accelerated properties
    const acceleratedProps: Record<string, any> = {};
    const nonAcceleratedProps: Record<string, any> = {};

    for (const [key, value] of Object.entries(animationProps)) {
      if (this.isEnabledForProperty(key)) {
        acceleratedProps[key] = value;
        optimizedProps[key] = value;
      } else {
        nonAcceleratedProps[key] = value;
        optimizedProps[key] = value;
        
        if (canUseHardwareAcceleration(key)) {
          recommendations.push(`Enable hardware acceleration for '${key}' property`);
        } else {
          useNativeDriver = false;
          recommendations.push(`Consider alternative approach for '${key}' property (not hardware accelerated)`);
        }
      }
    }

    // Calculate performance score
    const performanceScore = this.getPerformanceScore(animationProps);

    // Add general recommendations based on performance score
    if (performanceScore > 7) {
      recommendations.push('Consider reducing animation complexity for better performance');
    }

    if (Object.keys(nonAcceleratedProps).length > 0 && this.isSupported) {
      recommendations.push('Split animation into hardware-accelerated and layout animations');
    }

    return {
      optimizedProps,
      useNativeDriver,
      performanceScore,
      recommendations,
    };
  }

  /**
   * Get hardware acceleration status
   */
  getStatus(): {
    isSupported: boolean;
    enabledProperties: string[];
    platform: string;
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    if (!this.isSupported) {
      recommendations.push('Hardware acceleration not supported on this platform');
    } else if (this.enabledProperties.size === 0) {
      recommendations.push('Enable hardware acceleration for transform and opacity properties');
    }

    return {
      isSupported: this.isSupported,
      enabledProperties: Array.from(this.enabledProperties),
      platform: Platform.OS,
      recommendations,
    };
  }
}

// ============================================================================
// Performance Optimization Strategies
// ============================================================================

/**
 * Interaction-based performance optimization
 */
export class InteractionOptimizer {
  private activeInteractions: Set<string> = new Set();
  private deferredAnimations: Array<() => void> = [];

  /**
   * Start an interaction (e.g., user touch, scroll)
   */
  startInteraction(interactionId: string): void {
    this.activeInteractions.add(interactionId);
  }

  /**
   * End an interaction
   */
  endInteraction(interactionId: string): void {
    this.activeInteractions.delete(interactionId);
    
    // Run deferred animations if no active interactions
    if (this.activeInteractions.size === 0) {
      this.runDeferredAnimations();
    }
  }

  /**
   * Defer animation until interactions complete
   */
  deferAnimation(animationFn: () => void): void {
    if (this.activeInteractions.size > 0) {
      this.deferredAnimations.push(animationFn);
    } else {
      // Run immediately if no active interactions
      InteractionManager.runAfterInteractions(animationFn);
    }
  }

  /**
   * Run all deferred animations
   */
  private runDeferredAnimations(): void {
    const animations = [...this.deferredAnimations];
    this.deferredAnimations = [];
    
    animations.forEach(animationFn => {
      InteractionManager.runAfterInteractions(animationFn);
    });
  }

  /**
   * Check if interactions are active
   */
  hasActiveInteractions(): boolean {
    return this.activeInteractions.size > 0;
  }

  /**
   * Get active interaction count
   */
  getActiveInteractionCount(): number {
    return this.activeInteractions.size;
  }
}

// ============================================================================
// Global Instances
// ============================================================================

let globalHardwareAccelerationManager: HardwareAccelerationManager | null = null;
let globalInteractionOptimizer: InteractionOptimizer | null = null;

/**
 * Get global hardware acceleration manager
 */
export const getHardwareAccelerationManager = (): HardwareAccelerationManager => {
  if (!globalHardwareAccelerationManager) {
    globalHardwareAccelerationManager = new HardwareAccelerationManager();
    
    // Enable common properties by default
    globalHardwareAccelerationManager.enableForProperties([
      'opacity',
      'transform',
      'translateX',
      'translateY',
      'scale',
      'rotate',
    ]);
  }
  
  return globalHardwareAccelerationManager;
};

/**
 * Get global interaction optimizer
 */
export const getInteractionOptimizer = (): InteractionOptimizer => {
  if (!globalInteractionOptimizer) {
    globalInteractionOptimizer = new InteractionOptimizer();
  }
  
  return globalInteractionOptimizer;
};

/**
 * Cleanup global instances
 */
export const cleanupPerformanceOptimizers = (): void => {
  globalHardwareAccelerationManager = null;
  globalInteractionOptimizer = null;
};

// ============================================================================
// 60fps Maintenance Utilities
// ============================================================================

/**
 * Frame rate monitor for maintaining 60fps
 */
export class FrameRateMonitor {
  private targetFrameRate: number = 60;
  private frameTimeHistory: number[] = [];
  private lastFrameTime: number = 0;
  private isMonitoring: boolean = false;
  private frameCallback: number | null = null;
  private onFrameDropCallback?: (droppedFrames: number) => void;

  constructor(targetFrameRate: number = 60) {
    this.targetFrameRate = targetFrameRate;
  }

  /**
   * Start monitoring frame rate
   */
  startMonitoring(onFrameDrop?: (droppedFrames: number) => void): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.onFrameDropCallback = onFrameDrop;
    this.lastFrameTime = Date.now();
    
    this.scheduleNextFrame();
  }

  /**
   * Stop monitoring frame rate
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.frameCallback) {
      cancelAnimationFrame(this.frameCallback);
      this.frameCallback = null;
    }
  }

  /**
   * Schedule next frame measurement
   */
  private scheduleNextFrame(): void {
    if (!this.isMonitoring) return;

    this.frameCallback = requestAnimationFrame(() => {
      this.measureFrame();
      this.scheduleNextFrame();
    });
  }

  /**
   * Measure current frame performance
   */
  private measureFrame(): void {
    const currentTime = Date.now();
    const frameTime = currentTime - this.lastFrameTime;
    
    this.frameTimeHistory.push(frameTime);
    
    // Keep only recent history
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }

    // Check for frame drops
    const targetFrameTime = 1000 / this.targetFrameRate;
    if (frameTime > targetFrameTime * 1.5) {
      const droppedFrames = Math.floor(frameTime / targetFrameTime) - 1;
      this.onFrameDropCallback?.(droppedFrames);
    }

    this.lastFrameTime = currentTime;
  }

  /**
   * Get current frame rate
   */
  getCurrentFrameRate(): number {
    if (this.frameTimeHistory.length === 0) return this.targetFrameRate;

    const averageFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
    return 1000 / averageFrameTime;
  }

  /**
   * Get frame drop percentage
   */
  getFrameDropPercentage(): number {
    if (this.frameTimeHistory.length === 0) return 0;

    const targetFrameTime = 1000 / this.targetFrameRate;
    const droppedFrames = this.frameTimeHistory.filter(time => time > targetFrameTime * 1.5).length;
    
    return (droppedFrames / this.frameTimeHistory.length) * 100;
  }
}

/**
 * Global frame rate monitor instance
 */
let globalFrameRateMonitor: FrameRateMonitor | null = null;

/**
 * Get global frame rate monitor
 */
export const getFrameRateMonitor = (targetFrameRate?: number): FrameRateMonitor => {
  if (!globalFrameRateMonitor) {
    globalFrameRateMonitor = new FrameRateMonitor(targetFrameRate);
  }
  
  return globalFrameRateMonitor;
};

/**
 * Cleanup frame rate monitor
 */
export const cleanupFrameRateMonitor = (): void => {
  if (globalFrameRateMonitor) {
    globalFrameRateMonitor.stopMonitoring();
    globalFrameRateMonitor = null;
  }
};