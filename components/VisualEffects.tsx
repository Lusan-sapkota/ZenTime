/**
 * Visual Effects Components
 * 
 * This module provides visual effect components for artistic and ambient modes,
 * including background patterns, particle effects, and enhanced typography.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import {
  VisualEffect,
  VisualEffectType,
  EffectIntensity,
  PerformanceLevel,
} from '../types/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ============================================================================
// Base Visual Effect Component
// ============================================================================

interface VisualEffectProps {
  effect: VisualEffect;
  children?: React.ReactNode;
}

export const VisualEffectWrapper: React.FC<VisualEffectProps> = ({ effect, children }) => {
  if (!effect.enabled) {
    return <>{children}</>;
  }

  switch (effect.type) {
    case 'background':
      return <BackgroundEffect effect={effect}>{children}</BackgroundEffect>;
    case 'particles':
      return <ParticleEffect effect={effect}>{children}</ParticleEffect>;
    case 'gradient':
      return <GradientEffect effect={effect}>{children}</GradientEffect>;
    case 'pattern':
      return <PatternEffect effect={effect}>{children}</PatternEffect>;
    case 'typography':
      return <TypographyEffect effect={effect}>{children}</TypographyEffect>;
    default:
      return <>{children}</>;
  }
};

// ============================================================================
// Background Effect Component (Artistic Mode)
// ============================================================================

const BackgroundEffect: React.FC<VisualEffectProps> = ({ effect, children }) => {
  const { getCurrentColors, performanceSettings } = useEnhancedTheme();
  const colors = getCurrentColors();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (performanceSettings.reducedMotion) {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: effect.animation.duration,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: effect.animation.duration,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [effect.animation.duration, performanceSettings.reducedMotion, animatedValue]);

  const getBackgroundOpacity = () => {
    switch (effect.intensity) {
      case 'subtle':
        return 0.03;
      case 'moderate':
        return 0.06;
      case 'prominent':
        return 0.1;
      default:
        return 0.03;
    }
  };

  const backgroundOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [getBackgroundOpacity() * 0.5, getBackgroundOpacity()],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.backgroundEffect,
          {
            backgroundColor: colors.primary,
            opacity: backgroundOpacity,
          },
        ]}
      />
      {children}
    </View>
  );
};

// ============================================================================
// Particle Effect Component (Ambient Mode)
// ============================================================================

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
}

const ParticleEffect: React.FC<VisualEffectProps> = ({ effect, children }) => {
  const { getCurrentColors, performanceSettings } = useEnhancedTheme();
  const colors = getCurrentColors();
  const particles = useRef<Particle[]>([]).current;

  const getParticleCount = () => {
    if (performanceSettings.performanceLevel === 'low') return 0;
    
    switch (effect.intensity) {
      case 'subtle':
        return 3;
      case 'moderate':
        return 6;
      case 'prominent':
        return 10;
      default:
        return 3;
    }
  };

  useEffect(() => {
    if (performanceSettings.reducedMotion || performanceSettings.performanceLevel === 'low') {
      return;
    }

    const particleCount = getParticleCount();
    
    // Initialize particles if needed
    if (particles.length === 0) {
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          id: i,
          x: new Animated.Value(Math.random() * screenWidth),
          y: new Animated.Value(Math.random() * screenHeight),
          opacity: new Animated.Value(0),
          scale: new Animated.Value(0.5),
        });
      }
    }

    // Animate particles
    const animations = particles.map((particle) => {
      return Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: 0.3,
              duration: effect.animation.duration * 0.3,
              useNativeDriver: false,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: effect.animation.duration * 0.7,
              useNativeDriver: false,
            }),
          ]),
          Animated.timing(particle.y, {
            toValue: particle.y._value - 100,
            duration: effect.animation.duration,
            useNativeDriver: false,
          }),
          Animated.sequence([
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: effect.animation.duration * 0.5,
              useNativeDriver: false,
            }),
            Animated.timing(particle.scale, {
              toValue: 0.5,
              duration: effect.animation.duration * 0.5,
              useNativeDriver: false,
            }),
          ]),
        ])
      );
    });

    animations.forEach(animation => animation.start());

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, [effect.animation.duration, effect.intensity, performanceSettings, particles]);

  if (performanceSettings.performanceLevel === 'low' || performanceSettings.reducedMotion) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity,
              transform: [{ scale: particle.scale }],
              backgroundColor: colors.primary,
            },
          ]}
        />
      ))}
      {children}
    </View>
  );
};

// ============================================================================
// Gradient Effect Component (Artistic & Ambient Modes)
// ============================================================================

const GradientEffect: React.FC<VisualEffectProps> = ({ effect, children }) => {
  const { getCurrentColors } = useEnhancedTheme();
  const colors = getCurrentColors();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: effect.animation.duration,
        useNativeDriver: false,
      })
    );

    animation.start();

    return () => animation.stop();
  }, [effect.animation.duration, animatedValue]);

  const getGradientOpacity = () => {
    switch (effect.intensity) {
      case 'subtle':
        return 0.05;
      case 'moderate':
        return 0.1;
      case 'prominent':
        return 0.15;
      default:
        return 0.05;
    }
  };

  const gradientOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [getGradientOpacity() * 0.7, getGradientOpacity()],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.gradientEffect,
          {
            opacity: gradientOpacity,
            backgroundColor: colors.primaryContainer,
          },
        ]}
      />
      {children}
    </View>
  );
};

// ============================================================================
// Pattern Effect Component (Artistic Mode)
// ============================================================================

const PatternEffect: React.FC<VisualEffectProps> = ({ effect, children }) => {
  const { getCurrentColors } = useEnhancedTheme();
  const colors = getCurrentColors();

  const getPatternOpacity = () => {
    switch (effect.intensity) {
      case 'subtle':
        return 0.02;
      case 'moderate':
        return 0.04;
      case 'prominent':
        return 0.08;
      default:
        return 0.02;
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.patternEffect,
          {
            opacity: getPatternOpacity(),
            backgroundColor: colors.outline,
          },
        ]}
      />
      {children}
    </View>
  );
};

// ============================================================================
// Typography Effect Component (Enhanced Typography)
// ============================================================================

const TypographyEffect: React.FC<VisualEffectProps> = ({ effect, children }) => {
  const { getCurrentColors } = useEnhancedTheme();
  const colors = getCurrentColors();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: effect.animation.duration,
        useNativeDriver: false,
      })
    );

    animation.start();

    return () => animation.stop();
  }, [effect.animation.duration, animatedValue]);

  const getTextShadowIntensity = () => {
    switch (effect.intensity) {
      case 'subtle':
        return 0.1;
      case 'moderate':
        return 0.2;
      case 'prominent':
        return 0.3;
      default:
        return 0.1;
    }
  };

  const textShadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [getTextShadowIntensity() * 0.5, getTextShadowIntensity()],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.typographyEffect,
          {
            shadowColor: colors.primary,
            shadowOpacity: textShadowOpacity,
            shadowRadius: effect.intensity === 'prominent' ? 8 : 4,
            shadowOffset: { width: 0, height: 2 },
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

// ============================================================================
// Visual Mode Container Component
// ============================================================================

interface VisualModeContainerProps {
  children: React.ReactNode;
}

export const VisualModeContainer: React.FC<VisualModeContainerProps> = ({ children }) => {
  const { getActiveVisualEffects } = useEnhancedTheme();
  const activeEffects = getActiveVisualEffects();

  // Wrap children with active visual effects
  return activeEffects.reduce(
    (wrappedChildren, effect) => (
      <VisualEffectWrapper effect={effect}>
        {wrappedChildren}
      </VisualEffectWrapper>
    ),
    children
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
  },
  gradientEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  patternEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
    // Create a subtle dot pattern
    borderWidth: 1,
    borderStyle: 'dotted',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  typographyEffect: {
    flex: 1,
  },
});

export default VisualModeContainer;