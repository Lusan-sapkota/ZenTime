import React from 'react';
import { Text, StyleSheet, View, Animated } from 'react-native';
import { useEnhancedTheme } from '../contexts/ThemeContext';
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
  const { getCurrentColors, visualMode, getAnimationConfig } = useEnhancedTheme();
  const colors = getCurrentColors();
  
  // Get animation configuration for digit transitions
  const digitAnimation = getAnimationConfig('digitTransition');
  
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
    timeContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    time: {
      fontSize: 80,
      fontFamily: 'Inter_700Bold',
      color: colors.onBackground,
      textAlign: 'center',
      letterSpacing: -2,
    },
    secondary: {
      fontSize: 28,
      color: colors.primary,
      marginTop: 8,
      fontFamily: 'Inter_400Regular',
      textAlign: 'center',
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

  // Render time display based on visual mode
  const renderTimeDisplay = () => {
    const timeContent = (
      <View style={dynamicStyles.timeContainer}>
        <Text style={[
          dynamicStyles.time,
          visualMode === 'ambient' && dynamicStyles.ambientGlow
        ]}>
          {time}
        </Text>
        {secondaryTime && !zenMode && (
          <Text style={dynamicStyles.secondary}>
            {secondaryTime}
          </Text>
        )}
      </View>
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

  return (
    <View style={zenMode ? dynamicStyles.zenContainer : dynamicStyles.container}>
      {renderArtisticBackground()}
      {renderTimeDisplay()}
    </View>
  );
};
