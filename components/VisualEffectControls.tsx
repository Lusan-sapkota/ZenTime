/**
 * Visual Effect Controls Component
 * 
 * This component provides controls for adjusting visual effect intensity
 * and enabling/disabling specific effects for artistic and ambient modes.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import {
  VisualEffectType,
  EffectIntensity,
  VisualMode,
} from '../types/theme';

// ============================================================================
// Visual Effect Intensity Slider Component
// ============================================================================

interface EffectIntensityControlProps {
  effectType: VisualEffectType;
  currentIntensity: EffectIntensity;
  onIntensityChange: (intensity: EffectIntensity) => void;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const EffectIntensityControl: React.FC<EffectIntensityControlProps> = ({
  effectType,
  currentIntensity,
  onIntensityChange,
  enabled,
  onToggle,
}) => {
  const { getCurrentColors } = useEnhancedTheme();
  const colors = getCurrentColors();

  const intensityLevels: EffectIntensity[] = ['subtle', 'moderate', 'prominent'];

  const getEffectDisplayName = (type: VisualEffectType): string => {
    switch (type) {
      case 'background':
        return 'Background Effects';
      case 'particles':
        return 'Particle Effects';
      case 'gradient':
        return 'Gradient Effects';
      case 'pattern':
        return 'Pattern Effects';
      case 'typography':
        return 'Typography Enhancement';
      default:
        return type;
    }
  };

  const getIntensityDisplayName = (intensity: EffectIntensity): string => {
    switch (intensity) {
      case 'subtle':
        return 'Subtle';
      case 'moderate':
        return 'Moderate';
      case 'prominent':
        return 'Prominent';
      default:
        return intensity;
    }
  };

  return (
    <View style={[styles.controlContainer, { borderColor: colors.outline }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.effectTitle, { color: colors.onSurface }]}>
          {getEffectDisplayName(effectType)}
        </Text>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: enabled ? colors.primary : colors.surfaceVariant,
            },
          ]}
          onPress={() => onToggle(!enabled)}
        >
          <Text
            style={[
              styles.toggleText,
              {
                color: enabled ? colors.onPrimary : colors.onSurfaceVariant,
              },
            ]}
          >
            {enabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {enabled && (
        <View style={styles.intensityRow}>
          <Text style={[styles.intensityLabel, { color: colors.onSurfaceVariant }]}>
            Intensity:
          </Text>
          <View style={styles.intensityButtons}>
            {intensityLevels.map((intensity) => (
              <TouchableOpacity
                key={intensity}
                style={[
                  styles.intensityButton,
                  {
                    backgroundColor:
                      currentIntensity === intensity
                        ? colors.primaryContainer
                        : colors.surface,
                    borderColor: colors.outline,
                  },
                ]}
                onPress={() => onIntensityChange(intensity)}
              >
                <Text
                  style={[
                    styles.intensityButtonText,
                    {
                      color:
                        currentIntensity === intensity
                          ? colors.onPrimaryContainer
                          : colors.onSurface,
                    },
                  ]}
                >
                  {getIntensityDisplayName(intensity)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// Visual Mode Controls Component
// ============================================================================

interface VisualModeControlsProps {
  mode: VisualMode;
}

export const VisualModeControls: React.FC<VisualModeControlsProps> = ({ mode }) => {
  const {
    getVisualModeConfig,
    enableVisualEffect,
    disableVisualEffect,
    setVisualEffectIntensity,
    isVisualEffectSupported,
    getCurrentColors,
  } = useEnhancedTheme();

  const colors = getCurrentColors();
  const modeConfig = getVisualModeConfig(mode);

  if (mode === 'minimal') {
    return (
      <View style={styles.container}>
        <Text style={[styles.modeTitle, { color: colors.onSurface }]}>
          Minimal Mode
        </Text>
        <Text style={[styles.modeDescription, { color: colors.onSurfaceVariant }]}>
          Clean, distraction-free interface with no visual effects.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.modeTitle, { color: colors.onSurface }]}>
        {modeConfig.name} Mode
      </Text>
      <Text style={[styles.modeDescription, { color: colors.onSurfaceVariant }]}>
        {modeConfig.description}
      </Text>

      <View style={styles.effectsContainer}>
        {modeConfig.effects.map((effect) => {
          if (!isVisualEffectSupported(effect.type)) {
            return null;
          }

          return (
            <EffectIntensityControl
              key={effect.type}
              effectType={effect.type}
              currentIntensity={effect.intensity}
              onIntensityChange={(intensity) =>
                setVisualEffectIntensity(effect.type, intensity)
              }
              enabled={effect.enabled}
              onToggle={(enabled) => {
                if (enabled) {
                  enableVisualEffect(effect.type);
                } else {
                  disableVisualEffect(effect.type);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
};

// ============================================================================
// Performance Impact Indicator Component
// ============================================================================

export const PerformanceImpactIndicator: React.FC = () => {
  const { getVisualPerformanceImpact, getCurrentColors } = useEnhancedTheme();
  const colors = getCurrentColors();
  const impact = getVisualPerformanceImpact();

  const getImpactColor = () => {
    switch (impact) {
      case 'low':
        return '#4CAF50'; // Green
      case 'medium':
        return '#FF9800'; // Orange
      case 'high':
        return '#F44336'; // Red
      default:
        return colors.onSurfaceVariant;
    }
  };

  const getImpactDescription = () => {
    switch (impact) {
      case 'low':
        return 'Minimal performance impact';
      case 'medium':
        return 'Moderate performance impact';
      case 'high':
        return 'High performance impact - may affect battery life';
      default:
        return 'Unknown performance impact';
    }
  };

  return (
    <View style={[styles.performanceIndicator, { borderColor: colors.outline }]}>
      <View style={styles.performanceHeader}>
        <View
          style={[
            styles.performanceIcon,
            { backgroundColor: getImpactColor() },
          ]}
        />
        <Text style={[styles.performanceTitle, { color: colors.onSurface }]}>
          Performance Impact: {impact.toUpperCase()}
        </Text>
      </View>
      <Text style={[styles.performanceDescription, { color: colors.onSurfaceVariant }]}>
        {getImpactDescription()}
      </Text>
    </View>
  );
};

// ============================================================================
// Main Visual Effect Controls Export
// ============================================================================

interface VisualEffectControlsPanelProps {
  currentMode: VisualMode;
}

export const VisualEffectControlsPanel: React.FC<VisualEffectControlsPanelProps> = ({
  currentMode,
}) => {
  return (
    <View style={styles.panel}>
      <VisualModeControls mode={currentMode} />
      <PerformanceImpactIndicator />
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  panel: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  effectsContainer: {
    gap: 16,
  },
  controlContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  effectTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 50,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  intensityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  intensityLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  intensityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  intensityButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  performanceIndicator: {
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  performanceTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  performanceDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default VisualEffectControlsPanel;