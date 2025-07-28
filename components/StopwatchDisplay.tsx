import React, { useEffect, useRef, useMemo } from 'react';
import { Text, StyleSheet, View, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import { ElevatedSurface } from './ElevatedSurface';
import { ELEVATION_LEVELS } from '../utils/elevationUtils';

interface StopwatchDisplayProps {
  time: string;
  elapsed: number; // elapsed time in milliseconds
  running: boolean;
  maxTime?: number; // maximum time for progress calculation (default: 1 hour)
}

const { width: screenWidth } = Dimensions.get('window');
const PROGRESS_RING_SIZE = Math.min(screenWidth * 0.7, 300);
const PROGRESS_RING_STROKE_WIDTH = 8;
const PROGRESS_BAR_HEIGHT = 6;

export const StopwatchDisplay: React.FC<StopwatchDisplayProps> = ({ 
  time, 
  elapsed, 
  running,
  maxTime = 3600000 // 1 hour in milliseconds
}) => {
  const { getCurrentColors, visualMode, getTimerVisualization, getAnimationConfig } = useEnhancedTheme();
  const colors = getCurrentColors();
  const timerVisualization = getTimerVisualization();
  const progressAnimation = getAnimationConfig('progressAnimation');
  
  // Animation refs for visual feedback
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const progressValue = useRef(new Animated.Value(0)).current;
  const runningIndicatorAnimation = useRef(new Animated.Value(0)).current;
  
  // Calculate progress percentage (0 to 1)
  const progressPercentage = useMemo(() => {
    return Math.min(elapsed / maxTime, 1);
  }, [elapsed, maxTime]);

  // Animate progress value
  useEffect(() => {
    Animated.timing(progressValue, {
      toValue: progressPercentage,
      duration: progressAnimation.duration,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage, progressAnimation.duration, progressValue]);

  // Running state animation
  useEffect(() => {
    if (running) {
      // Start pulsing animation when running
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      
      // Animate running indicator
      Animated.timing(runningIndicatorAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      return () => pulseLoop.stop();
    } else {
      // Stop pulsing and reset running indicator
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(runningIndicatorAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [running, pulseAnimation, runningIndicatorAnimation]);

  // Create dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      backgroundColor: colors.background,
    },
    timeContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingVertical: 24,
    },
    time: {
      fontSize: 72,
      fontFamily: visualMode === 'artistic' ? 'Inter_800ExtraBold' : 'Inter_700Bold',
      color: running ? colors.primary : colors.onBackground,
      textAlign: 'center',
      letterSpacing: -2,
      lineHeight: 72,
    },
    progressContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 32,
    },
    progressRing: {
      position: 'absolute',
    },
    progressBar: {
      width: PROGRESS_RING_SIZE,
      height: PROGRESS_BAR_HEIGHT,
      backgroundColor: colors.surfaceVariant,
      borderRadius: PROGRESS_BAR_HEIGHT / 2,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: PROGRESS_BAR_HEIGHT / 2,
    },
    elapsedTimeIndicator: {
      marginTop: 16,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.primaryContainer,
      borderRadius: 20,
    },
    elapsedTimeText: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      color: colors.onPrimaryContainer,
      textAlign: 'center',
    },
    runningIndicator: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.error,
    },
  });

  // Render progress ring (SVG-based circular progress)
  const renderProgressRing = () => {
    if (timerVisualization.progressIndicator !== 'ring') return null;
    
    const radius = (PROGRESS_RING_SIZE - PROGRESS_RING_STROKE_WIDTH) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progressPercentage);
    
    return (
      <View style={dynamicStyles.progressRing}>
        <Svg width={PROGRESS_RING_SIZE} height={PROGRESS_RING_SIZE}>
          {/* Background circle */}
          <Circle
            cx={PROGRESS_RING_SIZE / 2}
            cy={PROGRESS_RING_SIZE / 2}
            r={radius}
            stroke={colors.surfaceVariant}
            strokeWidth={PROGRESS_RING_STROKE_WIDTH}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={PROGRESS_RING_SIZE / 2}
            cy={PROGRESS_RING_SIZE / 2}
            r={radius}
            stroke={colors.primary}
            strokeWidth={PROGRESS_RING_STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${PROGRESS_RING_SIZE / 2} ${PROGRESS_RING_SIZE / 2})`}
          />
        </Svg>
      </View>
    );
  };

  // Render progress bar (linear progress)
  const renderProgressBar = () => {
    if (timerVisualization.progressIndicator !== 'bar') return null;
    
    return (
      <View style={dynamicStyles.progressBar}>
        <Animated.View
          style={[
            dynamicStyles.progressBarFill,
            {
              width: progressValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    );
  };

  // Render pulse indicator
  const renderPulseIndicator = () => {
    if (timerVisualization.progressIndicator !== 'pulse' || !running) return null;
    
    return (
      <Animated.View
        style={{
          position: 'absolute',
          width: PROGRESS_RING_SIZE,
          height: PROGRESS_RING_SIZE,
          borderRadius: PROGRESS_RING_SIZE / 2,
          borderWidth: 2,
          borderColor: colors.primary,
          opacity: pulseAnimation.interpolate({
            inputRange: [1, 1.05],
            outputRange: [0.3, 0.7],
          }),
          transform: [{ scale: pulseAnimation }],
        }}
      />
    );
  };

  // Render elapsed time visualization
  const renderElapsedTimeVisualization = () => {
    if (!timerVisualization.elapsedTimeVisualization) return null;
    
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    let elapsedText = '';
    if (hours > 0) {
      elapsedText = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      elapsedText = `${minutes}m ${seconds}s`;
    } else {
      elapsedText = `${seconds}s`;
    }
    
    return (
      <View style={dynamicStyles.elapsedTimeIndicator}>
        <Text style={dynamicStyles.elapsedTimeText}>
          Elapsed: {elapsedText}
        </Text>
      </View>
    );
  };

  // Render running indicator
  const renderRunningIndicator = () => {
    if (!running) return null;
    
    return (
      <Animated.View
        style={[
          dynamicStyles.runningIndicator,
          {
            opacity: runningIndicatorAnimation,
            transform: [{ scale: runningIndicatorAnimation }],
          },
        ]}
      />
    );
  };

  // Main time display content
  const timeContent = (
    <View style={dynamicStyles.timeContainer}>
      <Animated.Text
        style={[
          dynamicStyles.time,
          running && {
            transform: [{ scale: pulseAnimation }],
          },
        ]}
      >
        {time}
      </Animated.Text>
      {renderRunningIndicator()}
    </View>
  );

  // Wrap in elevated surface for non-minimal modes
  const wrappedTimeContent = visualMode === 'minimal' ? timeContent : (
    <ElevatedSurface
      level={ELEVATION_LEVELS.CARD}
      style={{ 
        borderRadius: 20,
        position: 'relative',
      }}
      testID="stopwatch-display-surface"
    >
      {timeContent}
    </ElevatedSurface>
  );

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.progressContainer}>
        {renderProgressRing()}
        {renderPulseIndicator()}
        {wrappedTimeContent}
      </View>
      {renderProgressBar()}
      {renderElapsedTimeVisualization()}
    </View>
  );
};
