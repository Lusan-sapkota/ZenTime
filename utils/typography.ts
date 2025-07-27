/**
 * Material Design Typography System
 * 
 * This module provides comprehensive typography utilities following Material Design 3
 * typography scale and guidelines for consistent text styling across the app.
 */

import { TextStyle } from 'react-native';
import { ColorPalette } from '../types/theme';

// ============================================================================
// Typography Scale Interface
// ============================================================================

export interface TypographyScale {
  // Display styles - largest text
  displayLarge: TextStyle;
  displayMedium: TextStyle;
  displaySmall: TextStyle;
  
  // Headline styles - prominent text
  headlineLarge: TextStyle;
  headlineMedium: TextStyle;
  headlineSmall: TextStyle;
  
  // Title styles - medium emphasis
  titleLarge: TextStyle;
  titleMedium: TextStyle;
  titleSmall: TextStyle;
  
  // Label styles - small text
  labelLarge: TextStyle;
  labelMedium: TextStyle;
  labelSmall: TextStyle;
  
  // Body styles - reading text
  bodyLarge: TextStyle;
  bodyMedium: TextStyle;
  bodySmall: TextStyle;
}

// ============================================================================
// Font Weight Constants
// ============================================================================

export const FONT_WEIGHTS = {
  LIGHT: '300',
  REGULAR: '400',
  MEDIUM: '500',
  SEMI_BOLD: '600',
  BOLD: '700',
} as const;

// ============================================================================
// Font Family Constants
// ============================================================================

export const FONT_FAMILIES = {
  LIGHT: 'Inter_300Light',
  REGULAR: 'Inter_400Regular',
  MEDIUM: 'Inter_500Medium',
  SEMI_BOLD: 'Inter_600SemiBold',
  BOLD: 'Inter_700Bold',
} as const;

// ============================================================================
// Base Typography Scale
// ============================================================================

/**
 * Creates the base typography scale following Material Design 3 specifications
 */
export const createTypographyScale = (): TypographyScale => ({
  // Display styles - for large, prominent text
  displayLarge: {
    fontFamily: FONT_FAMILIES.REGULAR,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  displayMedium: {
    fontFamily: FONT_FAMILIES.REGULAR,
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  displaySmall: {
    fontFamily: FONT_FAMILIES.REGULAR,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },

  // Headline styles - for prominent headings
  headlineLarge: {
    fontFamily: FONT_FAMILIES.REGULAR,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  headlineMedium: {
    fontFamily: FONT_FAMILIES.REGULAR,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  headlineSmall: {
    fontFamily: FONT_FAMILIES.REGULAR,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },

  // Title styles - for medium emphasis headings
  titleLarge: {
    fontFamily: FONT_FAMILIES.REGULAR,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  titleMedium: {
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  titleSmall: {
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },

  // Label styles - for UI labels and small text
  labelLarge: {
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  labelMedium: {
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  labelSmall: {
    fontFamily: FONT_FAMILIES.MEDIUM,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },

  // Body styles - for reading text
  bodyLarge: {
    fontFamily: FONT_FAMILIES.REGULAR,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILIES.REGULAR,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  bodySmall: {
    fontFamily: FONT_FAMILIES.REGULAR,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
});

// ============================================================================
// Typography with Color Integration
// ============================================================================

/**
 * Creates typography styles with appropriate colors for different contexts
 */
export const createThemedTypography = (colors: ColorPalette) => {
  const baseTypography = createTypographyScale();
  
  return {
    // Primary text styles (high emphasis)
    primary: {
      displayLarge: { ...baseTypography.displayLarge, color: colors.onBackground },
      displayMedium: { ...baseTypography.displayMedium, color: colors.onBackground },
      displaySmall: { ...baseTypography.displaySmall, color: colors.onBackground },
      headlineLarge: { ...baseTypography.headlineLarge, color: colors.onBackground },
      headlineMedium: { ...baseTypography.headlineMedium, color: colors.onBackground },
      headlineSmall: { ...baseTypography.headlineSmall, color: colors.onBackground },
      titleLarge: { ...baseTypography.titleLarge, color: colors.onSurface },
      titleMedium: { ...baseTypography.titleMedium, color: colors.onSurface },
      titleSmall: { ...baseTypography.titleSmall, color: colors.onSurface },
      bodyLarge: { ...baseTypography.bodyLarge, color: colors.onSurface },
      bodyMedium: { ...baseTypography.bodyMedium, color: colors.onSurface },
      bodySmall: { ...baseTypography.bodySmall, color: colors.onSurface },
      labelLarge: { ...baseTypography.labelLarge, color: colors.onSurface },
      labelMedium: { ...baseTypography.labelMedium, color: colors.onSurface },
      labelSmall: { ...baseTypography.labelSmall, color: colors.onSurface },
    },

    // Secondary text styles (medium emphasis)
    secondary: {
      displayLarge: { ...baseTypography.displayLarge, color: colors.onSurfaceVariant },
      displayMedium: { ...baseTypography.displayMedium, color: colors.onSurfaceVariant },
      displaySmall: { ...baseTypography.displaySmall, color: colors.onSurfaceVariant },
      headlineLarge: { ...baseTypography.headlineLarge, color: colors.onSurfaceVariant },
      headlineMedium: { ...baseTypography.headlineMedium, color: colors.onSurfaceVariant },
      headlineSmall: { ...baseTypography.headlineSmall, color: colors.onSurfaceVariant },
      titleLarge: { ...baseTypography.titleLarge, color: colors.onSurfaceVariant },
      titleMedium: { ...baseTypography.titleMedium, color: colors.onSurfaceVariant },
      titleSmall: { ...baseTypography.titleSmall, color: colors.onSurfaceVariant },
      bodyLarge: { ...baseTypography.bodyLarge, color: colors.onSurfaceVariant },
      bodyMedium: { ...baseTypography.bodyMedium, color: colors.onSurfaceVariant },
      bodySmall: { ...baseTypography.bodySmall, color: colors.onSurfaceVariant },
      labelLarge: { ...baseTypography.labelLarge, color: colors.onSurfaceVariant },
      labelMedium: { ...baseTypography.labelMedium, color: colors.onSurfaceVariant },
      labelSmall: { ...baseTypography.labelSmall, color: colors.onSurfaceVariant },
    },

    // Accent text styles (using primary color)
    accent: {
      displayLarge: { ...baseTypography.displayLarge, color: colors.primary },
      displayMedium: { ...baseTypography.displayMedium, color: colors.primary },
      displaySmall: { ...baseTypography.displaySmall, color: colors.primary },
      headlineLarge: { ...baseTypography.headlineLarge, color: colors.primary },
      headlineMedium: { ...baseTypography.headlineMedium, color: colors.primary },
      headlineSmall: { ...baseTypography.headlineSmall, color: colors.primary },
      titleLarge: { ...baseTypography.titleLarge, color: colors.primary },
      titleMedium: { ...baseTypography.titleMedium, color: colors.primary },
      titleSmall: { ...baseTypography.titleSmall, color: colors.primary },
      bodyLarge: { ...baseTypography.bodyLarge, color: colors.primary },
      bodyMedium: { ...baseTypography.bodyMedium, color: colors.primary },
      bodySmall: { ...baseTypography.bodySmall, color: colors.primary },
      labelLarge: { ...baseTypography.labelLarge, color: colors.primary },
      labelMedium: { ...baseTypography.labelMedium, color: colors.primary },
      labelSmall: { ...baseTypography.labelSmall, color: colors.primary },
    },

    // Error text styles
    error: {
      bodyLarge: { ...baseTypography.bodyLarge, color: colors.error },
      bodyMedium: { ...baseTypography.bodyMedium, color: colors.error },
      bodySmall: { ...baseTypography.bodySmall, color: colors.error },
      labelLarge: { ...baseTypography.labelLarge, color: colors.error },
      labelMedium: { ...baseTypography.labelMedium, color: colors.error },
      labelSmall: { ...baseTypography.labelSmall, color: colors.error },
    },

    // On-surface text styles (for use on colored backgrounds)
    onPrimary: {
      titleMedium: { ...baseTypography.titleMedium, color: colors.onPrimary },
      bodyMedium: { ...baseTypography.bodyMedium, color: colors.onPrimary },
      labelLarge: { ...baseTypography.labelLarge, color: colors.onPrimary },
    },

    onSecondary: {
      titleMedium: { ...baseTypography.titleMedium, color: colors.onSecondary },
      bodyMedium: { ...baseTypography.bodyMedium, color: colors.onSecondary },
      labelLarge: { ...baseTypography.labelLarge, color: colors.onSecondary },
    },
  };
};

// ============================================================================
// Spacing System
// ============================================================================

/**
 * Material Design spacing scale (4dp base unit)
 */
export const SPACING = {
  XS: 4,    // 4dp
  SM: 8,    // 8dp
  MD: 16,   // 16dp
  LG: 24,   // 24dp
  XL: 32,   // 32dp
  XXL: 48,  // 48dp
  XXXL: 64, // 64dp
} as const;

/**
 * Semantic spacing values for common use cases
 */
export const SEMANTIC_SPACING = {
  // Component internal spacing
  COMPONENT_PADDING_SM: SPACING.SM,
  COMPONENT_PADDING_MD: SPACING.MD,
  COMPONENT_PADDING_LG: SPACING.LG,
  
  // Element margins
  ELEMENT_MARGIN_SM: SPACING.SM,
  ELEMENT_MARGIN_MD: SPACING.MD,
  ELEMENT_MARGIN_LG: SPACING.LG,
  
  // Section spacing
  SECTION_SPACING: SPACING.XL,
  SECTION_SPACING_LG: SPACING.XXL,
  
  // Screen padding
  SCREEN_PADDING: SPACING.LG,
  SCREEN_PADDING_SM: SPACING.MD,
  
  // List item spacing
  LIST_ITEM_PADDING: SPACING.MD,
  LIST_ITEM_MARGIN: SPACING.SM,
  
  // Button spacing
  BUTTON_PADDING_HORIZONTAL: SPACING.MD,
  BUTTON_PADDING_VERTICAL: SPACING.SM,
  BUTTON_MARGIN: SPACING.SM,
  
  // Card spacing
  CARD_PADDING: SPACING.LG,
  CARD_MARGIN: SPACING.MD,
} as const;

// ============================================================================
// Typography Utility Functions
// ============================================================================

/**
 * Creates a text style with proper line height based on font size
 */
export const createTextStyle = (
  fontSize: number,
  fontFamily: string = FONT_FAMILIES.REGULAR,
  color?: string
): TextStyle => ({
  fontSize,
  fontFamily,
  lineHeight: Math.round(fontSize * 1.4), // 1.4 ratio for good readability
  color,
});

/**
 * Creates responsive typography that scales based on screen size
 */
export const createResponsiveTypography = (
  baseSize: number,
  scaleFactor: number = 1
): TextStyle => ({
  fontSize: Math.round(baseSize * scaleFactor),
  lineHeight: Math.round(baseSize * scaleFactor * 1.4),
});

/**
 * Applies text truncation with ellipsis
 * 
 * Note: 'numberOfLines' and 'ellipsizeMode' are not part of TextStyle and should be set on the <Text> component.
 */
export const createTruncatedTextStyle = (): TextStyle => ({});

// ============================================================================
// Accessibility Typography Helpers
// ============================================================================

/**
 * Creates typography styles that meet accessibility contrast requirements
 */
export const createAccessibleTypography = (
  colors: ColorPalette,
  highContrast: boolean = false
) => {
  const baseTypography = createThemedTypography(colors);
  
  if (!highContrast) {
    return baseTypography;
  }
  
  // For high contrast mode, use stronger color contrasts
  return {
    ...baseTypography,
    primary: {
      ...baseTypography.primary,
      displayLarge: { ...baseTypography.primary.displayLarge, color: colors.onBackground },
      headlineLarge: { ...baseTypography.primary.headlineLarge, color: colors.onBackground },
      titleLarge: { ...baseTypography.primary.titleLarge, color: colors.onSurface },
      bodyLarge: { ...baseTypography.primary.bodyLarge, color: colors.onSurface },
    },
    secondary: {
      ...baseTypography.secondary,
      // Use primary text color for better contrast in high contrast mode
      bodyLarge: { ...baseTypography.secondary.bodyLarge, color: colors.onSurface },
      bodyMedium: { ...baseTypography.secondary.bodyMedium, color: colors.onSurface },
    },
  };
};

/**
 * Gets minimum font size for accessibility compliance
 */
export const getAccessibleFontSize = (baseFontSize: number, minSize: number = 12): number => {
  return Math.max(baseFontSize, minSize);
};

// ============================================================================
// Export Default Typography Scale
// ============================================================================

export const defaultTypography = createTypographyScale();