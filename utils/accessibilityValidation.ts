/**
 * Accessibility Validation and Improvement Utilities
 * 
 * This file provides comprehensive accessibility validation and improvement
 * utilities for the enhanced theming system, ensuring WCAG compliance.
 */

import { 
  ColorPalette, 
  ThemeCollection, 
  AccessibilityConfig,
  ColorValidationResult 
} from '../types/theme';

// ============================================================================
// WCAG Color Contrast Validation
// ============================================================================

/**
 * Calculate relative luminance according to WCAG 2.1
 */
function getRelativeLuminance(color: string): number {
  // Remove # if present and handle 3-digit hex
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  // Convert to RGB values (0-1)
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  // Apply gamma correction
  const sRGB = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  // Calculate relative luminance using WCAG formula
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine WCAG compliance level
 */
export function getWCAGComplianceLevel(
  contrastRatio: number, 
  isLargeText: boolean = false
): 'AAA' | 'AA' | 'fail' {
  const aaThreshold = isLargeText ? 3.0 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7.0;
  
  if (contrastRatio >= aaaThreshold) return 'AAA';
  if (contrastRatio >= aaThreshold) return 'AA';
  return 'fail';
}

/**
 * Validate a single color combination
 */
export function validateColorCombination(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): ColorValidationResult {
  const contrastRatio = calculateContrastRatio(foreground, background);
  const wcagLevel = getWCAGComplianceLevel(contrastRatio, isLargeText);
  
  const suggestions: string[] = [];
  
  if (wcagLevel === 'fail') {
    const requiredRatio = isLargeText ? 3.0 : 4.5;
    const improvement = requiredRatio / contrastRatio;
    
    suggestions.push(`Current contrast ratio ${contrastRatio.toFixed(2)} is below WCAG ${isLargeText ? 'AA Large' : 'AA'} standard`);
    suggestions.push(`Needs ${improvement.toFixed(1)}x improvement to meet accessibility standards`);
    
    if (getRelativeLuminance(foreground) > getRelativeLuminance(background)) {
      suggestions.push('Consider darkening the text color or lightening the background');
    } else {
      suggestions.push('Consider lightening the text color or darkening the background');
    }
  }
  
  return {
    isValid: wcagLevel !== 'fail',
    contrastRatio,
    wcagLevel,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}

// ============================================================================
// Comprehensive Theme Accessibility Validation
// ============================================================================

/**
 * Critical color combinations that must meet accessibility standards
 */
const CRITICAL_COLOR_COMBINATIONS = [
  { fg: 'onBackground', bg: 'background', name: 'Primary Text', isLarge: false },
  { fg: 'onSurface', bg: 'surface', name: 'Surface Text', isLarge: false },
  { fg: 'onPrimary', bg: 'primary', name: 'Primary Button Text', isLarge: false },
  { fg: 'onSecondary', bg: 'secondary', name: 'Secondary Button Text', isLarge: false },
  { fg: 'onError', bg: 'error', name: 'Error Text', isLarge: false },
  { fg: 'onSurfaceVariant', bg: 'surfaceVariant', name: 'Secondary Text', isLarge: false },
  { fg: 'onPrimaryContainer', bg: 'primaryContainer', name: 'Primary Container Text', isLarge: false },
  { fg: 'onSecondaryContainer', bg: 'secondaryContainer', name: 'Secondary Container Text', isLarge: false },
  { fg: 'onTertiaryContainer', bg: 'tertiaryContainer', name: 'Tertiary Container Text', isLarge: false },
];

/**
 * Validate all critical color combinations in a palette
 */
export function validateColorPalette(palette: ColorPalette): {
  isValid: boolean;
  results: Array<{
    name: string;
    validation: ColorValidationResult;
  }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    aaLevel: number;
    aaaLevel: number;
  };
} {
  const results: Array<{ name: string; validation: ColorValidationResult }> = [];
  
  CRITICAL_COLOR_COMBINATIONS.forEach(({ fg, bg, name, isLarge }) => {
    const foregroundColor = palette[fg as keyof ColorPalette];
    const backgroundColor = palette[bg as keyof ColorPalette];
    
    if (foregroundColor && backgroundColor) {
      const validation = validateColorCombination(foregroundColor, backgroundColor, isLarge);
      results.push({ name, validation });
    }
  });
  
  // Calculate summary
  const total = results.length;
  const passed = results.filter(r => r.validation.isValid).length;
  const failed = total - passed;
  const aaLevel = results.filter(r => r.validation.wcagLevel === 'AA' || r.validation.wcagLevel === 'AAA').length;
  const aaaLevel = results.filter(r => r.validation.wcagLevel === 'AAA').length;
  
  return {
    isValid: failed === 0,
    results,
    summary: {
      total,
      passed,
      failed,
      aaLevel,
      aaaLevel,
    },
  };
}

/**
 * Validate an entire theme collection
 */
export function validateThemeCollection(theme: ThemeCollection): {
  isValid: boolean;
  lightValidation: ReturnType<typeof validateColorPalette>;
  darkValidation: ReturnType<typeof validateColorPalette>;
  recommendations: string[];
} {
  const lightValidation = validateColorPalette(theme.light);
  const darkValidation = validateColorPalette(theme.dark);
  
  const recommendations: string[] = [];
  
  if (!lightValidation.isValid) {
    recommendations.push(`Light theme has ${lightValidation.summary.failed} accessibility issues`);
  }
  
  if (!darkValidation.isValid) {
    recommendations.push(`Dark theme has ${darkValidation.summary.failed} accessibility issues`);
  }
  
  if (lightValidation.summary.aaaLevel < lightValidation.summary.total * 0.8) {
    recommendations.push('Consider improving color contrast to achieve AAA level compliance');
  }
  
  return {
    isValid: lightValidation.isValid && darkValidation.isValid,
    lightValidation,
    darkValidation,
    recommendations,
  };
}

// ============================================================================
// Color Adjustment Utilities
// ============================================================================

/**
 * Adjust color brightness to improve contrast
 */
export function adjustColorForContrast(
  color: string,
  backgroundColor: string,
  targetRatio: number = 4.5
): string {
  const currentRatio = calculateContrastRatio(color, backgroundColor);
  
  if (currentRatio >= targetRatio) {
    return color; // Already meets target
  }
  
  // Convert to HSL for easier manipulation
  const hsl = hexToHsl(color);
  const bgLuminance = getRelativeLuminance(backgroundColor);
  
  // Determine if we should make the color lighter or darker
  const shouldLighten = bgLuminance < 0.5;
  
  // Binary search for the right lightness value
  let minL = shouldLighten ? hsl.l : 0;
  let maxL = shouldLighten ? 1 : hsl.l;
  let bestL = hsl.l;
  let bestRatio = currentRatio;
  
  for (let i = 0; i < 20; i++) { // Max 20 iterations
    const testL = (minL + maxL) / 2;
    const testColor = hslToHex({ ...hsl, l: testL });
    const testRatio = calculateContrastRatio(testColor, backgroundColor);
    
    if (testRatio >= targetRatio && testRatio > bestRatio) {
      bestL = testL;
      bestRatio = testRatio;
    }
    
    if (testRatio < targetRatio) {
      if (shouldLighten) {
        minL = testL;
      } else {
        maxL = testL;
      }
    } else {
      if (shouldLighten) {
        maxL = testL;
      } else {
        minL = testL;
      }
    }
  }
  
  return hslToHex({ ...hsl, l: bestL });
}

/**
 * Generate accessible color suggestions
 */
export function generateAccessibleColorSuggestions(
  originalColor: string,
  backgroundColor: string,
  targetRatio: number = 4.5
): string[] {
  const suggestions: string[] = [];
  
  // Try different adjustment approaches
  const approaches = [
    { name: 'Darker', factor: 0.8 },
    { name: 'Much Darker', factor: 0.6 },
    { name: 'Lighter', factor: 1.2 },
    { name: 'Much Lighter', factor: 1.4 },
  ];
  
  approaches.forEach(({ factor }) => {
    const adjusted = adjustColorBrightness(originalColor, factor);
    const ratio = calculateContrastRatio(adjusted, backgroundColor);
    
    if (ratio >= targetRatio) {
      suggestions.push(adjusted);
    }
  });
  
  // If no simple adjustments work, use the precise adjustment
  if (suggestions.length === 0) {
    const preciseAdjustment = adjustColorForContrast(originalColor, backgroundColor, targetRatio);
    suggestions.push(preciseAdjustment);
  }
  
  return [...new Set(suggestions)]; // Remove duplicates
}

// ============================================================================
// Color Space Conversion Utilities
// ============================================================================

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.substr(1, 2), 16) / 255;
  const g = parseInt(hex.substr(3, 2), 16) / 255;
  const b = parseInt(hex.substr(5, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return { h, s, l };
}

function hslToHex({ h, s, l }: { h: number; s: number; l: number }): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function adjustColorBrightness(hex: string, factor: number): string {
  const hsl = hexToHsl(hex);
  hsl.l = Math.max(0, Math.min(1, hsl.l * factor));
  return hslToHex(hsl);
}

// ============================================================================
// Accessibility Testing Suite
// ============================================================================

/**
 * Run comprehensive accessibility tests on all themes
 */
export async function runAccessibilityTests(themes: ThemeCollection[]): Promise<{
  passed: boolean;
  results: Array<{
    themeId: string;
    themeName: string;
    validation: ReturnType<typeof validateThemeCollection>;
  }>;
  summary: {
    totalThemes: number;
    passedThemes: number;
    failedThemes: number;
    totalCombinations: number;
    passedCombinations: number;
    failedCombinations: number;
  };
}> {
  const results: Array<{
    themeId: string;
    themeName: string;
    validation: ReturnType<typeof validateThemeCollection>;
  }> = [];
  
  let totalCombinations = 0;
  let passedCombinations = 0;
  let failedCombinations = 0;
  
  for (const theme of themes) {
    const validation = validateThemeCollection(theme);
    results.push({
      themeId: theme.id,
      themeName: theme.name,
      validation,
    });
    
    totalCombinations += validation.lightValidation.summary.total + validation.darkValidation.summary.total;
    passedCombinations += validation.lightValidation.summary.passed + validation.darkValidation.summary.passed;
    failedCombinations += validation.lightValidation.summary.failed + validation.darkValidation.summary.failed;
  }
  
  const passedThemes = results.filter(r => r.validation.isValid).length;
  const failedThemes = results.length - passedThemes;
  
  return {
    passed: failedThemes === 0,
    results,
    summary: {
      totalThemes: results.length,
      passedThemes,
      failedThemes,
      totalCombinations,
      passedCombinations,
      failedCombinations,
    },
  };
}

/**
 * Generate accessibility report
 */
export function generateAccessibilityReport(
  testResults: Awaited<ReturnType<typeof runAccessibilityTests>>
): string {
  let report = '# Accessibility Validation Report\n\n';
  
  report += `**Overall Status:** ${testResults.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
  
  report += '## Summary\n\n';
  report += `- **Themes Tested:** ${testResults.summary.totalThemes}\n`;
  report += `- **Themes Passed:** ${testResults.summary.passedThemes}\n`;
  report += `- **Themes Failed:** ${testResults.summary.failedThemes}\n`;
  report += `- **Color Combinations Tested:** ${testResults.summary.totalCombinations}\n`;
  report += `- **Combinations Passed:** ${testResults.summary.passedCombinations}\n`;
  report += `- **Combinations Failed:** ${testResults.summary.failedCombinations}\n\n`;
  
  report += '## Theme Details\n\n';
  
  testResults.results.forEach(({ themeId, themeName, validation }) => {
    report += `### ${themeName} (${themeId})\n\n`;
    report += `**Status:** ${validation.isValid ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    if (!validation.isValid) {
      report += '**Issues:**\n';
      validation.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
      report += '\n';
    }
    
    report += `**Light Theme:** ${validation.lightValidation.summary.passed}/${validation.lightValidation.summary.total} passed\n`;
    report += `**Dark Theme:** ${validation.darkValidation.summary.passed}/${validation.darkValidation.summary.total} passed\n\n`;
  });
  
  return report;
}