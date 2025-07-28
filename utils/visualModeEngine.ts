/**
 * Visual Mode Engine
 * 
 * This module implements the visual mode system architecture, providing
 * configuration structures, mode switching logic, and state management
 * for the enhanced theming system's visual modes.
 */

import {
  VisualMode,
  VisualModeConfig,
  VisualEffect,
  VisualEffectType,
  EffectIntensity,
  PerformanceLevel,
  TimerVisualization,
  AnimationConfig,
} from '../types/theme';

// ============================================================================
// Default Visual Mode Configurations
// ============================================================================

/**
 * Default animation configurations for visual effects
 */
const defaultAnimationConfigs: Record<string, AnimationConfig> = {
  subtle: {
    duration: 2000,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'alternate',
  },
  moderate: {
    duration: 1500,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'alternate',
  },
  prominent: {
    duration: 1000,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'alternate',
  },
};

/**
 * Minimal visual mode configuration - clean, distraction-free
 */
const minimalModeConfig: VisualModeConfig = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean, distraction-free interface focused on essential elements',
  effects: [
    {
      type: 'typography',
      intensity: 'subtle',
      animation: defaultAnimationConfigs.subtle,
      performance: 'high',
      enabled: true,
    },
  ],
  performanceImpact: 'low',
  batteryImpact: 'low',
};

/**
 * Artistic visual mode configuration - subtle patterns and enhanced typography
 */
const artisticModeConfig: VisualModeConfig = {
  id: 'artistic',
  name: 'Artistic',
  description: 'Subtle background patterns and enhanced typography for visual appeal',
  effects: [
    {
      type: 'background',
      intensity: 'subtle',
      animation: defaultAnimationConfigs.subtle,
      performance: 'medium',
      enabled: true,
    },
    {
      type: 'pattern',
      intensity: 'subtle',
      animation: defaultAnimationConfigs.subtle,
      performance: 'medium',
      enabled: true,
    },
    {
      type: 'typography',
      intensity: 'moderate',
      animation: defaultAnimationConfigs.moderate,
      performance: 'medium',
      enabled: true,
    },
    {
      type: 'gradient',
      intensity: 'subtle',
      animation: defaultAnimationConfigs.subtle,
      performance: 'medium',
      enabled: true,
    },
  ],
  performanceImpact: 'medium',
  batteryImpact: 'medium',
};

/**
 * Ambient visual mode configuration - gentle particles and flowing animations
 */
const ambientModeConfig: VisualModeConfig = {
  id: 'ambient',
  name: 'Ambient',
  description: 'Gentle particle effects and flowing animations for immersive experience',
  effects: [
    {
      type: 'particles',
      intensity: 'moderate',
      animation: defaultAnimationConfigs.moderate,
      performance: 'medium',
      enabled: true,
    },
    {
      type: 'background',
      intensity: 'moderate',
      animation: defaultAnimationConfigs.moderate,
      performance: 'medium',
      enabled: true,
    },
    {
      type: 'gradient',
      intensity: 'moderate',
      animation: defaultAnimationConfigs.moderate,
      performance: 'medium',
      enabled: true,
    },
    {
      type: 'typography',
      intensity: 'moderate',
      animation: defaultAnimationConfigs.moderate,
      performance: 'medium',
      enabled: true,
    },
  ],
  performanceImpact: 'high',
  batteryImpact: 'high',
};

/**
 * Default timer visualization configuration
 */
const defaultTimerVisualization: TimerVisualization = {
  digitTransitions: 'fade',
  secondsAnimation: true,
  progressIndicator: 'none',
  elapsedTimeVisualization: false,
  timeBasedGradients: false,
  ambientParticles: false,
  breathingBackground: false,
};

// ============================================================================
// Visual Mode Engine Implementation
// ============================================================================

/**
 * Visual Mode Engine class for managing visual modes and effects
 */
export class VisualModeEngine {
  private currentMode: VisualMode = 'minimal';
  private availableModes: VisualModeConfig[] = [];
  private timerVisualization: TimerVisualization = { ...defaultTimerVisualization };
  private performanceLevel: PerformanceLevel = 'high';

  constructor(initialMode: VisualMode = 'minimal', performanceLevel: PerformanceLevel = 'high') {
    // Initialize with deep copies of default configurations to avoid mutation
    this.availableModes = [
      JSON.parse(JSON.stringify(minimalModeConfig)),
      JSON.parse(JSON.stringify(artisticModeConfig)),
      JSON.parse(JSON.stringify(ambientModeConfig)),
    ];
    
    this.currentMode = initialMode;
    this.performanceLevel = performanceLevel;
    this.optimizeForPerformance(performanceLevel);
  }

  /**
   * Get the current visual mode
   */
  getCurrentMode(): VisualMode {
    return this.currentMode;
  }

  /**
   * Get all available visual modes
   */
  getAvailableModes(): VisualModeConfig[] {
    return [...this.availableModes];
  }

  /**
   * Get the current mode configuration
   */
  getCurrentModeConfig(): VisualModeConfig {
    return this.availableModes.find(mode => mode.id === this.currentMode) || minimalModeConfig;
  }

  /**
   * Switch to a different visual mode
   */
  switchMode(mode: VisualMode): void {
    if (mode !== this.currentMode && this.availableModes.some(m => m.id === mode)) {
      this.currentMode = mode;
      this.updateTimerVisualizationForMode(mode);
    }
  }

  /**
   * Enable a specific visual effect
   */
  enableEffect(effectType: VisualEffectType): void {
    const currentConfig = this.getCurrentModeConfig();
    const effect = currentConfig.effects.find(e => e.type === effectType);
    if (effect) {
      effect.enabled = true;
    }
  }

  /**
   * Disable a specific visual effect
   */
  disableEffect(effectType: VisualEffectType): void {
    const currentConfig = this.getCurrentModeConfig();
    const effect = currentConfig.effects.find(e => e.type === effectType);
    if (effect) {
      effect.enabled = false;
    }
  }

  /**
   * Set the intensity of a specific visual effect
   */
  setEffectIntensity(effectType: VisualEffectType, intensity: EffectIntensity): void {
    const currentConfig = this.getCurrentModeConfig();
    const effect = currentConfig.effects.find(e => e.type === effectType);
    if (effect) {
      effect.intensity = intensity;
      // Update animation configuration based on intensity
      effect.animation = defaultAnimationConfigs[intensity] || defaultAnimationConfigs.subtle;
    }
  }

  /**
   * Get all currently active effects
   */
  getActiveEffects(): VisualEffect[] {
    const currentConfig = this.getCurrentModeConfig();
    return currentConfig.effects.filter(effect => effect.enabled);
  }

  /**
   * Get timer visualization configuration
   */
  getTimerVisualization(): TimerVisualization {
    return { ...this.timerVisualization };
  }

  /**
   * Update timer visualization settings
   */
  updateTimerVisualization(updates: Partial<TimerVisualization>): void {
    this.timerVisualization = { ...this.timerVisualization, ...updates };
  }

  /**
   * Optimize visual effects for performance level
   */
  optimizeForPerformance(level: PerformanceLevel): void {
    this.performanceLevel = level;

    this.availableModes.forEach(mode => {
      mode.effects.forEach(effect => {
        switch (level) {
          case 'low':
            // Disable high-performance effects
            if (effect.performance === 'high' && effect.type === 'particles') {
              effect.enabled = false;
            }
            // Reduce animation duration for better performance
            effect.animation.duration = Math.min(effect.animation.duration, 1000);
            break;

          case 'medium':
            // Enable most effects but with reduced intensity
            if (effect.intensity === 'prominent') {
              effect.intensity = 'moderate';
            }
            break;

          case 'high':
            // Enable all effects at full intensity
            effect.enabled = true;
            break;
        }
      });
    });

    // Update timer visualization based on performance level
    this.updateTimerVisualizationForPerformance(level);
  }

  /**
   * Check if a specific effect is supported at current performance level
   */
  isEffectSupported(effectType: VisualEffectType): boolean {
    const currentConfig = this.getCurrentModeConfig();
    const effect = currentConfig.effects.find(e => e.type === effectType);
    
    if (!effect) return false;

    // Check performance constraints
    switch (this.performanceLevel) {
      case 'low':
        // Particles are not supported on low performance
        if (effectType === 'particles') return false;
        // High performance effects are not supported on low performance
        if (effect.performance === 'high') return false;
        return true;
      case 'medium':
        // Particles with prominent intensity are not supported on medium performance
        if (effectType === 'particles' && effect.intensity === 'prominent') return false;
        return true;
      case 'high':
        return true;
      default:
        return true;
    }
  }

  /**
   * Get performance impact of current configuration
   */
  getPerformanceImpact(): PerformanceLevel {
    const currentConfig = this.getCurrentModeConfig();
    const activeEffects = this.getActiveEffects();
    
    if (activeEffects.length === 0) return 'low';
    
    // For minimal mode, always return low impact
    if (this.currentMode === 'minimal') return 'low';
    
    const hasHighPerformanceEffects = activeEffects.some(effect => 
      effect.performance === 'high' || effect.type === 'particles'
    );
    
    if (hasHighPerformanceEffects) return 'high';
    if (activeEffects.length > 2) return 'medium';
    
    return currentConfig.performanceImpact;
  }

  /**
   * Update timer visualization based on visual mode
   */
  private updateTimerVisualizationForMode(mode: VisualMode): void {
    switch (mode) {
      case 'minimal':
        this.timerVisualization = {
          ...this.timerVisualization,
          digitTransitions: 'fade',
          timeBasedGradients: false,
          ambientParticles: false,
          breathingBackground: false,
        };
        break;

      case 'artistic':
        this.timerVisualization = {
          ...this.timerVisualization,
          digitTransitions: 'slide',
          timeBasedGradients: true,
          ambientParticles: false,
          breathingBackground: true,
        };
        break;

      case 'ambient':
        this.timerVisualization = {
          ...this.timerVisualization,
          digitTransitions: 'scale',
          timeBasedGradients: true,
          ambientParticles: true,
          breathingBackground: true,
        };
        break;
    }
  }

  /**
   * Update timer visualization based on performance level
   */
  private updateTimerVisualizationForPerformance(level: PerformanceLevel): void {
    switch (level) {
      case 'low':
        this.timerVisualization = {
          ...this.timerVisualization,
          secondsAnimation: false,
          ambientParticles: false,
          progressIndicator: 'none',
        };
        break;

      case 'medium':
        this.timerVisualization = {
          ...this.timerVisualization,
          secondsAnimation: true,
          ambientParticles: false,
          progressIndicator: this.currentMode === 'minimal' ? 'none' : 'bar',
        };
        break;

      case 'high':
        this.timerVisualization = {
          ...this.timerVisualization,
          secondsAnimation: true,
          ambientParticles: this.currentMode === 'ambient',
          progressIndicator: this.currentMode === 'minimal' ? 'none' : 'ring',
        };
        break;
    }
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a new visual mode engine instance
 */
export const createVisualModeEngine = (
  initialMode: VisualMode = 'minimal',
  performanceLevel: PerformanceLevel = 'high'
): VisualModeEngine => {
  return new VisualModeEngine(initialMode, performanceLevel);
};

/**
 * Get default configuration for a visual mode
 */
export const getDefaultModeConfig = (mode: VisualMode): VisualModeConfig => {
  switch (mode) {
    case 'minimal':
      return minimalModeConfig;
    case 'artistic':
      return artisticModeConfig;
    case 'ambient':
      return ambientModeConfig;
    default:
      return minimalModeConfig;
  }
};

/**
 * Validate visual mode configuration
 */
export const validateModeConfig = (config: VisualModeConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.id || !['minimal', 'artistic', 'ambient'].includes(config.id)) {
    errors.push('Invalid visual mode ID');
  }

  if (!config.name || config.name.trim().length === 0) {
    errors.push('Visual mode name is required');
  }

  if (!config.description || config.description.trim().length === 0) {
    errors.push('Visual mode description is required');
  }

  if (!Array.isArray(config.effects)) {
    errors.push('Effects must be an array');
  } else {
    config.effects.forEach((effect, index) => {
      if (!effect.type || !['background', 'particles', 'gradient', 'pattern', 'typography'].includes(effect.type)) {
        errors.push(`Invalid effect type at index ${index}`);
      }
      if (!effect.intensity || !['subtle', 'moderate', 'prominent'].includes(effect.intensity)) {
        errors.push(`Invalid effect intensity at index ${index}`);
      }
      if (!effect.performance || !['low', 'medium', 'high'].includes(effect.performance)) {
        errors.push(`Invalid effect performance level at index ${index}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};