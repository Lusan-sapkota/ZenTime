/**
 * Theme Validation and Registry Utilities
 * 
 * This file contains validation functions for color accessibility,
 * theme collection registry, and lookup functions for the enhanced theming system.
 */

import { 
  ColorPalette, 
  ThemeCollection, 
  CustomTheme, 
  ColorValidationResult,
  ThemeValidator 
} from '../types/theme';
import { defaultThemeCollections } from '../constants/themes';

// ============================================================================
// Color Accessibility Validation
// ============================================================================

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 guidelines
 */
function getRelativeLuminance(color: string): number {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  // Apply gamma correction
  const sRGB = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  // Calculate relative luminance
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine WCAG compliance level based on contrast ratio
 */
function getWCAGLevel(contrastRatio: number, isLargeText: boolean = false): 'AA' | 'AAA' | 'fail' {
  const aaThreshold = isLargeText ? 3.0 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7.0;
  
  if (contrastRatio >= aaaThreshold) return 'AAA';
  if (contrastRatio >= aaThreshold) return 'AA';
  return 'fail';
}

/**
 * Generate color adjustment suggestions for better accessibility
 */
function suggestColorAdjustments(color: string, background: string): string[] {
  const contrastRatio = getContrastRatio(color, background);
  const suggestions: string[] = [];
  
  if (contrastRatio < 4.5) {
    suggestions.push('Increase contrast by darkening the text color or lightening the background');
    suggestions.push('Consider using a different color combination');
    
    if (contrastRatio < 3.0) {
      suggestions.push('Current contrast is very low - significant changes needed for accessibility');
    }
  }
  
  return suggestions;
}

/**
 * Validate a complete color palette for accessibility
 */
function validateColorPalette(palette: ColorPalette): ColorValidationResult[] {
  const results: ColorValidationResult[] = [];
  
  // Critical color combinations to validate
  const criticalCombinations = [
    { foreground: palette.onBackground, background: palette.background, name: 'Text on Background' },
    { foreground: palette.onSurface, background: palette.surface, name: 'Text on Surface' },
    { foreground: palette.onPrimary, background: palette.primary, name: 'Text on Primary' },
    { foreground: palette.onSecondary, background: palette.secondary, name: 'Text on Secondary' },
    { foreground: palette.onError, background: palette.error, name: 'Text on Error' },
    { foreground: palette.onSurfaceVariant, background: palette.surfaceVariant, name: 'Text on Surface Variant' },
  ];
  
  criticalCombinations.forEach(({ foreground, background, name }) => {
    const contrastRatio = getContrastRatio(foreground, background);
    const wcagLevel = getWCAGLevel(contrastRatio);
    const suggestions = wcagLevel === 'fail' ? suggestColorAdjustments(foreground, background) : undefined;
    
    results.push({
      isValid: wcagLevel !== 'fail',
      contrastRatio,
      wcagLevel,
      suggestions,
    });
  });
  
  return results;
}

/**
 * Validate a custom theme for accessibility and completeness
 */
function validateCustomTheme(theme: CustomTheme): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate theme structure
  if (!theme.id || theme.id.trim() === '') {
    errors.push('Theme ID is required');
  }
  
  if (!theme.name || theme.name.trim() === '') {
    errors.push('Theme name is required');
  }
  
  if (!theme.baseTheme || theme.baseTheme.trim() === '') {
    errors.push('Base theme is required');
  }
  
  // Validate light palette accessibility
  if (theme.light) {
    const lightResults = validateColorPalette(theme.light);
    const failedValidations = lightResults.filter(result => !result.isValid);
    
    if (failedValidations.length > 0) {
      errors.push(`Light theme has ${failedValidations.length} accessibility issues`);
    }
  }
  
  // Validate dark palette accessibility
  if (theme.dark) {
    const darkResults = validateColorPalette(theme.dark);
    const failedValidations = darkResults.filter(result => !result.isValid);
    
    if (failedValidations.length > 0) {
      errors.push(`Dark theme has ${failedValidations.length} accessibility issues`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Theme Validator Implementation
// ============================================================================

export const themeValidator: ThemeValidator = {
  validateColorPalette,
  validateCustomTheme,
  suggestColorAdjustments,
};

// ============================================================================
// Theme Collection Registry
// ============================================================================

/**
 * Theme collection registry with lookup and management functions
 */
class ThemeRegistry {
  private themes: Map<string, ThemeCollection> = new Map();
  private customThemes: Map<string, CustomTheme> = new Map();
  
  constructor() {
    // Initialize with default themes
    this.registerDefaultThemes();
  }
  
  /**
   * Register default theme collections
   */
  private registerDefaultThemes(): void {
    defaultThemeCollections.forEach(theme => {
      this.themes.set(theme.id, theme);
    });
  }
  
  /**
   * Get all available theme collections
   */
  getAllThemes(): ThemeCollection[] {
    return Array.from(this.themes.values());
  }
  
  /**
   * Get all custom themes
   */
  getAllCustomThemes(): CustomTheme[] {
    return Array.from(this.customThemes.values());
  }
  
  /**
   * Get a theme by ID
   */
  getThemeById(id: string): ThemeCollection | undefined {
    return this.themes.get(id);
  }
  
  /**
   * Get a custom theme by ID
   */
  getCustomThemeById(id: string): CustomTheme | undefined {
    return this.customThemes.get(id);
  }
  
  /**
   * Check if a theme exists
   */
  hasTheme(id: string): boolean {
    return this.themes.has(id) || this.customThemes.has(id);
  }
  
  /**
   * Register a new theme collection
   */
  registerTheme(theme: ThemeCollection): void {
    this.themes.set(theme.id, theme);
  }
  
  /**
   * Register a custom theme
   */
  registerCustomTheme(theme: CustomTheme): void {
    const validation = validateCustomTheme(theme);
    
    if (!validation.isValid) {
      throw new Error(`Invalid custom theme: ${validation.errors.join(', ')}`);
    }
    
    this.customThemes.set(theme.id, theme);
  }
  
  /**
   * Update an existing custom theme
   */
  updateCustomTheme(id: string, updates: Partial<CustomTheme>): void {
    const existingTheme = this.customThemes.get(id);
    
    if (!existingTheme) {
      throw new Error(`Custom theme with ID "${id}" not found`);
    }
    
    const updatedTheme: CustomTheme = {
      ...existingTheme,
      ...updates,
      updatedAt: new Date(),
    };
    
    const validation = validateCustomTheme(updatedTheme);
    
    if (!validation.isValid) {
      throw new Error(`Invalid theme update: ${validation.errors.join(', ')}`);
    }
    
    this.customThemes.set(id, updatedTheme);
  }
  
  /**
   * Remove a custom theme
   */
  removeCustomTheme(id: string): boolean {
    return this.customThemes.delete(id);
  }
  
  /**
   * Search themes by name or description
   */
  searchThemes(query: string): ThemeCollection[] {
    const searchTerm = query.toLowerCase();
    
    return this.getAllThemes().filter(theme => 
      theme.name.toLowerCase().includes(searchTerm) ||
      theme.description.toLowerCase().includes(searchTerm)
    );
  }
  
  /**
   * Get themes by category (built-in vs custom)
   */
  getThemesByCategory(category: 'built-in' | 'custom'): ThemeCollection[] {
    if (category === 'custom') {
      return this.getAllCustomThemes();
    }
    
    return this.getAllThemes().filter(theme => !theme.isCustom);
  }
  
  /**
   * Get the default theme (Dawn Mist)
   */
  getDefaultTheme(): ThemeCollection {
    const defaultTheme = this.getThemeById('dawn-mist');
    
    if (!defaultTheme) {
      throw new Error('Default theme not found');
    }
    
    return defaultTheme;
  }
  
  /**
   * Validate all registered themes
   */
  validateAllThemes(): { valid: string[]; invalid: { id: string; errors: string[] }[] } {
    const valid: string[] = [];
    const invalid: { id: string; errors: string[] }[] = [];
    
    // Validate built-in themes
    this.getAllThemes().forEach(theme => {
      const lightResults = validateColorPalette(theme.light);
      const darkResults = validateColorPalette(theme.dark);
      
      const lightErrors = lightResults.filter(r => !r.isValid).length;
      const darkErrors = darkResults.filter(r => !r.isValid).length;
      
      if (lightErrors === 0 && darkErrors === 0) {
        valid.push(theme.id);
      } else {
        const errors: string[] = [];
        if (lightErrors > 0) errors.push(`Light theme: ${lightErrors} accessibility issues`);
        if (darkErrors > 0) errors.push(`Dark theme: ${darkErrors} accessibility issues`);
        
        invalid.push({ id: theme.id, errors });
      }
    });
    
    // Validate custom themes
    this.getAllCustomThemes().forEach(theme => {
      const validation = validateCustomTheme(theme);
      
      if (validation.isValid) {
        valid.push(theme.id);
      } else {
        invalid.push({ id: theme.id, errors: validation.errors });
      }
    });
    
    return { valid, invalid };
  }
}

// ============================================================================
// Singleton Theme Registry Instance
// ============================================================================

export const themeRegistry = new ThemeRegistry();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Get all available themes
 */
export function getAllThemes(): ThemeCollection[] {
  return themeRegistry.getAllThemes();
}

/**
 * Get theme by ID with fallback to default
 */
export function getThemeById(id: string): ThemeCollection {
  const theme = themeRegistry.getThemeById(id);
  return theme || themeRegistry.getDefaultTheme();
}

/**
 * Check if theme ID is valid
 */
export function isValidThemeId(id: string): boolean {
  return themeRegistry.hasTheme(id);
}

/**
 * Get theme names for UI selection
 */
export function getThemeOptions(): { id: string; name: string; description: string }[] {
  return themeRegistry.getAllThemes().map(theme => ({
    id: theme.id,
    name: theme.name,
    description: theme.description,
  }));
}

/**
 * Validate color combination for accessibility
 */
export function validateColorCombination(
  foreground: string, 
  background: string
): ColorValidationResult {
  const contrastRatio = getContrastRatio(foreground, background);
  const wcagLevel = getWCAGLevel(contrastRatio);
  const suggestions = wcagLevel === 'fail' ? suggestColorAdjustments(foreground, background) : undefined;
  
  return {
    isValid: wcagLevel !== 'fail',
    contrastRatio,
    wcagLevel,
    suggestions,
  };
}