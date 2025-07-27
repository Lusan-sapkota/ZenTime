/**
 * Material Design Elevation Utilities
 * 
 * This module provides comprehensive elevation utilities for implementing
 * Material Design depth and shadow systems across light and dark themes.
 */

import { ViewStyle } from 'react-native';
import { ElevationStyle, MaterialElevation, ColorPalette } from '../types/theme';

// ============================================================================
// Elevation Level Constants
// ============================================================================

/**
 * Material Design elevation levels with their semantic meanings
 */
export const ELEVATION_LEVELS = {
  BACKGROUND: 0,    // Background surfaces
  CARD: 1,         // Cards, sheets
  BUTTON: 2,       // Buttons, chips
  DIALOG: 3,       // Dialogs, menus
  NAVIGATION: 4,   // Navigation bars
  FLOATING: 5,     // Floating action buttons
} as const;

export type ElevationLevel = typeof ELEVATION_LEVELS[keyof typeof ELEVATION_LEVELS];

// ============================================================================
// Elevation Style Generators
// ============================================================================

/**
 * Creates elevation style configuration for a given level
 */
export const createElevationStyle = (
  level: ElevationLevel,
  shadowColor: string = '#000000',
  surfaceColor?: string
): ElevationStyle => {
  if (level === 0) {
    return {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
      surfaceColor,
    };
  }

  // Calculate shadow properties based on Material Design specifications
  const shadowHeight = Math.max(1, Math.floor(level / 2));
  const shadowRadius = level * 2;
  const shadowOpacity = Math.min(0.24, 0.1 + (level * 0.02));

  return {
    shadowColor,
    shadowOffset: { width: 0, height: shadowHeight },
    shadowOpacity,
    shadowRadius,
    elevation: level, // Android elevation
    surfaceColor,
  };
};

/**
 * Generates complete elevation configuration for light theme
 */
export const createLightElevation = (shadowColor: string = '#000000'): MaterialElevation => ({
  level0: createElevationStyle(ELEVATION_LEVELS.BACKGROUND, shadowColor),
  level1: createElevationStyle(ELEVATION_LEVELS.CARD, shadowColor),
  level2: createElevationStyle(ELEVATION_LEVELS.BUTTON, shadowColor),
  level3: createElevationStyle(ELEVATION_LEVELS.DIALOG, shadowColor),
  level4: createElevationStyle(ELEVATION_LEVELS.NAVIGATION, shadowColor),
  level5: createElevationStyle(ELEVATION_LEVELS.FLOATING, shadowColor),
});

/**
 * Generates complete elevation configuration for dark theme with surface tints
 */
export const createDarkElevation = (
  shadowColor: string = '#000000',
  baseSurface: string,
  onSurface: string
): MaterialElevation => {
  // Calculate surface tint colors for dark theme elevation
  const getSurfaceTint = (level: ElevationLevel): string => {
    if (level === 0) return baseSurface;
    
    // Apply surface tint overlay based on elevation level
    const tintOpacity = Math.min(0.15, level * 0.025);
    return blendColors(baseSurface, onSurface, tintOpacity);
  };

  return {
    level0: createElevationStyle(ELEVATION_LEVELS.BACKGROUND, shadowColor, getSurfaceTint(0)),
    level1: createElevationStyle(ELEVATION_LEVELS.CARD, shadowColor, getSurfaceTint(1)),
    level2: createElevationStyle(ELEVATION_LEVELS.BUTTON, shadowColor, getSurfaceTint(2)),
    level3: createElevationStyle(ELEVATION_LEVELS.DIALOG, shadowColor, getSurfaceTint(3)),
    level4: createElevationStyle(ELEVATION_LEVELS.NAVIGATION, shadowColor, getSurfaceTint(4)),
    level5: createElevationStyle(ELEVATION_LEVELS.FLOATING, shadowColor, getSurfaceTint(5)),
  };
};

// ============================================================================
// Surface Color Utilities
// ============================================================================

/**
 * Blends two colors with specified opacity for surface tinting
 */
export const blendColors = (baseColor: string, overlayColor: string, opacity: number): string => {
  // Simple color blending - in a real implementation, you might want to use a more
  // sophisticated color manipulation library like chroma-js or tinycolor2
  
  // For now, return the base color with a simple opacity calculation
  // This is a simplified implementation - you may want to enhance this
  const baseRgb = hexToRgb(baseColor);
  const overlayRgb = hexToRgb(overlayColor);
  
  if (!baseRgb || !overlayRgb) return baseColor;
  
  const blended = {
    r: Math.round(baseRgb.r * (1 - opacity) + overlayRgb.r * opacity),
    g: Math.round(baseRgb.g * (1 - opacity) + overlayRgb.g * opacity),
    b: Math.round(baseRgb.b * (1 - opacity) + overlayRgb.b * opacity),
  };
  
  return rgbToHex(blended.r, blended.g, blended.b);
};

/**
 * Converts hex color to RGB values
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Converts RGB values to hex color
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Calculates appropriate surface color based on elevation and theme
 */
export const getSurfaceColor = (
  level: ElevationLevel,
  colors: ColorPalette,
  isDark: boolean
): string => {
  if (!isDark) {
    // Light theme uses base surface color
    return colors.surface;
  }
  
  // Dark theme uses surface tinting
  if (level === 0) return colors.background;
  
  const tintOpacity = Math.min(0.15, level * 0.025);
  return blendColors(colors.surface, colors.onSurface, tintOpacity);
};

// ============================================================================
// Elevation Style Application
// ============================================================================

/**
 * Applies elevation styles to React Native ViewStyle
 */
export const applyElevation = (
  elevationStyle: ElevationStyle,
  isDark: boolean = false,
  useNativeShadow: boolean = true
): ViewStyle => {
  const style: ViewStyle = {};
  
  if (isDark && elevationStyle.surfaceColor) {
    // Dark theme: use surface color instead of shadows
    style.backgroundColor = elevationStyle.surfaceColor;
  } else if (useNativeShadow && elevationStyle.elevation > 0) {
    // Light theme: apply shadow styles
    style.shadowColor = elevationStyle.shadowColor;
    style.shadowOffset = elevationStyle.shadowOffset;
    style.shadowOpacity = elevationStyle.shadowOpacity;
    style.shadowRadius = elevationStyle.shadowRadius;
    style.elevation = elevationStyle.elevation; // Android
  }
  
  return style;
};

/**
 * Gets elevation style by level from MaterialElevation configuration
 */
export const getElevationByLevel = (
  materialElevation: MaterialElevation,
  level: ElevationLevel
): ElevationStyle => {
  switch (level) {
    case ELEVATION_LEVELS.BACKGROUND:
      return materialElevation.level0;
    case ELEVATION_LEVELS.CARD:
      return materialElevation.level1;
    case ELEVATION_LEVELS.BUTTON:
      return materialElevation.level2;
    case ELEVATION_LEVELS.DIALOG:
      return materialElevation.level3;
    case ELEVATION_LEVELS.NAVIGATION:
      return materialElevation.level4;
    case ELEVATION_LEVELS.FLOATING:
      return materialElevation.level5;
    default:
      return materialElevation.level0;
  }
};

// ============================================================================
// Elevation Animation Utilities
// ============================================================================

/**
 * Creates animated elevation transition between two levels
 */
export const createElevationTransition = (
  fromLevel: ElevationLevel,
  toLevel: ElevationLevel,
  materialElevation: MaterialElevation,
  duration: number = 200
) => {
  const fromStyle = getElevationByLevel(materialElevation, fromLevel);
  const toStyle = getElevationByLevel(materialElevation, toLevel);
  
  return {
    from: fromStyle,
    to: toStyle,
    duration,
    easing: 'ease-out' as const,
  };
};

// ============================================================================
// Semantic Elevation Helpers
// ============================================================================

/**
 * Semantic elevation helpers for common UI elements
 */
export const elevationHelpers = {
  /**
   * Background surface (no elevation)
   */
  background: (materialElevation: MaterialElevation) => 
    materialElevation.level0,
    
  /**
   * Card or sheet elevation
   */
  card: (materialElevation: MaterialElevation) => 
    materialElevation.level1,
    
  /**
   * Button elevation (resting state)
   */
  button: (materialElevation: MaterialElevation) => 
    materialElevation.level2,
    
  /**
   * Button elevation (pressed state)
   */
  buttonPressed: (materialElevation: MaterialElevation) => 
    materialElevation.level1,
    
  /**
   * Dialog or menu elevation
   */
  dialog: (materialElevation: MaterialElevation) => 
    materialElevation.level3,
    
  /**
   * Navigation bar elevation
   */
  navigation: (materialElevation: MaterialElevation) => 
    materialElevation.level4,
    
  /**
   * Floating action button elevation
   */
  fab: (materialElevation: MaterialElevation) => 
    materialElevation.level5,
};

// ============================================================================
// Validation and Testing Utilities
// ============================================================================

/**
 * Validates elevation configuration for accessibility and performance
 */
export const validateElevation = (elevation: MaterialElevation): {
  isValid: boolean;
  warnings: string[];
} => {
  const warnings: string[] = [];
  
  // Check for proper elevation progression
  const levels = [
    elevation.level0.elevation,
    elevation.level1.elevation,
    elevation.level2.elevation,
    elevation.level3.elevation,
    elevation.level4.elevation,
    elevation.level5.elevation,
  ];
  
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] <= levels[i - 1]) {
      warnings.push(`Elevation level ${i} should be higher than level ${i - 1}`);
    }
  }
  
  // Check for reasonable shadow opacity values
  [elevation.level1, elevation.level2, elevation.level3, elevation.level4, elevation.level5]
    .forEach((level, index) => {
      if (level.shadowOpacity > 0.3) {
        warnings.push(`Elevation level ${index + 1} has high shadow opacity (${level.shadowOpacity})`);
      }
    });
  
  return {
    isValid: warnings.length === 0,
    warnings,
  };
};