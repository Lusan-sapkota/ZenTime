import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Text, StyleSheet, View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import { useZenModeContext } from '../contexts/ZenModeContext';
import { ElevatedSurface } from './ElevatedSurface';
import { ELEVATION_LEVELS } from '../utils/elevationUtils';

interface ClockDisplayProps {
  time: string;
  secondaryTime?: string;
  zenMode?: boolean;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({
  time,
  secondaryTime,
  zenMode = false
}) => {
  const { getCurrentColors, visualMode, getAnimationConfig, getTimerVisualization } = useEnhancedTheme();
  const { zenConfig, zenAnimations } = useZenModeContext();
  const colors = getCurrentColors();
  const timerVisualization = getTimerVisualization();

  // Animation refs for zen mode effects
  const breathingAnimation = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const dimmingAnimation = useRef(new Animated.Value(1)).current;

  // Animation refs for digit transitions
  const digitAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Previous time state for digit transition detection
  const [previousTime, setPreviousTime] = useState(time);

  // Get animation configuration for digit transitions
  const digitAnimation = getAnimationConfig('digitTransition');

  // Screen dimensions for gradient calculations
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Time-based gradient calculation
  const timeBasedGradient = useMemo(() => {
    if (!timerVisualization.timeBasedGradients) return null;

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeProgress = (hour * 60 + minute) / (24 * 60); // 0 to 1 throughout the day

    // Create gradient colors based on time of day
    let gradientColors: string[];

    if (timeProgress < 0.25) {
      // Night to dawn (0:00 - 6:00)
      const progress = timeProgress / 0.25;
      gradientColors = [
        `rgba(25, 25, 112, ${0.3 - progress * 0.2})`, // Midnight blue
        `rgba(72, 61, 139, ${0.2 - progress * 0.1})`, // Dark slate blue
        `rgba(255, 182, 193, ${progress * 0.1})`, // Light pink (dawn)
      ];
    } else if (timeProgress < 0.5) {
      // Dawn to midday (6:00 - 12:00)
      const progress = (timeProgress - 0.25) / 0.25;
      gradientColors = [
        `rgba(255, 182, 193, ${0.1 + progress * 0.1})`, // Light pink
        `rgba(255, 215, 0, ${progress * 0.15})`, // Gold
        `rgba(135, 206, 235, ${progress * 0.1})`, // Sky blue
      ];
    } else if (timeProgress < 0.75) {
      // Midday to evening (12:00 - 18:00)
      const progress = (timeProgress - 0.5) / 0.25;
      gradientColors = [
        `rgba(135, 206, 235, ${0.1 - progress * 0.05})`, // Sky blue
        `rgba(255, 215, 0, ${0.15 - progress * 0.1})`, // Gold
        `rgba(255, 165, 0, ${progress * 0.1})`, // Orange
      ];
    } else {
      // Evening to night (18:00 - 24:00)
      const progress = (timeProgress - 0.75) / 0.25;
      gradientColors = [
        `rgba(255, 165, 0, ${0.1 - progress * 0.1})`, // Orange
        `rgba(128, 0, 128, ${progress * 0.15})`, // Purple
        `rgba(25, 25, 112, ${progress * 0.2})`, // Midnight blue
      ];
    }

    return gradientColors;
  }, [time, timerVisualization.timeBasedGradients]);

  // Initialize digit animations for each character position
  useEffect(() => {
    const timeChars = time.split('');
    timeChars.forEach((_, index) => {
      if (!digitAnimations[`digit_${index}`]) {
        digitAnimations[`digit_${index}`] = new Animated.Value(1);
      }
    });
  }, [time, digitAnimations]);

  // Digit transition animation effect
  useEffect(() => {
    if (previousTime !== time && timerVisualization.digitTransitions) {
      const prevChars = previousTime.split('');
      const currentChars = time.split('');

      // Find changed digits and animate them
      currentChars.forEach((char, index) => {
        if (prevChars[index] !== char && digitAnimations[`digit_${index}`]) {
          const animationValue = digitAnimations[`digit_${index}`];

          switch (timerVisualization.digitTransitions) {
            case 'flip':
              // Flip animation: scale down then up
              Animated.sequence([
                Animated.timing(animationValue, {
                  toValue: 0,
                  duration: digitAnimation.duration / 2,
                  useNativeDriver: true,
                }),
                Animated.timing(animationValue, {
                  toValue: 1,
                  duration: digitAnimation.duration / 2,
                  useNativeDriver: true,
                }),
              ]).start();
              break;

            case 'slide':
              // Slide animation: translate up then down
              Animated.sequence([
                Animated.timing(animationValue, {
                  toValue: -20,
                  duration: digitAnimation.duration / 2,
                  useNativeDriver: true,
                }),
                Animated.timing(animationValue, {
                  toValue: 0,
                  duration: digitAnimation.duration / 2,
                  useNativeDriver: true,
                }),
              ]).start();
              break;

            case 'fade':
              // Fade animation: opacity down then up
              Animated.sequence([
                Animated.timing(animationValue, {
                  toValue: 0.3,
                  duration: digitAnimation.duration / 2,
                  useNativeDriver: true,
                }),
                Animated.timing(animationValue, {
                  toValue: 1,
                  duration: digitAnimation.duration / 2,
                  useNativeDriver: true,
                }),
              ]).start();
              break;

            case 'scale':
              // Scale animation: scale up then down
              Animated.sequence([
                Animated.timing(animationValue, {
                  toValue: 1.2,
                  duration: digitAnimation.duration / 2,
                  useNativeDriver: true,
                }),
                Animated.timing(animationValue, {
                  toValue: 1,
                  duration: digitAnimation.duration / 2,
                  useNativeDriver: true,
                }),
              ]).start();
              break;
          }
        }
      });

      setPreviousTime(time);
    }
  }, [time, previousTime, timerVisualization.digitTransitions, digitAnimation.duration, digitAnimations]);

  // Zen mode breathing animation effect
  useEffect(() => {
    if (zenMode && zenConfig.breathingAnimation) {
      const breathingLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(breathingAnimation, {
            toValue: 1.05,
            duration: zenAnimations.breathingCycle.duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(breathingAnimation, {
            toValue: 1,
            duration: zenAnimations.breathingCycle.duration / 2,
            useNativeDriver: true,
          }),
        ])
      );
      breathingLoop.start();

      return () => breathingLoop.stop();
    } else {
      // Reset to normal scale when not in zen mode or breathing disabled
      Animated.timing(breathingAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [zenMode, zenConfig.breathingAnimation, zenAnimations.breathingCycle.duration, breathingAnimation]);

  // Zen mode pulse effect
  useEffect(() => {
    if (zenMode && zenConfig.pulseEffect) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 0.7,
            duration: zenAnimations.pulseEffect.duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: zenAnimations.pulseEffect.duration / 2,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      return () => pulseLoop.stop();
    } else {
      // Reset to normal opacity when not in zen mode or pulse disabled
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [zenMode, zenConfig.pulseEffect, zenAnimations.pulseEffect.duration, pulseAnimation]);

  // Zen mode gradual dimming effect
  useEffect(() => {
    if (zenMode && zenConfig.gradualDimming) {
      // Start dimming after 5 minutes (300000ms) as per requirement 3.4
      const dimmingTimer = setTimeout(() => {
        Animated.timing(dimmingAnimation, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }).start();
      }, 300000);

      return () => clearTimeout(dimmingTimer);
    } else {
      // Reset to full brightness when not in zen mode or dimming disabled
      Animated.timing(dimmingAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [zenMode, zenConfig.gradualDimming, dimmingAnimation]);

  // Enhanced typography styles based on visual mode
  const getEnhancedTypographyStyles = () => {
    const baseTimeStyle = {
      fontSize: 80,
      color: colors.onBackground,
      textAlign: 'center' as const,
      letterSpacing: -2,
    };

    switch (visualMode) {
      case 'artistic':
        return {
          ...baseTimeStyle,
          fontFamily: 'Inter_800ExtraBold',
          fontSize: 88,
          letterSpacing: -3,
          lineHeight: 88,
          textShadowColor: colors.primary,
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        };

      case 'ambient':
        return {
          ...baseTimeStyle,
          fontFamily: 'Inter_300Light',
          fontSize: 92,
          letterSpacing: -1,
          lineHeight: 92,
          opacity: 0.95,
        };

      case 'minimal':
      default:
        return {
          ...baseTimeStyle,
          fontFamily: 'Inter_700Bold',
          lineHeight: 80,
        };
    }
  };

  // Create styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      backgroundColor: colors.background,
    },
    zenContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      backgroundColor: 'transparent',
    },
    gradientBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    timeContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    timeText: getEnhancedTypographyStyles(),
    digitContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    digit: {
      overflow: 'hidden',
    },
    secondary: {
      fontSize: 28,
      color: colors.primary,
      marginTop: 8,
      fontFamily: 'Inter_400Regular',
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    // Visual mode specific styles
    artisticBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.05,
    },
    ambientGlow: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    },
  });

  // Render individual digits with animations
  const renderAnimatedDigits = () => {
    const timeChars = time.split('');

    return (
      <View style={dynamicStyles.digitContainer}>
        {timeChars.map((char, index) => {
          const animationValue = digitAnimations[`digit_${index}`] || new Animated.Value(1);

          // Create transform style based on transition type
          let transformStyle = {};
          switch (timerVisualization.digitTransitions) {
            case 'flip':
              transformStyle = { transform: [{ scaleY: animationValue }] };
              break;
            case 'slide':
              transformStyle = { transform: [{ translateY: animationValue }] };
              break;
            case 'fade':
              transformStyle = { opacity: animationValue };
              break;
            case 'scale':
              transformStyle = { transform: [{ scale: animationValue }] };
              break;
            default:
              transformStyle = {};
          }

          return (
            <Animated.View key={`${index}-${char}`} style={[dynamicStyles.digit, transformStyle]}>
              <Text style={[
                dynamicStyles.timeText,
                visualMode === 'ambient' && dynamicStyles.ambientGlow
              ]}>
                {char}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  // Render time display based on visual mode
  const renderTimeDisplay = () => {
    const timeContent = (
      <Animated.View
        style={[
          dynamicStyles.timeContainer,
          zenMode && {
            transform: [{ scale: breathingAnimation }],
            opacity: Animated.multiply(pulseAnimation, dimmingAnimation),
          }
        ]}
      >
        {timerVisualization.digitTransitions ? renderAnimatedDigits() : (
          <Text style={[
            dynamicStyles.timeText,
            visualMode === 'ambient' && dynamicStyles.ambientGlow
          ]}>
            {time}
          </Text>
        )}
        {secondaryTime && !zenMode && (
          <Text style={dynamicStyles.secondary}>
            {secondaryTime}
          </Text>
        )}
      </Animated.View>
    );

    // In zen mode, don't use elevation
    if (zenMode) {
      return timeContent;
    }

    // For non-zen mode, wrap in elevated surface based on visual mode
    switch (visualMode) {
      case 'artistic':
        return (
          <ElevatedSurface
            level={ELEVATION_LEVELS.CARD}
            style={{ borderRadius: 16 }}
            testID="clock-display-surface"
          >
            {timeContent}
          </ElevatedSurface>
        );

      case 'ambient':
        return (
          <ElevatedSurface
            level={ELEVATION_LEVELS.BUTTON}
            style={{
              borderRadius: 20,
              backgroundColor: colors.surfaceVariant,
            }}
            testID="clock-display-surface"
          >
            {timeContent}
          </ElevatedSurface>
        );

      case 'minimal':
      default:
        return timeContent;
    }
  };

  // Render artistic background pattern
  const renderArtisticBackground = () => {
    if (visualMode !== 'artistic' || zenMode) return null;

    return (
      <View style={dynamicStyles.artisticBackground}>
        {/* Subtle geometric pattern - simplified for now */}
        <View style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.primary,
          opacity: 0.1,
        }} />
        <View style={{
          position: 'absolute',
          bottom: '30%',
          right: '15%',
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.secondary,
          opacity: 0.08,
        }} />
      </View>
    );
  };

  // Render time-based gradient background
  const renderTimeBasedGradient = () => {
    if (!timeBasedGradient || zenMode || timeBasedGradient.length < 2) return null;

    return (
      <LinearGradient
        colors={timeBasedGradient as [string, string, ...string[]]}
        style={dynamicStyles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    );
  };

  return (
    <View style={zenMode ? dynamicStyles.zenContainer : dynamicStyles.container}>
      {renderTimeBasedGradient()}
      {renderArtisticBackground()}
      {renderTimeDisplay()}
    </View>
  );
};
