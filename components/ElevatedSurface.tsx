/**
 * ElevatedSurface Component
 * 
 * A reusable component that applies Material Design elevation to any content.
 * Automatically handles light/dark theme differences and provides semantic elevation levels.
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import { 
  applyElevation, 
  getElevationByLevel, 
  getSurfaceColor,
  ElevationLevel,
  ELEVATION_LEVELS 
} from '../utils/elevationUtils';

// ============================================================================
// Component Props Interface
// ============================================================================

interface ElevatedSurfaceProps {
  /**
   * Elevation level (0-5) following Material Design specifications
   */
  level?: ElevationLevel;
  
  /**
   * Child components to render within the elevated surface
   */
  children: React.ReactNode;
  
  /**
   * Additional styles to apply to the surface
   */
  style?: ViewStyle;
  
  /**
   * Whether to use native shadow rendering (iOS) vs elevation (Android)
   * @default true
   */
  useNativeShadow?: boolean;
  
  /**
   * Whether to apply surface color tinting in dark theme
   * @default true
   */
  useSurfaceTint?: boolean;
  
  /**
   * Custom background color (overrides theme surface color)
   */
  backgroundColor?: string;
  
  /**
   * Border radius for the surface
   */
  borderRadius?: number;
  
  /**
   * Whether the surface should be pressable (adds ripple effect)
   * @default false
   */
  pressable?: boolean;
  
  /**
   * Callback for press events (only used if pressable is true)
   */
  onPress?: () => void;
  
  /**
   * Accessibility label for the surface
   */
  accessibilityLabel?: string;
  
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

// ============================================================================
// ElevatedSurface Component
// ============================================================================

export const ElevatedSurface: React.FC<ElevatedSurfaceProps> = ({
  level = ELEVATION_LEVELS.CARD,
  children,
  style,
  useNativeShadow = true,
  useSurfaceTint = true,
  backgroundColor,
  borderRadius = 8,
  pressable = false,
  onPress,
  accessibilityLabel,
  testID,
}) => {
  const { getCurrentColors, getMaterialConfig, themeMode } = useEnhancedTheme();
  
  const colors = getCurrentColors();
  const materialConfig = getMaterialConfig();
  const isDark = themeMode === 'dark';
  
  // Get elevation style for the specified level
  const elevationStyle = getElevationByLevel(materialConfig.elevation, level);
  
  // Apply elevation styles
  const appliedElevation = applyElevation(elevationStyle, isDark, useNativeShadow);
  
  // Determine surface background color
  const surfaceColor = backgroundColor || 
    (useSurfaceTint ? getSurfaceColor(level, colors, isDark) : colors.surface);
  
  // Combine all styles
  const combinedStyle: ViewStyle = {
    ...appliedElevation,
    backgroundColor: surfaceColor,
    borderRadius,
    ...style,
  };
  
  // Handle pressable surfaces
  if (pressable && onPress) {
    return (
      <View
        style={[styles.surface, combinedStyle]}
        onTouchEnd={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        testID={testID}
      >
        {children}
      </View>
    );
  }
  
  return (
    <View
      style={[styles.surface, combinedStyle]}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </View>
  );
};

// ============================================================================
// Semantic Surface Components
// ============================================================================

/**
 * Card surface with level 1 elevation
 */
export const CardSurface: React.FC<Omit<ElevatedSurfaceProps, 'level'>> = (props) => (
  <ElevatedSurface level={ELEVATION_LEVELS.CARD} {...props} />
);

/**
 * Button surface with level 2 elevation
 */
export const ButtonSurface: React.FC<Omit<ElevatedSurfaceProps, 'level'>> = (props) => (
  <ElevatedSurface level={ELEVATION_LEVELS.BUTTON} {...props} />
);

/**
 * Dialog surface with level 3 elevation
 */
export const DialogSurface: React.FC<Omit<ElevatedSurfaceProps, 'level'>> = (props) => (
  <ElevatedSurface level={ELEVATION_LEVELS.DIALOG} {...props} />
);

/**
 * Navigation surface with level 4 elevation
 */
export const NavigationSurface: React.FC<Omit<ElevatedSurfaceProps, 'level'>> = (props) => (
  <ElevatedSurface level={ELEVATION_LEVELS.NAVIGATION} {...props} />
);

/**
 * Floating surface with level 5 elevation
 */
export const FloatingSurface: React.FC<Omit<ElevatedSurfaceProps, 'level'>> = (props) => (
  <ElevatedSurface level={ELEVATION_LEVELS.FLOATING} {...props} />
);

// ============================================================================
// Specialized Surface Components
// ============================================================================

/**
 * Animated surface that can transition between elevation levels
 */
interface AnimatedElevatedSurfaceProps extends ElevatedSurfaceProps {
  /**
   * Target elevation level for animation
   */
  targetLevel?: ElevationLevel;
  
  /**
   * Animation duration in milliseconds
   */
  animationDuration?: number;
}

export const AnimatedElevatedSurface: React.FC<AnimatedElevatedSurfaceProps> = ({
  level = ELEVATION_LEVELS.CARD,
  targetLevel,
  animationDuration = 200,
  ...props
}) => {
  // For now, use the target level if provided, otherwise use the base level
  // In a full implementation, you would use React Native's Animated API
  const effectiveLevel = targetLevel || level;
  
  return <ElevatedSurface level={effectiveLevel} {...props} />;
};

/**
 * Interactive surface that changes elevation on press
 */
interface InteractiveSurfaceProps extends Omit<ElevatedSurfaceProps, 'pressable'> {
  /**
   * Elevation level when pressed
   */
  pressedLevel?: ElevationLevel;
  
  /**
   * Whether the surface is currently pressed
   */
  isPressed?: boolean;
}

export const InteractiveSurface: React.FC<InteractiveSurfaceProps> = ({
  level = ELEVATION_LEVELS.BUTTON,
  pressedLevel = ELEVATION_LEVELS.CARD,
  isPressed = false,
  ...props
}) => {
  const effectiveLevel = isPressed ? pressedLevel : level;
  
  return (
    <ElevatedSurface
      level={effectiveLevel}
      pressable={true}
      {...props}
    />
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  surface: {
    // Base surface styles
    overflow: 'hidden', // Ensures content respects border radius
  },
});

// ============================================================================
// Export Types for External Use
// ============================================================================

export type { ElevatedSurfaceProps, AnimatedElevatedSurfaceProps, InteractiveSurfaceProps };
export { ELEVATION_LEVELS };