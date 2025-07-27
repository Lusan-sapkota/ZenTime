/**
 * Enhanced Theme System Foundation Tests
 * 
 * Tests for the core theme system interfaces, types, and utilities
 */

import { 
  dawnMistTheme, 
  defaultThemeCollections 
} from '../constants/themes';
import { 
  validateColorPalette, 
  validateCustomTheme,
  getContrastRatio,
  getWCAGLevel,
  convertLegacyTheme,
  isValidThemeCollection,
  generateThemeId,
  createDefaultMaterialConfig
} from '../utils/themeUtils';
import { 
  ThemeCollection, 
  ColorPalette, 
  CustomTheme,
  LegacyTheme 
} from '../types/theme';

describe('Enhanced Theme System Foundation', () => {
  
  describe('Theme Collection Structure', () => {
    test('dawnMistTheme should have all required properties', () => {
      expect(dawnMistTheme).toHaveProperty('id');
      expect(dawnMistTheme).toHaveProperty('name');
      expect(dawnMistTheme).toHaveProperty('description');
      expect(dawnMistTheme).toHaveProperty('light');
      expect(dawnMistTheme).toHaveProperty('dark');
      expect(dawnMistTheme).toHaveProperty('materialConfig');
      expect(dawnMistTheme).toHaveProperty('animations');
      expect(dawnMistTheme).toHaveProperty('isCustom');
      
      expect(dawnMistTheme.id).toBe('dawn-mist');
      expect(dawnMistTheme.isCustom).toBe(false);
    });

    test('color palettes should have all required color tokens', () => {
      const requiredColors = [
        'background', 'surface', 'surfaceVariant', 'surfaceDim', 'surfaceBright',
        'onBackground', 'onSurface', 'onSurfaceVariant',
        'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
        'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
        'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
        'error', 'onError', 'errorContainer', 'onErrorContainer',
        'outline', 'outlineVariant', 'shadow', 'scrim',
        'accent', 'button', 'divider', 'text' // Legacy support
      ];

      requiredColors.forEach(color => {
        expect(dawnMistTheme.light).toHaveProperty(color);
        expect(dawnMistTheme.dark).toHaveProperty(color);
        expect(typeof dawnMistTheme.light[color as keyof ColorPalette]).toBe('string');
        expect(typeof dawnMistTheme.dark[color as keyof ColorPalette]).toBe('string');
      });
    });

    test('material config should have proper structure', () => {
      const { materialConfig } = dawnMistTheme;
      
      expect(materialConfig).toHaveProperty('elevation');
      expect(materialConfig).toHaveProperty('surfaces');
      expect(materialConfig).toHaveProperty('ripple');
      
      // Check elevation levels
      const elevationLevels = ['level0', 'level1', 'level2', 'level3', 'level4', 'level5'];
      elevationLevels.forEach(level => {
        expect(materialConfig.elevation).toHaveProperty(level);
        const elevationStyle = materialConfig.elevation[level as keyof typeof materialConfig.elevation];
        expect(elevationStyle).toHaveProperty('shadowColor');
        expect(elevationStyle).toHaveProperty('shadowOffset');
        expect(elevationStyle).toHaveProperty('shadowOpacity');
        expect(elevationStyle).toHaveProperty('shadowRadius');
        expect(elevationStyle).toHaveProperty('elevation');
      });
    });
  });

  describe('Color Validation', () => {
    test('should calculate contrast ratio correctly', () => {
      // Test with known values
      const whiteBlackRatio = getContrastRatio('#FFFFFF', '#000000');
      expect(whiteBlackRatio).toBeCloseTo(21, 0); // Perfect contrast
      
      const sameColorRatio = getContrastRatio('#FF0000', '#FF0000');
      expect(sameColorRatio).toBe(1); // Same color has 1:1 ratio
    });

    test('should determine WCAG levels correctly', () => {
      expect(getWCAGLevel(21)).toBe('AAA');
      expect(getWCAGLevel(7.5)).toBe('AAA');
      expect(getWCAGLevel(5.0)).toBe('AA');
      expect(getWCAGLevel(3.0)).toBe('fail');
    });

    test('should validate color palette accessibility', () => {
      const validationResults = validateColorPalette(dawnMistTheme.light);
      expect(Array.isArray(validationResults)).toBe(true);
      expect(validationResults.length).toBeGreaterThan(0);
      
      // Check that each result has required properties
      validationResults.forEach(result => {
        expect(result).toHaveProperty('isValid');
        expect(result).toHaveProperty('contrastRatio');
        expect(result).toHaveProperty('wcagLevel');
        expect(typeof result.isValid).toBe('boolean');
        expect(typeof result.contrastRatio).toBe('number');
      });
    });
  });

  describe('Theme Utilities', () => {
    test('should generate unique theme IDs', () => {
      const id1 = generateThemeId('test theme');
      const id2 = generateThemeId('test theme');
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^test-theme-\d+-[a-z0-9]+$/);
    });

    test('should validate theme collections', () => {
      expect(isValidThemeCollection(dawnMistTheme)).toBe(true);
      
      // Test invalid theme
      const invalidTheme = {
        ...dawnMistTheme,
        id: '', // Invalid empty ID
      };
      expect(isValidThemeCollection(invalidTheme as ThemeCollection)).toBe(false);
    });

    test('should convert legacy themes', () => {
      const legacyTheme: LegacyTheme = {
        dark: false,
        colors: {
          background: '#FFFFFF',
          text: '#000000',
          accent: '#0066CC',
          secondary: '#FF6600',
          button: '#EEEEEE',
          divider: '#CCCCCC',
        },
      };

      const converted = convertLegacyTheme(legacyTheme);
      
      expect(converted.background).toBe('#FFFFFF');
      expect(converted.text).toBe('#000000');
      expect(converted.accent).toBe('#0066CC');
      expect(converted.primary).toBe('#0066CC'); // Should map accent to primary
    });

    test('should create default material config', () => {
      const lightConfig = createDefaultMaterialConfig(false);
      const darkConfig = createDefaultMaterialConfig(true);
      
      expect(lightConfig.surfaces.elevationOverlay).toBe(false);
      expect(darkConfig.surfaces.elevationOverlay).toBe(true);
      
      // Dark theme should have surface colors for elevation
      expect(darkConfig.elevation.level1.surfaceColor).toBeDefined();
      expect(lightConfig.elevation.level1.surfaceColor).toBeUndefined();
    });
  });

  describe('Default Theme Collections', () => {
    test('should export default theme collections', () => {
      expect(Array.isArray(defaultThemeCollections)).toBe(true);
      expect(defaultThemeCollections.length).toBeGreaterThan(0);
      expect(defaultThemeCollections[0]).toBe(dawnMistTheme);
    });

    test('all default themes should be valid', () => {
      defaultThemeCollections.forEach(theme => {
        expect(isValidThemeCollection(theme)).toBe(true);
      });
    });
  });

  describe('Custom Theme Validation', () => {
    test('should validate custom theme structure', () => {
      const validCustomTheme: CustomTheme = {
        id: 'custom-test',
        name: 'Test Custom Theme',
        description: 'A test custom theme',
        baseTheme: 'dawn-mist',
        light: dawnMistTheme.light,
        dark: dawnMistTheme.dark,
        customColors: {
          light: { primary: '#1F2937', onPrimary: '#FFFFFF' }, // Use accessible color combination
          dark: { primary: '#F87171', onPrimary: '#000000' }, // Use accessible color combination
        },
        materialConfig: dawnMistTheme.materialConfig,
        animations: dawnMistTheme.animations,
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validation = validateCustomTheme(validCustomTheme);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should catch invalid custom themes', () => {
      const invalidCustomTheme: CustomTheme = {
        id: '', // Invalid empty ID
        name: '', // Invalid empty name
        description: 'Invalid theme',
        baseTheme: 'dawn-mist',
        light: dawnMistTheme.light,
        dark: dawnMistTheme.dark,
        customColors: { light: {}, dark: {} },
        materialConfig: dawnMistTheme.materialConfig,
        animations: dawnMistTheme.animations,
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validation = validateCustomTheme(invalidCustomTheme);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});