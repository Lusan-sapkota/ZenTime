/**
 * Visual Effects Components Tests
 * 
 * Tests for the visual effects components including artistic and ambient modes,
 * effect controls, and performance optimization.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import {
  VisualEffectWrapper,
  VisualModeContainer,
} from '../components/VisualEffects';
import {
  VisualModeControls,
  PerformanceImpactIndicator,
  VisualEffectControlsPanel,
} from '../components/VisualEffectControls';
import { EnhancedThemeProvider } from '../contexts/ThemeContext';
import {
  VisualEffect,
  VisualMode,
  PerformanceLevel,
} from '../types/theme';

// Mock the theme context
const mockThemeContext = {
  getCurrentColors: () => ({
    primary: '#6750A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#EADDFF',
    onPrimaryContainer: '#21005D',
    surface: '#FFFBFE',
    onSurface: '#1C1B1F',
    surfaceVariant: '#E7E0EC',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
  }),
  performanceSettings: {
    reducedMotion: false,
    performanceLevel: 'high' as PerformanceLevel,
  },
  getActiveVisualEffects: () => [],
  getVisualModeConfig: (mode: VisualMode) => ({
    id: mode,
    name: mode === 'artistic' ? 'Artistic' : 'Ambient',
    description: `${mode} mode description`,
    effects: [
      {
        type: 'background' as const,
        intensity: 'subtle' as const,
        animation: { duration: 2000, easing: 'ease-in-out' as const },
        performance: 'medium' as PerformanceLevel,
        enabled: true,
      },
    ],
    performanceImpact: 'medium' as PerformanceLevel,
    batteryImpact: 'medium' as const,
  }),
  enableVisualEffect: jest.fn(),
  disableVisualEffect: jest.fn(),
  setVisualEffectIntensity: jest.fn(),
  isVisualEffectSupported: () => true,
  getVisualPerformanceImpact: () => 'medium' as PerformanceLevel,
};

jest.mock('../contexts/ThemeContext', () => ({
  useEnhancedTheme: () => mockThemeContext,
  EnhancedThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Animated components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      Value: jest.fn(() => ({
        interpolate: jest.fn(() => 0.5),
        _value: 0,
      })),
      timing: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
      })),
      loop: jest.fn((animation) => ({
        start: jest.fn(),
        stop: jest.fn(),
      })),
      sequence: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
      })),
      parallel: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
      })),
      View: RN.View,
    },
  };
});

describe('VisualEffectWrapper', () => {
  const mockEffect: VisualEffect = {
    type: 'background',
    intensity: 'subtle',
    animation: { duration: 2000, easing: 'ease-in-out' },
    performance: 'medium',
    enabled: true,
  };

  it('should render children when effect is enabled', () => {
    const { getByText } = render(
      <VisualEffectWrapper effect={mockEffect}>
        <Text>Test Content</Text>
      </VisualEffectWrapper>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should render children when effect is disabled', () => {
    const disabledEffect = { ...mockEffect, enabled: false };
    
    const { getByText } = render(
      <VisualEffectWrapper effect={disabledEffect}>
        <Text>Test Content</Text>
      </VisualEffectWrapper>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should handle different effect types', () => {
    const effectTypes = ['background', 'particles', 'gradient', 'pattern', 'typography'] as const;
    
    effectTypes.forEach(type => {
      const effect = { ...mockEffect, type };
      
      const { getByText } = render(
        <VisualEffectWrapper effect={effect}>
          <Text>Test Content {type}</Text>
        </VisualEffectWrapper>
      );

      expect(getByText(`Test Content ${type}`)).toBeTruthy();
    });
  });
});

describe('VisualModeContainer', () => {
  it('should render children with active visual effects', () => {
    const { getByText } = render(
      <VisualModeContainer>
        <Text>Container Content</Text>
      </VisualModeContainer>
    );

    expect(getByText('Container Content')).toBeTruthy();
  });

  it('should wrap children with multiple effects', () => {
    const multipleEffects = [
      {
        type: 'background' as const,
        intensity: 'subtle' as const,
        animation: { duration: 2000, easing: 'ease-in-out' as const },
        performance: 'medium' as PerformanceLevel,
        enabled: true,
      },
      {
        type: 'gradient' as const,
        intensity: 'moderate' as const,
        animation: { duration: 1500, easing: 'ease-in-out' as const },
        performance: 'medium' as PerformanceLevel,
        enabled: true,
      },
    ];

    mockThemeContext.getActiveVisualEffects = () => multipleEffects;

    const { getByText } = render(
      <VisualModeContainer>
        <Text>Multi-Effect Content</Text>
      </VisualModeContainer>
    );

    expect(getByText('Multi-Effect Content')).toBeTruthy();
  });
});

describe('VisualModeControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render minimal mode description', () => {
    const { getByText } = render(
      <VisualModeControls mode="minimal" />
    );

    expect(getByText('Minimal Mode')).toBeTruthy();
    expect(getByText('Clean, distraction-free interface with no visual effects.')).toBeTruthy();
  });

  it('should render artistic mode controls', () => {
    const { getByText } = render(
      <VisualModeControls mode="artistic" />
    );

    expect(getByText('Artistic Mode')).toBeTruthy();
    expect(getByText('Background Effects')).toBeTruthy();
  });

  it('should render ambient mode controls', () => {
    const { getByText } = render(
      <VisualModeControls mode="ambient" />
    );

    expect(getByText('Ambient Mode')).toBeTruthy();
    expect(getByText('Background Effects')).toBeTruthy();
  });

  it('should handle effect toggle', () => {
    const { getByText } = render(
      <VisualModeControls mode="artistic" />
    );

    const toggleButton = getByText('ON');
    fireEvent.press(toggleButton);

    expect(mockThemeContext.disableVisualEffect).toHaveBeenCalledWith('background');
  });

  it('should handle intensity changes', () => {
    const { getByText } = render(
      <VisualModeControls mode="artistic" />
    );

    const moderateButton = getByText('Moderate');
    fireEvent.press(moderateButton);

    expect(mockThemeContext.setVisualEffectIntensity).toHaveBeenCalledWith('background', 'moderate');
  });
});

describe('PerformanceImpactIndicator', () => {
  it('should display performance impact', () => {
    const { getByText } = render(
      <PerformanceImpactIndicator />
    );

    expect(getByText('Performance Impact: MEDIUM')).toBeTruthy();
    expect(getByText('Moderate performance impact')).toBeTruthy();
  });

  it('should display different impact levels', () => {
    // Test low impact
    mockThemeContext.getVisualPerformanceImpact = () => 'low';
    
    const { rerender, getByText } = render(
      <PerformanceImpactIndicator />
    );

    expect(getByText('Performance Impact: LOW')).toBeTruthy();
    expect(getByText('Minimal performance impact')).toBeTruthy();

    // Test high impact
    mockThemeContext.getVisualPerformanceImpact = () => 'high';
    
    rerender(<PerformanceImpactIndicator />);

    expect(getByText('Performance Impact: HIGH')).toBeTruthy();
    expect(getByText('High performance impact - may affect battery life')).toBeTruthy();
  });
});

describe('VisualEffectControlsPanel', () => {
  it('should render complete controls panel', () => {
    const { getByText } = render(
      <VisualEffectControlsPanel currentMode="artistic" />
    );

    expect(getByText('Artistic Mode')).toBeTruthy();
    expect(getByText('Performance Impact: MEDIUM')).toBeTruthy();
  });

  it('should handle different visual modes', () => {
    const { getByText, rerender } = render(
      <VisualEffectControlsPanel currentMode="minimal" />
    );

    expect(getByText('Minimal Mode')).toBeTruthy();

    rerender(<VisualEffectControlsPanel currentMode="ambient" />);

    expect(getByText('Ambient Mode')).toBeTruthy();
  });
});

describe('Performance Optimization', () => {
  it('should respect reduced motion settings', () => {
    mockThemeContext.performanceSettings.reducedMotion = true;

    const { getByText } = render(
      <VisualModeContainer>
        <Text>Reduced Motion Content</Text>
      </VisualModeContainer>
    );

    expect(getByText('Reduced Motion Content')).toBeTruthy();
  });

  it('should respect performance level settings', () => {
    mockThemeContext.performanceSettings.performanceLevel = 'low';

    const { getByText } = render(
      <VisualModeContainer>
        <Text>Low Performance Content</Text>
      </VisualModeContainer>
    );

    expect(getByText('Low Performance Content')).toBeTruthy();
  });

  it('should filter unsupported effects', () => {
    mockThemeContext.isVisualEffectSupported = (effectType) => effectType !== 'particles';

    const { queryByText } = render(
      <VisualModeControls mode="ambient" />
    );

    // Should not render particle effect controls if not supported
    expect(queryByText('Particle Effects')).toBeFalsy();
  });
});

describe('Effect Intensity Levels', () => {
  it('should handle all intensity levels', () => {
    const intensityLevels = ['subtle', 'moderate', 'prominent'] as const;
    
    intensityLevels.forEach(intensity => {
      const effect: VisualEffect = {
        type: 'background',
        intensity,
        animation: { duration: 2000, easing: 'ease-in-out' },
        performance: 'medium',
        enabled: true,
      };

      const { getByText } = render(
        <VisualEffectWrapper effect={effect}>
          <Text>Intensity {intensity}</Text>
        </VisualEffectWrapper>
      );

      expect(getByText(`Intensity ${intensity}`)).toBeTruthy();
    });
  });

  it('should display correct intensity names', () => {
    const { getByText } = render(
      <VisualModeControls mode="artistic" />
    );

    expect(getByText('Subtle')).toBeTruthy();
    expect(getByText('Moderate')).toBeTruthy();
    expect(getByText('Prominent')).toBeTruthy();
  });
});

describe('Integration Tests', () => {
  it('should work with theme provider', () => {
    const { getByText } = render(
      <EnhancedThemeProvider>
        <VisualEffectControlsPanel currentMode="artistic" />
      </EnhancedThemeProvider>
    );

    expect(getByText('Artistic Mode')).toBeTruthy();
  });

  it('should handle mode switching', () => {
    const { getByText, rerender } = render(
      <VisualEffectControlsPanel currentMode="minimal" />
    );

    expect(getByText('Minimal Mode')).toBeTruthy();

    rerender(<VisualEffectControlsPanel currentMode="artistic" />);

    expect(getByText('Artistic Mode')).toBeTruthy();

    rerender(<VisualEffectControlsPanel currentMode="ambient" />);

    expect(getByText('Ambient Mode')).toBeTruthy();
  });
});