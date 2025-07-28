/**
 * Visual Mode Engine Tests
 * 
 * Tests for the visual mode system architecture, including mode switching,
 * effect management, and performance optimization.
 */

import {
  VisualModeEngine,
  createVisualModeEngine,
  getDefaultModeConfig,
  validateModeConfig,
} from '../utils/visualModeEngine';
import {
  VisualMode,
  VisualModeConfig,
  VisualEffectType,
  EffectIntensity,
  PerformanceLevel,
} from '../types/theme';

describe('VisualModeEngine', () => {
  let engine: VisualModeEngine;

  beforeEach(() => {
    engine = createVisualModeEngine('minimal', 'high');
  });

  describe('Initialization', () => {
    it('should initialize with minimal mode by default', () => {
      expect(engine.getCurrentMode()).toBe('minimal');
    });

    it('should initialize with specified mode', () => {
      const artisticEngine = createVisualModeEngine('artistic', 'medium');
      expect(artisticEngine.getCurrentMode()).toBe('artistic');
    });

    it('should have all three visual modes available', () => {
      const modes = engine.getAvailableModes();
      expect(modes).toHaveLength(3);
      expect(modes.map(m => m.id)).toEqual(['minimal', 'artistic', 'ambient']);
    });
  });

  describe('Mode Switching', () => {
    it('should switch to artistic mode', () => {
      engine.switchMode('artistic');
      expect(engine.getCurrentMode()).toBe('artistic');
    });

    it('should switch to ambient mode', () => {
      engine.switchMode('ambient');
      expect(engine.getCurrentMode()).toBe('ambient');
    });

    it('should not switch to invalid mode', () => {
      const initialMode = engine.getCurrentMode();
      // @ts-expect-error Testing invalid mode
      engine.switchMode('invalid');
      expect(engine.getCurrentMode()).toBe(initialMode);
    });

    it('should update timer visualization when switching modes', () => {
      engine.switchMode('artistic');
      const timerViz = engine.getTimerVisualization();
      expect(timerViz.digitTransitions).toBe('slide');
      expect(timerViz.timeBasedGradients).toBe(true);

      engine.switchMode('ambient');
      const ambientViz = engine.getTimerVisualization();
      expect(ambientViz.digitTransitions).toBe('scale');
      expect(ambientViz.ambientParticles).toBe(true);
    });
  });

  describe('Visual Effects Management', () => {
    beforeEach(() => {
      engine.switchMode('artistic'); // Switch to mode with multiple effects
    });

    it('should enable visual effects', () => {
      engine.enableEffect('background');
      const activeEffects = engine.getActiveEffects();
      const backgroundEffect = activeEffects.find(e => e.type === 'background');
      expect(backgroundEffect?.enabled).toBe(true);
    });

    it('should disable visual effects', () => {
      engine.disableEffect('background');
      const activeEffects = engine.getActiveEffects();
      const backgroundEffect = activeEffects.find(e => e.type === 'background');
      expect(backgroundEffect).toBeUndefined(); // Disabled effects should not be in active effects
      
      // Check the actual config to verify it was disabled
      const config = engine.getCurrentModeConfig();
      const configEffect = config.effects.find(e => e.type === 'background');
      expect(configEffect?.enabled).toBe(false);
    });

    it('should set effect intensity', () => {
      engine.setEffectIntensity('typography', 'prominent');
      const config = engine.getCurrentModeConfig();
      const typographyEffect = config.effects.find(e => e.type === 'typography');
      expect(typographyEffect?.intensity).toBe('prominent');
    });

    it('should return only active effects', () => {
      engine.enableEffect('background');
      engine.enableEffect('typography');
      engine.disableEffect('pattern');
      
      const activeEffects = engine.getActiveEffects();
      const activeTypes = activeEffects.map(e => e.type);
      
      expect(activeTypes).toContain('background');
      expect(activeTypes).toContain('typography');
      expect(activeTypes).not.toContain('pattern');
    });
  });

  describe('Performance Optimization', () => {
    it('should optimize for low performance', () => {
      engine.switchMode('ambient'); // Start with high-performance mode
      engine.optimizeForPerformance('low');
      
      const timerViz = engine.getTimerVisualization();
      expect(timerViz.secondsAnimation).toBe(false);
      expect(timerViz.ambientParticles).toBe(false);
      expect(timerViz.progressIndicator).toBe('none');
    });

    it('should optimize for medium performance', () => {
      engine.switchMode('ambient');
      engine.optimizeForPerformance('medium');
      
      const timerViz = engine.getTimerVisualization();
      expect(timerViz.secondsAnimation).toBe(true);
      expect(timerViz.ambientParticles).toBe(false);
      expect(timerViz.progressIndicator).toBe('bar');
    });

    it('should optimize for high performance', () => {
      engine.switchMode('ambient');
      engine.optimizeForPerformance('high');
      
      const timerViz = engine.getTimerVisualization();
      expect(timerViz.secondsAnimation).toBe(true);
      expect(timerViz.ambientParticles).toBe(true);
      expect(timerViz.progressIndicator).toBe('ring');
    });

    it('should disable particle effects on low performance', () => {
      engine.switchMode('ambient');
      engine.optimizeForPerformance('low');
      
      expect(engine.isEffectSupported('particles')).toBe(false);
    });

    it('should support all effects on high performance', () => {
      engine.switchMode('ambient'); // Switch to ambient mode which has all effect types
      engine.optimizeForPerformance('high');
      
      const effectTypes: VisualEffectType[] = ['background', 'particles', 'gradient', 'typography'];
      effectTypes.forEach(type => {
        expect(engine.isEffectSupported(type)).toBe(true);
      });
    });
  });

  describe('Timer Visualization', () => {
    it('should get timer visualization configuration', () => {
      const timerViz = engine.getTimerVisualization();
      expect(timerViz).toHaveProperty('digitTransitions');
      expect(timerViz).toHaveProperty('secondsAnimation');
      expect(timerViz).toHaveProperty('progressIndicator');
    });

    it('should update timer visualization', () => {
      engine.updateTimerVisualization({
        digitTransitions: 'flip',
        progressIndicator: 'pulse',
      });
      
      const timerViz = engine.getTimerVisualization();
      expect(timerViz.digitTransitions).toBe('flip');
      expect(timerViz.progressIndicator).toBe('pulse');
    });
  });

  describe('Performance Impact Assessment', () => {
    it('should return low impact for minimal mode', () => {
      engine.switchMode('minimal');
      const impact = engine.getPerformanceImpact();
      expect(impact).toBe('low');
    });

    it('should return higher impact for ambient mode with particles', () => {
      engine.switchMode('ambient');
      engine.enableEffect('particles');
      const impact = engine.getPerformanceImpact();
      expect(['medium', 'high']).toContain(impact);
    });

    it('should return low impact when no effects are active', () => {
      engine.switchMode('artistic');
      // Disable all effects
      const config = engine.getCurrentModeConfig();
      config.effects.forEach(effect => {
        engine.disableEffect(effect.type);
      });
      
      const impact = engine.getPerformanceImpact();
      expect(impact).toBe('low');
    });
  });
});

describe('Default Mode Configurations', () => {
  it('should return minimal mode config', () => {
    const config = getDefaultModeConfig('minimal');
    expect(config.id).toBe('minimal');
    expect(config.name).toBe('Minimal');
    expect(config.performanceImpact).toBe('low');
  });

  it('should return artistic mode config', () => {
    const config = getDefaultModeConfig('artistic');
    expect(config.id).toBe('artistic');
    expect(config.name).toBe('Artistic');
    expect(config.effects.length).toBeGreaterThan(1);
  });

  it('should return ambient mode config', () => {
    const config = getDefaultModeConfig('ambient');
    expect(config.id).toBe('ambient');
    expect(config.name).toBe('Ambient');
    expect(config.effects.some(e => e.type === 'particles')).toBe(true);
  });

  it('should fallback to minimal for invalid mode', () => {
    // @ts-expect-error Testing invalid mode
    const config = getDefaultModeConfig('invalid');
    expect(config.id).toBe('minimal');
  });
});

describe('Mode Configuration Validation', () => {
  it('should validate correct mode configuration', () => {
    const validConfig: VisualModeConfig = {
      id: 'minimal',
      name: 'Test Mode',
      description: 'Test description',
      effects: [
        {
          type: 'typography',
          intensity: 'subtle',
          animation: { duration: 1000, easing: 'ease' },
          performance: 'high',
          enabled: true,
        },
      ],
      performanceImpact: 'low',
      batteryImpact: 'low',
    };

    const result = validateModeConfig(validConfig);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid mode ID', () => {
    const invalidConfig: VisualModeConfig = {
      // @ts-expect-error Testing invalid ID
      id: 'invalid',
      name: 'Test Mode',
      description: 'Test description',
      effects: [],
      performanceImpact: 'low',
      batteryImpact: 'low',
    };

    const result = validateModeConfig(invalidConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid visual mode ID');
  });

  it('should reject empty name', () => {
    const invalidConfig: VisualModeConfig = {
      id: 'minimal',
      name: '',
      description: 'Test description',
      effects: [],
      performanceImpact: 'low',
      batteryImpact: 'low',
    };

    const result = validateModeConfig(invalidConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Visual mode name is required');
  });

  it('should reject invalid effect types', () => {
    const invalidConfig: VisualModeConfig = {
      id: 'minimal',
      name: 'Test Mode',
      description: 'Test description',
      effects: [
        {
          // @ts-expect-error Testing invalid effect type
          type: 'invalid',
          intensity: 'subtle',
          animation: { duration: 1000, easing: 'ease' },
          performance: 'high',
          enabled: true,
        },
      ],
      performanceImpact: 'low',
      batteryImpact: 'low',
    };

    const result = validateModeConfig(invalidConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid effect type at index 0');
  });
});

describe('Integration with Theme Context', () => {
  it('should work with different performance levels', () => {
    const lowPerfEngine = createVisualModeEngine('ambient', 'low');
    const highPerfEngine = createVisualModeEngine('ambient', 'high');

    expect(lowPerfEngine.isEffectSupported('particles')).toBe(false);
    expect(highPerfEngine.isEffectSupported('particles')).toBe(true);
  });

  it('should maintain state consistency across mode switches', () => {
    const testEngine = createVisualModeEngine('minimal', 'high');
    testEngine.switchMode('artistic');
    testEngine.setEffectIntensity('typography', 'prominent');
    
    testEngine.switchMode('ambient');
    testEngine.switchMode('artistic');
    
    const config = testEngine.getCurrentModeConfig();
    const typographyEffect = config.effects.find((e: any) => e.type === 'typography');
    expect(typographyEffect?.intensity).toBe('prominent');
  });
});