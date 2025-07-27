/**
 * Material Button Component
 * 
 * A comprehensive button component that implements Material Design principles
 * including elevation, ripple effects, and proper state management.
 */

import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  Animated,
  View,
  Pressable
} from 'react-native';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import { ElevatedSurface, InteractiveSurface } from './ElevatedSurface';
import { ELEVATION_LEVELS } from '../utils/elevationUtils';

// ============================================================================
// Component Props Interface
// ============================================================================

export type ButtonVariant = 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
export type ButtonSize = 'small' | 'medium' | 'large';

interface MaterialButtonProps {
  /**
   * Button text content
   */
  title: string;
  
  /**
   * Button press handler
   */
  onPress: () => void;
  
  /**
   * Button visual variant
   */
  variant?: ButtonVariant;
  
  /**
   * Button size
   */
  size?: ButtonSize;
  
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  
  /**
   * Whether the button is in loading state
   */
  loading?: boolean;
  
  /**
   * Custom button style
   */
  style?: ViewStyle;
  
  /**
   * Custom text style
   */
  textStyle?: TextStyle;
  
  /**
   * Icon component to display before text
   */
  icon?: React.ReactNode;
  
  /**
   * Whether to show ripple effect
   */
  ripple?: boolean;
  
  /**
   * Test ID for testing
   */
  testID?: string;
  
  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

// ============================================================================
// Material Button Component
// ============================================================================

export const MaterialButton: React.FC<MaterialButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  ripple = true,
  testID,
  accessibilityLabel,
}) => {
  const { getCurrentColors, getMaterialConfig, performanceSettings } = useEnhancedTheme();
  const colors = getCurrentColors();
  const materialConfig = getMaterialConfig();
  
  const [isPressed, setIsPressed] = useState(false);
  const [rippleAnimation] = useState(new Animated.Value(0));

  // Get size-specific dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case 'small':
        return { height: 32, paddingHorizontal: 12, fontSize: 14 };
      case 'large':
        return { height: 56, paddingHorizontal: 24, fontSize: 16 };
      case 'medium':
      default:
        return { height: 40, paddingHorizontal: 16, fontSize: 14 };
    }
  };

  const dimensions = getSizeDimensions();

  // Get variant-specific styles
  const getVariantStyles = () => {
    const baseStyle: ViewStyle = {
      height: dimensions.height,
      paddingHorizontal: dimensions.paddingHorizontal,
      borderRadius: dimensions.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    const baseTextStyle: TextStyle = {
      fontSize: dimensions.fontSize,
      fontFamily: 'Inter_500Medium',
      textAlign: 'center',
    };

    switch (variant) {
      case 'filled':
        return {
          container: {
            ...baseStyle,
            backgroundColor: disabled ? colors.outline : colors.primary,
          },
          text: {
            ...baseTextStyle,
            color: disabled ? colors.onSurfaceVariant : colors.onPrimary,
          },
          elevation: disabled ? ELEVATION_LEVELS.BACKGROUND : ELEVATION_LEVELS.BUTTON,
        };

      case 'elevated':
        return {
          container: {
            ...baseStyle,
            backgroundColor: disabled ? colors.outline : colors.surface,
          },
          text: {
            ...baseTextStyle,
            color: disabled ? colors.onSurfaceVariant : colors.primary,
          },
          elevation: disabled ? ELEVATION_LEVELS.BACKGROUND : ELEVATION_LEVELS.BUTTON,
        };

      case 'tonal':
        return {
          container: {
            ...baseStyle,
            backgroundColor: disabled ? colors.outline : colors.secondaryContainer,
          },
          text: {
            ...baseTextStyle,
            color: disabled ? colors.onSurfaceVariant : colors.onSecondaryContainer,
          },
          elevation: ELEVATION_LEVELS.BACKGROUND,
        };

      case 'outlined':
        return {
          container: {
            ...baseStyle,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: disabled ? colors.outline : colors.outline,
          },
          text: {
            ...baseTextStyle,
            color: disabled ? colors.onSurfaceVariant : colors.primary,
          },
          elevation: ELEVATION_LEVELS.BACKGROUND,
        };

      case 'text':
        return {
          container: {
            ...baseStyle,
            backgroundColor: 'transparent',
            paddingHorizontal: 12, // Less padding for text buttons
          },
          text: {
            ...baseTextStyle,
            color: disabled ? colors.onSurfaceVariant : colors.primary,
          },
          elevation: ELEVATION_LEVELS.BACKGROUND,
        };

      default:
        return {
          container: baseStyle,
          text: baseTextStyle,
          elevation: ELEVATION_LEVELS.BACKGROUND,
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Handle press animations
  const handlePressIn = () => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    
    // Animate ripple effect if enabled
    if (ripple && !performanceSettings.reducedMotion) {
      Animated.timing(rippleAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    setIsPressed(false);
    
    // Reset ripple animation
    if (ripple && !performanceSettings.reducedMotion) {
      Animated.timing(rippleAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  };

  const handlePress = () => {
    if (disabled || loading) return;
    onPress();
  };

  // Render ripple effect
  const renderRipple = () => {
    if (!ripple || performanceSettings.reducedMotion || variant === 'text') {
      return null;
    }

    const rippleColor = materialConfig.ripple.color;
    const rippleOpacity = materialConfig.ripple.opacity;

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: rippleColor,
            opacity: rippleAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, rippleOpacity],
            }),
            borderRadius: dimensions.height / 2,
          },
        ]}
        pointerEvents="none"
      />
    );
  };

  // Render button content
  const renderContent = () => (
    <View style={styles.contentContainer}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[variantStyles.text, textStyle]}>
        {loading ? 'Loading...' : title}
      </Text>
    </View>
  );

  // For elevated buttons, use InteractiveSurface
  if (variant === 'elevated' || variant === 'filled') {
    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[variantStyles.container, style]}
        testID={testID}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
      >
        <InteractiveSurface
          level={variantStyles.elevation}
          pressedLevel={ELEVATION_LEVELS.CARD}
          isPressed={isPressed}
          style={{ ...variantStyles.container, height: '100%', width: '100%' }}
        >
          {renderRipple()}
          {renderContent()}
        </InteractiveSurface>
      </Pressable>
    );
  }

  // For other variants, use regular Pressable
  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        variantStyles.container,
        style,
        isPressed && !disabled && { opacity: 0.8 },
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {renderRipple()}
      {renderContent()}
    </Pressable>
  );
};

// ============================================================================
// Specialized Button Components
// ============================================================================

/**
 * Primary action button (filled variant)
 */
export const PrimaryButton: React.FC<Omit<MaterialButtonProps, 'variant'>> = (props) => (
  <MaterialButton variant="filled" {...props} />
);

/**
 * Secondary action button (outlined variant)
 */
export const SecondaryButton: React.FC<Omit<MaterialButtonProps, 'variant'>> = (props) => (
  <MaterialButton variant="outlined" {...props} />
);

/**
 * Tertiary action button (text variant)
 */
export const TertiaryButton: React.FC<Omit<MaterialButtonProps, 'variant'>> = (props) => (
  <MaterialButton variant="text" {...props} />
);

/**
 * Elevated action button
 */
export const ElevatedButton: React.FC<Omit<MaterialButtonProps, 'variant'>> = (props) => (
  <MaterialButton variant="elevated" {...props} />
);

/**
 * Tonal action button
 */
export const TonalButton: React.FC<Omit<MaterialButtonProps, 'variant'>> = (props) => (
  <MaterialButton variant="tonal" {...props} />
);

// ============================================================================
// Floating Action Button
// ============================================================================

interface FABProps {
  /**
   * FAB press handler
   */
  onPress: () => void;
  
  /**
   * Icon component to display
   */
  icon: React.ReactNode;
  
  /**
   * FAB size variant
   */
  size?: 'small' | 'large';
  
  /**
   * Whether the FAB is disabled
   */
  disabled?: boolean;
  
  /**
   * Custom style
   */
  style?: ViewStyle;
  
  /**
   * Test ID for testing
   */
  testID?: string;
  
  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  onPress,
  icon,
  size = 'large',
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { getCurrentColors } = useEnhancedTheme();
  const colors = getCurrentColors();
  
  const [isPressed, setIsPressed] = useState(false);
  
  const fabSize = size === 'small' ? 40 : 56;
  
  const fabStyle: ViewStyle = {
    width: fabSize,
    height: fabSize,
    borderRadius: fabSize / 2,
    backgroundColor: disabled ? colors.outline : colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <Pressable
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <InteractiveSurface
        level={ELEVATION_LEVELS.FLOATING}
        pressedLevel={ELEVATION_LEVELS.DIALOG}
        isPressed={isPressed}
        style={StyleSheet.flatten([fabStyle, style])}
      >
        {icon}
      </InteractiveSurface>
    </Pressable>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});

// ============================================================================
// Export Types
// ============================================================================

export type { MaterialButtonProps, FABProps };