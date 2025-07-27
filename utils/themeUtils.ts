/**
 * Theme Utilities
 * 
 * Utility functions for theme validation, color manipulation, and theme management
 */

import { 
  ColorPalette, 
  ThemeCollection, 
  CustomTheme, 
  ColorValidationResult, 
  ThemeValidator,
  LegacyTheme,
  MaterialDesignConfig 
} from '../types/theme';

// ============================================================================
// Color Utility Functions
// ============================================================================

/**
 * Convert hex color to RGB values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Calculate relative luminance of a color
 */
export const getRelativeLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  
  // Convert to sRGB
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

/**
 * Calculate contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Determine WCAG compliance level based on contrast ratio
 */
export const getWCAGLevel = (contrastRatio: number): 'AA' | 'AAA' | 'fail' => {
  if (contrastRatio >= 7.0) return 'AAA';
  if (contrastRatio >= 4.5) return 'AA';
  return 'fail';
};

// ============================================================================
// Theme Validation
// ============================================================================

/**
 * Validate color accessibility for a color palette
 */
export const validateColorPalette = (palette: ColorPalette): ColorValidationResult[] => {
  const results: ColorValidationResult[] = [];
  
  // Define critical color pairs to validate
  const colorPairs: Array<{ foreground: keyof ColorPalette; background: keyof ColorPalette; name: string }> = [
    { foreground: 'onBackground', background: 'background', name: 'Text on Background' },
    { foreground: 'onSurface', background: 'surface', name: 'Text on Surface' },
    { foreground: 'onPrimary', background: 'primary', name: 'Text on Primary' },
    { foreground: 'onSecondary', background: 'secondary', name: 'Text on Secondary' },
    { foreground: 'onError', background: 'error', name: 'Text on Error' },
    { foreground: 'text', background: 'background', name: 'Legacy Text on Background' },
  ];

  colorPairs.forEach(({ foreground, background, name }) => {
    const foregroundColor = palette[foreground];
    const backgroundColor = palette[background];
    
    if (foregroundColor && backgroundColor) {
      const contrastRatio = getContrastRatio(foregroundColor, backgroundColor);
      const wcagLevel = getWCAGLevel(contrastRatio);
      
      results.push({
        isValid: wcagLevel !== 'fail',
        contrastRatio,
        wcagLevel,
        suggestions: wcagLevel === 'fail' ? [
          `Increase contrast between ${name} colors`,
          `Current ratio: ${contrastRatio.toFixed(2)}, minimum required: 4.5`
        ] : undefined,
      });
    }
  });

  return results;
};

/**
 * Validate a custom theme
 */
export const validateCustomTheme = (theme: CustomTheme): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate required fields
  if (!theme.id || theme.id.trim() === '') {
    errors.push('Theme ID is required');
  }

  if (!theme.name || theme.name.trim() === '') {
    errors.push('Theme name is required');
  }

  // Validate color palettes
  const lightPalette = {
    ...theme.light,
    ...theme.customColors.light,
  } as ColorPalette;

  const darkPalette = {
    ...theme.dark,
    ...theme.customColors.dark,
  } as ColorPalette;

  const lightValidation = validateColorPalette(lightPalette);
  const darkValidation = validateColorPalette(darkPalette);

  const failedLightValidations = lightValidation.filter(v => !v.isValid);
  const failedDarkValidations = darkValidation.filter(v => !v.isValid);

  if (failedLightValidations.length > 0) {
    errors.push(`Light theme accessibility issues: ${failedLightValidations.length} color pairs fail WCAG standards`);
  }

  if (failedDarkValidations.length > 0) {
    errors.push(`Dark theme accessibility issues: ${failedDarkValidations.length} color pairs fail WCAG standards`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Theme validator implementation
 */
export const themeValidator: ThemeValidator = {
  validateColorPalette,
  validateCustomTheme,
  suggestColorAdjustments: (color: string, background: string): string[] => {
    const currentRatio = getContrastRatio(color, background);
    const suggestions: string[] = [];

    if (currentRatio < 4.5) {
      suggestions.push('Increase color contrast to meet WCAG AA standards (4.5:1 minimum)');
      
      if (currentRatio < 3.0) {
        suggestions.push('Consider using a completely different color combination');
      } else {
        suggestions.push('Try darkening the text color or lightening the background');
      }
    }

    if (currentRatio < 7.0 && currentRatio >= 4.5) {
      suggestions.push('Consider increasing contrast to meet WCAG AAA standards (7:1) for better accessibility');
    }

    return suggestions;
  },
};

// ============================================================================
// Theme Conversion Utilities
// ============================================================================

/**
 * Convert legacy theme to enhanced color palette
 */
export const convertLegacyTheme = (legacyTheme: LegacyTheme): Partial<ColorPalette> => {
  const { colors } = legacyTheme;
  
  return {
    // Map legacy colors to new structure
    background: colors.background,
    text: colors.text,
    accent: colors.accent,
    secondary: colors.secondary,
    button: colors.button,
    divider: colors.divider,
    
    // Provide sensible defaults for new color tokens
    surface: legacyTheme.dark ? '#1E1E1E' : '#FFFFFF',
    onBackground: colors.text,
    onSurface: colors.text,
    primary: colors.accent,
    onPrimary: legacyTheme.dark ? '#000000' : '#FFFFFF',
    outline: colors.divider,
  };
};

/**
 * Merge custom colors with base theme colors
 */
export const mergeThemeColors = (
  baseColors: ColorPalette, 
  customColors: Partial<ColorPalette>
): ColorPalette => {
  return {
    ...baseColors,
    ...customColors,
  };
};

// ============================================================================
// Theme Management Utilities
// ============================================================================

/**
 * Generate a unique theme ID
 */
export const generateThemeId = (baseName: string): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedName = baseName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${sanitizedName}-${timestamp}-${randomSuffix}`;
};

/**
 * Create a default material design configuration
 */
export const createDefaultMaterialConfig = (isDark: boolean = false): MaterialDesignConfig => {
  const shadowColor = '#000000';
  const baseElevation = isDark ? '#1E1E1E' : '#FFFFFF';
  
  return {
    elevation: {
      level0: { shadowColor, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
      level1: { shadowColor, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 2, elevation: 1, surfaceColor: isDark ? '#232323' : undefined },
      level2: { shadowColor, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.14, shadowRadius: 4, elevation: 2, surfaceColor: isDark ? '#252525' : undefined },
      level3: { shadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.16, shadowRadius: 6, elevation: 3, surfaceColor: isDark ? '#272727' : undefined },
      level4: { shadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 4, surfaceColor: isDark ? '#2C2C2C' : undefined },
      level5: { shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 8, surfaceColor: isDark ? '#2F2F2F' : undefined },
    },
    surfaces: {
      tonal: true,
      elevationOverlay: isDark,
    },
    ripple: {
      enabled: true,
      color: isDark ? '#FFFFFF' : '#000000',
      opacity: 0.12,
      duration: 300,
    },
  };
};

/**
 * Check if a theme collection is valid
 */
export const isValidThemeCollection = (theme: ThemeCollection): boolean => {
  try {
    // Check required properties
    if (!theme.id || !theme.name || !theme.light || !theme.dark) {
      return false;
    }

    // Validate color palettes
    const lightValidation = validateColorPalette(theme.light);
    const darkValidation = validateColorPalette(theme.dark);

    // Check if any critical validations fail
    const criticalFailures = [
      ...lightValidation.filter(v => !v.isValid),
      ...darkValidation.filter(v => !v.isValid),
    ];

    return criticalFailures.length === 0;
  } catch (error) {
    return false;
  }
};