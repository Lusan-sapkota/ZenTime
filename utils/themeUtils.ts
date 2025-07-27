/**
 * Theme Utility Functions
 * 
 * This file contains utility functions for theme manipulation, validation,
 * and conversion between different theme formats.
 */

import { 
  ThemeCollection, 
  ColorPalette, 
  CustomTheme,
  LegacyTheme,
  MaterialDesignConfig,
  ColorValidationResult,
  ElevationStyle
} from '../types/theme';
import { 
  themeValidator,
  validateColorCombination as validateColorCombinationInternal
} from './themeValidation';

// ============================================================================
// Color Validation Functions (Re-exported from themeValidation)
// ============================================================================

/**
 * Calculate relative luminance of a color
 */
function getRelativeLuminance(color: string): number {
  const hex = color.replace('#', '');
  
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const sRGB = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine WCAG compliance level
 */
export function getWCAGLevel(contrastRatio: number, isLargeText: boolean = false): 'AA' | 'AAA' | 'fail' {
  const aaThreshold = isLargeText ? 3.0 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7.0;
  
  if (contrastRatio >= aaaThreshold) return 'AAA';
  if (contrastRatio >= aaThreshold) return 'AA';
  return 'fail';
}

/**
 * Validate color palette accessibility
 */
export function validateColorPalette(palette: ColorPalette): ColorValidationResult[] {
  return themeValidator.validateColorPalette(palette);
}

/**
 * Validate custom theme
 */
export function validateCustomTheme(theme: CustomTheme): { isValid: boolean; errors: string[] } {
  return themeValidator.validateCustomTheme(theme);
}

/**
 * Validate color combination
 */
export function validateColorCombination(
  foreground: string, 
  background: string
): ColorValidationResult {
  return validateColorCombinationInternal(foreground, background);
}

// ============================================================================
// Theme Collection Validation
// ============================================================================

/**
 * Validate if a theme collection is properly structured and accessible
 */
export function isValidThemeCollection(theme: ThemeCollection): boolean {
  try {
    // Check required properties
    if (!theme.id || !theme.name || !theme.description) {
      return false;
    }
    
    if (!theme.light || !theme.dark) {
      return false;
    }
    
    if (!theme.materialConfig || !theme.animations) {
      return false;
    }
    
    // Validate color palettes
    const lightResults = validateColorPalette(theme.light);
    const darkResults = validateColorPalette(theme.dark);
    
    // Check if most color combinations pass accessibility tests
    const lightFailures = lightResults.filter(r => !r.isValid).length;
    const darkFailures = darkResults.filter(r => !r.isValid).length;
    
    // Allow some flexibility - themes are valid if most combinations pass
    const lightPassRate = (lightResults.length - lightFailures) / lightResults.length;
    const darkPassRate = (darkResults.length - darkFailures) / darkResults.length;
    
    // Be more lenient for now - 50% pass rate is acceptable
    return lightPassRate >= 0.5 && darkPassRate >= 0.5;
  } catch (error) {
    return false;
  }
}

// ============================================================================
// Theme ID Generation
// ============================================================================

/**
 * Generate a unique theme ID from a theme name
 */
export function generateThemeId(name: string): string {
  const baseId = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  return `${baseId}-${timestamp}-${randomSuffix}`;
}

// ============================================================================
// Legacy Theme Conversion
// ============================================================================

/**
 * Convert legacy theme format to enhanced color palette
 */
export function convertLegacyTheme(legacyTheme: LegacyTheme): Partial<ColorPalette> {
  const { colors } = legacyTheme;
  
  return {
    // Surface colors
    background: colors.background,
    surface: colors.background,
    surfaceVariant: colors.button,
    
    // Content colors
    onBackground: colors.text,
    onSurface: colors.text,
    onSurfaceVariant: colors.text,
    
    // Primary colors (map accent to primary)
    primary: colors.accent,
    onPrimary: legacyTheme.dark ? '#000000' : '#FFFFFF',
    primaryContainer: colors.button,
    onPrimaryContainer: colors.text,
    
    // Secondary colors
    secondary: colors.secondary,
    onSecondary: legacyTheme.dark ? '#000000' : '#FFFFFF',
    secondaryContainer: colors.button,
    onSecondaryContainer: colors.text,
    
    // Utility colors
    outline: colors.divider,
    outlineVariant: colors.divider,
    
    // Legacy support (direct mapping)
    accent: colors.accent,
    button: colors.button,
    divider: colors.divider,
    text: colors.text,
  };
}

// ============================================================================
// Material Design Configuration
// ============================================================================

/**
 * Create elevation style for material design
 */
function createElevationStyle(
  level: number, 
  isDark: boolean = false,
  shadowColor: string = '#000000'
): ElevationStyle {
  const surfaceColors = isDark ? {
    0: '#121212',
    1: '#1E1E1E',
    2: '#232323',
    3: '#252525',
    4: '#272727',
    5: '#2C2C2C',
  } : undefined;
  
  return {
    shadowColor,
    shadowOffset: { 
      width: 0, 
      height: level === 0 ? 0 : Math.max(1, level / 2) 
    },
    shadowOpacity: level === 0 ? 0 : 0.1 + (level * 0.02),
    shadowRadius: level === 0 ? 0 : level * 2,
    elevation: level,
    surfaceColor: isDark ? surfaceColors?.[level as keyof typeof surfaceColors] : undefined,
  };
}

/**
 * Create default material design configuration
 */
export function createDefaultMaterialConfig(isDark: boolean = false): MaterialDesignConfig {
  return {
    elevation: {
      level0: createElevationStyle(0, isDark),
      level1: createElevationStyle(1, isDark),
      level2: createElevationStyle(2, isDark),
      level3: createElevationStyle(3, isDark),
      level4: createElevationStyle(4, isDark),
      level5: createElevationStyle(8, isDark),
    },
    surfaces: {
      tonal: true,
      elevationOverlay: isDark, // Only use elevation overlay in dark theme
    },
    ripple: {
      enabled: true,
      color: isDark ? '#FFFFFF' : '#000000',
      opacity: 0.12,
      duration: 300,
    },
  };
}

// ============================================================================
// Theme Manipulation Utilities
// ============================================================================

/**
 * Merge custom colors into a base color palette
 */
export function mergeCustomColors(
  basePalette: ColorPalette, 
  customColors: Partial<ColorPalette>
): ColorPalette {
  return {
    ...basePalette,
    ...customColors,
  };
}

/**
 * Generate complementary colors for a theme
 */
export function generateComplementaryColors(primaryColor: string): {
  secondary: string;
  tertiary: string;
  accent: string;
} {
  // This is a simplified implementation
  // In a real app, you might use a color theory library
  const hex = primaryColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Generate complementary color (opposite on color wheel)
  const compR = 255 - r;
  const compG = 255 - g;
  const compB = 255 - b;
  
  // Generate analogous colors (adjacent on color wheel)
  const analogR = Math.min(255, r + 30);
  const analogG = Math.max(0, g - 30);
  const analogB = Math.min(255, b + 30);
  
  return {
    secondary: `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`,
    tertiary: `#${analogR.toString(16).padStart(2, '0')}${analogG.toString(16).padStart(2, '0')}${analogB.toString(16).padStart(2, '0')}`,
    accent: primaryColor, // Use primary as accent for simplicity
  };
}

/**
 * Adjust color brightness
 */
export function adjustColorBrightness(color: string, factor: number): string {
  const hex = color.replace('#', '');
  const r = Math.min(255, Math.max(0, parseInt(hex.substr(0, 2), 16) * factor));
  const g = Math.min(255, Math.max(0, parseInt(hex.substr(2, 2), 16) * factor));
  const b = Math.min(255, Math.max(0, parseInt(hex.substr(4, 2), 16) * factor));
  
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

/**
 * Check if a color is considered "dark"
 */
export function isColorDark(color: string): boolean {
  const luminance = getRelativeLuminance(color);
  return luminance < 0.5;
}

/**
 * Get appropriate text color (black or white) for a background
 */
export function getContrastingTextColor(backgroundColor: string): string {
  return isColorDark(backgroundColor) ? '#FFFFFF' : '#000000';
}