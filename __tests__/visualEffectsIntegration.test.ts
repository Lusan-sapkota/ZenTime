/**
 * Visual Effects Integration Tests
 * 
 * Tests for the integration of visual effects with the visual mode engine,
 * focusing on the core functionality without React component testing.
 */

import {
  VisualModeEngine,
  createVisualModeEngine,
} from '../utils/visualModeEngine';
import {
  VisualMode,
  VisualEffectType,
  EffectIntensity,
  PerformanceLevel,
} from '../types/theme';

describe('Visual Effects Integration', () => {
  let engine: VisualModeEngine;

  beforeEach(() => {
    engine = createVisualModeEngine('minimal', 'high');
  });

  describe('Artistic Mode Visual Effects', () => {
    beforeEach(() => {
      engine.switchMode('artistic');
    });

    it('should have background effects in artistic mode', () => {
      const config = engine.getCurrentModeConfig();
      const backgroundEffect = config.effects.find(e => e.type === 'background');
      expect(backgroundEffect).toBeDefined();
      expect(backgroundEffect?.enabled).toBe(true);
    });

    it('should have pattern effects in artistic mode', () => {
      const config = engine.getCurrentModeConfig();
      const patternEffect = config.effects.find(e => e.type === 'pattern');
      expect(patternEffect).toBeDefined();
    });

    it('should have enhanced typography in artistic mode', () => {
      const config = engine.getCurrentModeConfig();
      const typographyEffect = config.effects.find(e => e.type === 'typography');
      expect(typographyEffect).toBeDefined();
      expect(typographyEffect?.intensity).toBe('moderate');
    });

    it('should have gradient effects in artistic mode', () => {
      const config = engine.getCurrentModeConfig();
      const gradientEffect = config.effects.find(e => e.type === 'gradient');
      expect(gradientEffect).toBeDefined();
    });

    it('should update timer visualization for artistic mode', () => {
      const timerViz = engine.getTimerVisualization();
      expect(timerViz.digitTransitions).toBe('slide');
      expect(timerViz.timeBasedGradients).toBe(true);
      expect(timerViz.breathingBackground).toBe(true);
    });

    it('should allow intensity adjustments for artistic effects', () => {
      engine.setEffectIntensity('background', 'prominent');
      const config = engine.getCurrentModeConfig();
      const backgroundEffect = config.effects.find(e => e.type === 'background');
      expect(backgroundEffect?.intensity).toBe('prominent');
    });
  });

  describe('Ambient Mode Visual Effects', () => {
    beforeEach(() => {
      engine.switchMode('ambient');
    });

    it('should have particle effects in ambient mode', () => {
      const config = engine.getCurrentModeConfig();
      const particleEffect = config.effects.find(e => e.type === 'particles');
      expect(particleEffect).toBeDefined();
      expect(particleEffect?.enabled).toBe(true);
    });

    it('should have background effects in ambient mode', () => {
      const config = engine.getCurrentModeConfig();
      const backgroundEffect = config.effects.find(e => e.type === 'background');
      expect(backgroundEffect).toBeDefined();
      expect(backgroundEffect?.intensity).toBe('moderate');
    });

    it('should have gradient effects in ambient mode', () => {
      const config = engine.getCurrentModeConfig();
      const gradientEffect = config.effects.find(e => e.type === 'gradient');
      expect(gradientEffect).toBeDefined();
      expect(gradientEffect?.intensity).toBe('moderate');
    });

    it('should update timer visualization for ambient mode', () => {
      const timerViz = engine.getTimerVisualization();
      expect(timerViz.digitTransitions).toBe('scale');
      expect(timerViz.ambientParticles).toBe(true);
      expect(timerViz.timeBasedGradients).toBe(true);
      expect(timerViz.breathingBackground).toBe(true);
    });

    it('should have higher performance impact than artistic mode', () => {
      const ambientImpact = engine.getPerformanceImpact();
      
      engine.switchMode('artistic');
      const artisticImpact = engine.getPerformanceImpact();
      
      // Ambient mode should have equal or higher performance impact
      const impactLevels = { low: 1, medium: 2, high: 3 };
      expect(impactLevels[ambientImpact]).toBeGreaterThanOrEqual(impactLevels[artisticImpact]);
    });
  });

  describe('Performance Optimization for Visual Effects', () => {
    it('should disable particle effects on low performance', () => {
      engine.switchMode('ambient');
      engine.optimizeForPerformance('low');
      
      expect(engine.isEffectSupported('particles')).toBe(false);
      
      const timerViz = engine.getTimerVisualization();
      expect(timerViz.ambientParticles).toBe(false);
      expect(timerViz.secondsAnimation).toBe(false);
    });

    it('should reduce effect intensity on medium performance', () => {
      engine.switchMode('ambient');
      engine.optimizeForPerformance('medium');
      
      const timerViz = engine.getTimerVisualization();
      expect(timerViz.ambientParticles).toBe(false);
      expect(timerViz.secondsAnimation).toBe(true);
      expect(timerViz.progressIndicator).toBe('bar');
    });

    it('should enable all effects on high performance', () => {
      engine.switchMode('ambient');
      engine.optimizeForPerformance('high');
      
      const timerViz = engine.getTimerVisualization();
      expect(timerViz.ambientParticles).toBe(true);
      expect(timerViz.secondsAnimation).toBe(true);
      expect(timerViz.progressIndicator).toBe('ring');
    });

    it('should adjust animation durations based on performance', () => {
      engine.switchMode('artistic');
      
      // Test low performance optimization
      engine.optimizeForPerformance('low');
      const config = engine.getCurrentModeConfig();
      
      config.effects.forEach(effect => {
        expect(effect.animation.duration).toBeLessThanOrEqual(1000);
      });
    });
  });

  describe('Visual Effect Intensity Controls', () => {
    const effectTypes: VisualEffectType[] = ['background', 'particles', 'gradient', 'pattern', 'typography'];
    const intensityLevels: EffectIntensity[] = ['subtle', 'moderate', 'prominent'];

    it('should support all intensity levels for supported effects', () => {
      engine.switchMode('ambient'); // Mode with all effect types
      
      effectTypes.forEach(effectType => {
        if (engine.isEffectSupported(effectType)) {
          intensityLevels.forEach(intensity => {
            engine.setEffectIntensity(effectType, intensity);
            const config = engine.getCurrentModeConfig();
            const effect = config.effects.find(e => e.type === effectType);
            expect(effect?.intensity).toBe(intensity);
          });
        }
      });
    });

    it('should enable and disable effects correctly', () => {
      engine.switchMode('artistic');
      
      // Test enabling effects
      engine.enableEffect('background');
      let activeEffects = engine.getActiveEffects();
      expect(activeEffects.some(e => e.type === 'background')).toBe(true);
      
      // Test disabling effects
      engine.disableEffect('background');
      activeEffects = engine.getActiveEffects();
      expect(activeEffects.some(e => e.type === 'background')).toBe(false);
    });

    it('should update animation configurations when intensity changes', () => {
      engine.switchMode('artistic');
      
      engine.setEffectIntensity('background', 'subtle');
      let config = engine.getCurrentModeConfig();
      let effect = config.effects.find(e => e.type === 'background');
      const subtleDuration = effect?.animation.duration;
      
      engine.setEffectIntensity('background', 'prominent');
      config = engine.getCurrentModeConfig();
      effect = config.effects.find(e => e.type === 'background');
      const prominentDuration = effect?.animation.duration;
      
      // Prominent effects should have faster animations
      expect(prominentDuration).toBeLessThan(subtleDuration || 0);
    });
  });

  describe('Mode-Specific Effect Configurations', () => {
    it('should have different effect configurations for each mode', () => {
      const minimalConfig = engine.getCurrentModeConfig();
      
      engine.switchMode('artistic');
      const artisticConfig = engine.getCurrentModeConfig();
      
      engine.switchMode('ambient');
      const ambientConfig = engine.getCurrentModeConfig();
      
      // Each mode should have different numbers of effects
      expect(minimalConfig.effects.length).toBeLessThan(artisticConfig.effects.length);
      expect(artisticConfig.effects.length).toBeLessThanOrEqual(ambientConfig.effects.length);
      
      // Ambient mode should have particle effects, others should not
      expect(ambientConfig.effects.some(e => e.type === 'particles')).toBe(true);
      expect(artisticConfig.effects.some(e => e.type === 'particles')).toBe(false);
      expect(minimalConfig.effects.some(e => e.type === 'particles')).toBe(false);
    });

    it('should have appropriate performance impacts for each mode', () => {
      engine.switchMode('minimal');
      const minimalImpact = engine.getPerformanceImpact();
      
      engine.switchMode('artistic');
      const artisticImpact = engine.getPerformanceImpact();
      
      engine.switchMode('ambient');
      const ambientImpact = engine.getPerformanceImpact();
      
      expect(minimalImpact).toBe('low');
      expect(['medium', 'high']).toContain(artisticImpact);
      expect(['medium', 'high']).toContain(ambientImpact);
    });
  });

  describe('Timer Visualization Integration', () => {
    it('should provide different timer visualizations for each mode', () => {
      engine.switchMode('minimal');
      const minimalViz = engine.getTimerVisualization();
      
      engine.switchMode('artistic');
      const artisticViz = engine.getTimerVisualization();
      
      engine.switchMode('ambient');
      const ambientViz = engine.getTimerVisualization();
      
      // Each mode should have different digit transitions
      expect(minimalViz.digitTransitions).not.toBe(artisticViz.digitTransitions);
      expect(artisticViz.digitTransitions).not.toBe(ambientViz.digitTransitions);
      
      // Ambient mode should have the most visual features
      expect(ambientViz.ambientParticles).toBe(true);
      expect(ambientViz.timeBasedGradients).toBe(true);
      expect(ambientViz.breathingBackground).toBe(true);
    });

    it('should allow custom timer visualization updates', () => {
      engine.updateTimerVisualization({
        digitTransitions: 'flip',
        progressIndicator: 'pulse',
        elapsedTimeVisualization: true,
      });
      
      const timerViz = engine.getTimerVisualization();
      expect(timerViz.digitTransitions).toBe('flip');
      expect(timerViz.progressIndicator).toBe('pulse');
      expect(timerViz.elapsedTimeVisualization).toBe(true);
    });
  });
});

describe('Visual Effects Component Integration', () => {
  it('should have created visual effects components', () => {
    // Test that the component files exist and can be referenced
    const fs = require('fs');
    const path = require('path');
    
    const visualEffectsPath = path.join(__dirname, '../components/VisualEffects.tsx');
    const visualEffectControlsPath = path.join(__dirname, '../components/VisualEffectControls.tsx');
    
    expect(fs.existsSync(visualEffectsPath)).toBe(true);
    expect(fs.existsSync(visualEffectControlsPath)).toBe(true);
  });

  it('should have implemented all required visual effect types', () => {
    // Test that all effect types are supported by the engine in appropriate modes
    const ambientEngine = createVisualModeEngine('ambient', 'high');
    const artisticEngine = createVisualModeEngine('artistic', 'high');
    
    // Ambient mode should support these effects
    const ambientEffects: VisualEffectType[] = ['background', 'particles', 'gradient', 'typography'];
    ambientEffects.forEach(effectType => {
      expect(ambientEngine.isEffectSupported(effectType)).toBe(true);
    });
    
    // Artistic mode should support these effects
    const artisticEffects: VisualEffectType[] = ['background', 'pattern', 'gradient', 'typography'];
    artisticEffects.forEach(effectType => {
      expect(artisticEngine.isEffectSupported(effectType)).toBe(true);
    });
  });
});