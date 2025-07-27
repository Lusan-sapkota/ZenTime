/**
 * Elevation Utilities Test Suite
 * 
 * Tests for Material Design elevation system utilities including
 * elevation style generation, surface color calculations, and validation.
 */

import {
  createElevationStyle,
  createLightElevation,
  createDarkElevation,
  blendColors,
  getSurfaceColor,
  applyElevation,
  getElevationByLevel,
  elevationHelpers,
  validateElevation,
  ELEVATION_LEVELS,
} from '../utils/elevationUtils';
import { ColorPalette, MaterialElevation } from '../types/theme';

// ============================================================================
// Mock Data
// ============================================================================

const mockColorPalette: ColorPalette = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceVariant: '#E0E0E0',
  surfaceDim: '#EEEEEE',
  surfaceBright: '#FFFFFF',
  onBackground: '#000000',
  onSurface: '#000000',
  onSurfaceVariant: '#666666',
  primary: '#1976D2',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E3F2FD',
  onPrimaryContainer: '#0D47A1',
  primaryFixed: '#1976D2',
  onPrimaryFixed: '#FFFFFF',
  secondary: '#388E3C',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8F5E8',
  onSecondaryContainer: '#2E7D32',
  secondaryFixed: '#388E3C',
  onSecondaryFixed: '#FFFFFF',
  tertiary: '#F57C00',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFF3E0',
  onTertiaryContainer: '#E65100',
  error: '#D32F2F',
  onError: '#FFFFFF',
  errorContainer: '#FFCDD2',
  onErrorContainer: '#B71C1C',
  outline: '#757575',
  outlineVariant: '#BDBDBD',
  shadow: '#000000',
  scrim: '#000000',
  accent: '#1976D2',
  button: '#E0E0E0',
  divider: '#E0E0E0',
  text: '#000000',
};

const mockDarkColorPalette: ColorPalette = {
  ...mockColorPalette,
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  text: '#FFFFFF',
};

// ============================================================================
// Elevation Style Creation Tests
// ============================================================================

describe('createElevationStyle', () => {
  it('should create zero elevation style correctly', () => {
    const style = createElevationStyle(ELEVATION_LEVELS.BACKGROUND);
    
    expect(style.elevation).toBe(0);
    expect(style.shadowOpacity).toBe(0);
    expect(style.shadowRadius).toBe(0);
    expect(style.shadowOffset).toEqual({ width: 0, height: 0 });
    expect(style.shadowColor).toBe('transparent');
  });

  it('should create elevated style with proper shadow properties', () => {
    const style = createElevationStyle(ELEVATION_LEVELS.CARD);
    
    expect(style.elevation).toBe(1);
    expect(style.shadowOpacity).toBeGreaterThan(0);
    expect(style.shadowRadius).toBeGreaterThan(0);
    expect(style.shadowOffset.height).toBeGreaterThan(0);
    expect(style.shadowColor).toBe('#000000');
  });

  it('should scale shadow properties with elevation level', () => {
    const level1 = createElevationStyle(ELEVATION_LEVELS.CARD);
    const level3 = createElevationStyle(ELEVATION_LEVELS.DIALOG);
    
    expect(level3.elevation).toBeGreaterThan(level1.elevation);
    expect(level3.shadowOpacity).toBeGreaterThan(level1.shadowOpacity);
    expect(level3.shadowRadius).toBeGreaterThan(level1.shadowRadius);
  });

  it('should accept custom shadow color', () => {
    const customColor = '#FF0000';
    const style = createElevationStyle(ELEVATION_LEVELS.CARD, customColor);
    
    expect(style.shadowColor).toBe(customColor);
  });

  it('should include surface color when provided', () => {
    const surfaceColor = '#2C2C2C';
    const style = createElevationStyle(ELEVATION_LEVELS.CARD, '#000000', surfaceColor);
    
    expect(style.surfaceColor).toBe(surfaceColor);
  });
});

// ============================================================================
// Light Theme Elevation Tests
// ============================================================================

describe('createLightElevation', () => {
  it('should create complete light elevation configuration', () => {
    const elevation = createLightElevation();
    
    expect(elevation.level0).toBeDefined();
    expect(elevation.level1).toBeDefined();
    expect(elevation.level2).toBeDefined();
    expect(elevation.level3).toBeDefined();
    expect(elevation.level4).toBeDefined();
    expect(elevation.level5).toBeDefined();
  });

  it('should have progressive elevation values', () => {
    const elevation = createLightElevation();
    
    expect(elevation.level0.elevation).toBe(0);
    expect(elevation.level1.elevation).toBeGreaterThan(elevation.level0.elevation);
    expect(elevation.level2.elevation).toBeGreaterThan(elevation.level1.elevation);
    expect(elevation.level3.elevation).toBeGreaterThan(elevation.level2.elevation);
    expect(elevation.level4.elevation).toBeGreaterThan(elevation.level3.elevation);
    expect(elevation.level5.elevation).toBeGreaterThan(elevation.level4.elevation);
  });

  it('should use custom shadow color', () => {
    const customColor = '#333333';
    const elevation = createLightElevation(customColor);
    
    expect(elevation.level1.shadowColor).toBe(customColor);
    expect(elevation.level2.shadowColor).toBe(customColor);
  });
});

// ============================================================================
// Dark Theme Elevation Tests
// ============================================================================

describe('createDarkElevation', () => {
  it('should create complete dark elevation configuration', () => {
    const elevation = createDarkElevation('#000000', '#1E1E1E', '#FFFFFF');
    
    expect(elevation.level0).toBeDefined();
    expect(elevation.level1).toBeDefined();
    expect(elevation.level2).toBeDefined();
    expect(elevation.level3).toBeDefined();
    expect(elevation.level4).toBeDefined();
    expect(elevation.level5).toBeDefined();
  });

  it('should include surface colors for all levels', () => {
    const elevation = createDarkElevation('#000000', '#1E1E1E', '#FFFFFF');
    
    expect(elevation.level0.surfaceColor).toBeDefined();
    expect(elevation.level1.surfaceColor).toBeDefined();
    expect(elevation.level2.surfaceColor).toBeDefined();
    expect(elevation.level3.surfaceColor).toBeDefined();
    expect(elevation.level4.surfaceColor).toBeDefined();
    expect(elevation.level5.surfaceColor).toBeDefined();
  });

  it('should have different surface colors for different levels', () => {
    const elevation = createDarkElevation('#000000', '#1E1E1E', '#FFFFFF');
    
    expect(elevation.level0.surfaceColor).not.toBe(elevation.level1.surfaceColor);
    expect(elevation.level1.surfaceColor).not.toBe(elevation.level2.surfaceColor);
  });
});

// ============================================================================
// Color Blending Tests
// ============================================================================

describe('blendColors', () => {
  it('should return base color with zero opacity', () => {
    const result = blendColors('#FF0000', '#00FF00', 0);
    expect(result.toLowerCase()).toBe('#ff0000');
  });

  it('should blend colors with partial opacity', () => {
    const result = blendColors('#000000', '#FFFFFF', 0.5);
    // Should be approximately gray
    expect(result).toMatch(/^#[0-9A-F]{6}$/i);
    expect(result).not.toBe('#000000');
    expect(result).not.toBe('#FFFFFF');
  });

  it('should handle invalid hex colors gracefully', () => {
    const result = blendColors('invalid', '#FFFFFF', 0.5);
    expect(result).toBe('invalid');
  });
});

// ============================================================================
// Surface Color Tests
// ============================================================================

describe('getSurfaceColor', () => {
  it('should return surface color for light theme', () => {
    const result = getSurfaceColor(ELEVATION_LEVELS.CARD, mockColorPalette, false);
    expect(result).toBe(mockColorPalette.surface);
  });

  it('should return background for level 0 in dark theme', () => {
    const result = getSurfaceColor(ELEVATION_LEVELS.BACKGROUND, mockDarkColorPalette, true);
    expect(result).toBe(mockDarkColorPalette.background);
  });

  it('should return tinted surface for elevated levels in dark theme', () => {
    const result = getSurfaceColor(ELEVATION_LEVELS.CARD, mockDarkColorPalette, true);
    expect(result).not.toBe(mockDarkColorPalette.surface);
    expect(result).toMatch(/^#[0-9A-F]{6}$/i);
  });
});

// ============================================================================
// Elevation Application Tests
// ============================================================================

describe('applyElevation', () => {
  const mockElevationStyle = createElevationStyle(ELEVATION_LEVELS.CARD);

  it('should apply shadow styles for light theme', () => {
    const style = applyElevation(mockElevationStyle, false, true);
    
    expect(style.shadowColor).toBeDefined();
    expect(style.shadowOffset).toBeDefined();
    expect(style.shadowOpacity).toBeDefined();
    expect(style.shadowRadius).toBeDefined();
    expect(style.elevation).toBeDefined();
  });

  it('should apply surface color for dark theme', () => {
    const elevationWithSurface = {
      ...mockElevationStyle,
      surfaceColor: '#2C2C2C',
    };
    
    const style = applyElevation(elevationWithSurface, true, true);
    expect(style.backgroundColor).toBe('#2C2C2C');
  });

  it('should not apply shadows when useNativeShadow is false', () => {
    const style = applyElevation(mockElevationStyle, false, false);
    
    expect(style.shadowColor).toBeUndefined();
    expect(style.shadowOffset).toBeUndefined();
    expect(style.shadowOpacity).toBeUndefined();
    expect(style.shadowRadius).toBeUndefined();
  });
});

// ============================================================================
// Elevation Level Retrieval Tests
// ============================================================================

describe('getElevationByLevel', () => {
  const mockMaterialElevation: MaterialElevation = createLightElevation();

  it('should return correct elevation style for each level', () => {
    expect(getElevationByLevel(mockMaterialElevation, ELEVATION_LEVELS.BACKGROUND))
      .toBe(mockMaterialElevation.level0);
    expect(getElevationByLevel(mockMaterialElevation, ELEVATION_LEVELS.CARD))
      .toBe(mockMaterialElevation.level1);
    expect(getElevationByLevel(mockMaterialElevation, ELEVATION_LEVELS.BUTTON))
      .toBe(mockMaterialElevation.level2);
    expect(getElevationByLevel(mockMaterialElevation, ELEVATION_LEVELS.DIALOG))
      .toBe(mockMaterialElevation.level3);
    expect(getElevationByLevel(mockMaterialElevation, ELEVATION_LEVELS.NAVIGATION))
      .toBe(mockMaterialElevation.level4);
    expect(getElevationByLevel(mockMaterialElevation, ELEVATION_LEVELS.FLOATING))
      .toBe(mockMaterialElevation.level5);
  });

  it('should return level0 for invalid levels', () => {
    expect(getElevationByLevel(mockMaterialElevation, 99 as any))
      .toBe(mockMaterialElevation.level0);
  });
});

// ============================================================================
// Semantic Helpers Tests
// ============================================================================

describe('elevationHelpers', () => {
  const mockMaterialElevation: MaterialElevation = createLightElevation();

  it('should provide correct semantic elevation styles', () => {
    expect(elevationHelpers.background(mockMaterialElevation))
      .toBe(mockMaterialElevation.level0);
    expect(elevationHelpers.card(mockMaterialElevation))
      .toBe(mockMaterialElevation.level1);
    expect(elevationHelpers.button(mockMaterialElevation))
      .toBe(mockMaterialElevation.level2);
    expect(elevationHelpers.dialog(mockMaterialElevation))
      .toBe(mockMaterialElevation.level3);
    expect(elevationHelpers.navigation(mockMaterialElevation))
      .toBe(mockMaterialElevation.level4);
    expect(elevationHelpers.fab(mockMaterialElevation))
      .toBe(mockMaterialElevation.level5);
  });

  it('should provide pressed button state with lower elevation', () => {
    const buttonElevation = elevationHelpers.button(mockMaterialElevation);
    const pressedElevation = elevationHelpers.buttonPressed(mockMaterialElevation);
    
    expect(pressedElevation.elevation).toBeLessThan(buttonElevation.elevation);
  });
});

// ============================================================================
// Validation Tests
// ============================================================================

describe('validateElevation', () => {
  it('should validate correct elevation configuration', () => {
    const validElevation = createLightElevation();
    const result = validateElevation(validElevation);
    
    expect(result.isValid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('should detect invalid elevation progression', () => {
    const invalidElevation: MaterialElevation = {
      level0: createElevationStyle(0),
      level1: createElevationStyle(2), // Higher than level2
      level2: createElevationStyle(1), // Lower than level1 - invalid
      level3: createElevationStyle(3),
      level4: createElevationStyle(4),
      level5: createElevationStyle(5),
    };
    
    const result = validateElevation(invalidElevation);
    
    expect(result.isValid).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('should be higher than');
  });

  it('should detect high shadow opacity values', () => {
    const highOpacityElevation: MaterialElevation = {
      level0: createElevationStyle(0),
      level1: { ...createElevationStyle(1), shadowOpacity: 0.5 }, // Too high
      level2: createElevationStyle(2),
      level3: createElevationStyle(3),
      level4: createElevationStyle(4),
      level5: createElevationStyle(5),
    };
    
    const result = validateElevation(highOpacityElevation);
    
    expect(result.isValid).toBe(false);
    expect(result.warnings.some(w => w.includes('high shadow opacity'))).toBe(true);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Elevation System Integration', () => {
  it('should work with complete theme configuration', () => {
    const lightElevation = createLightElevation('#000000');
    const darkElevation = createDarkElevation('#000000', '#1E1E1E', '#FFFFFF');
    
    // Test light theme
    const lightCardStyle = applyElevation(
      getElevationByLevel(lightElevation, ELEVATION_LEVELS.CARD),
      false,
      true
    );
    
    expect(lightCardStyle.shadowColor).toBeDefined();
    expect(lightCardStyle.elevation).toBe(1);
    
    // Test dark theme
    const darkCardStyle = applyElevation(
      getElevationByLevel(darkElevation, ELEVATION_LEVELS.CARD),
      true,
      true
    );
    
    expect(darkCardStyle.backgroundColor).toBeDefined();
  });

  it('should maintain consistency across elevation levels', () => {
    const elevation = createLightElevation();
    const levels = [
      ELEVATION_LEVELS.BACKGROUND,
      ELEVATION_LEVELS.CARD,
      ELEVATION_LEVELS.BUTTON,
      ELEVATION_LEVELS.DIALOG,
      ELEVATION_LEVELS.NAVIGATION,
      ELEVATION_LEVELS.FLOATING,
    ];
    
    const elevationValues = levels.map(level => 
      getElevationByLevel(elevation, level).elevation
    );
    
    // Ensure progressive elevation
    for (let i = 1; i < elevationValues.length; i++) {
      expect(elevationValues[i]).toBeGreaterThan(elevationValues[i - 1]);
    }
  });
});