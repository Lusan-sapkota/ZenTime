/**
 * Theme Integration Utilities
 * 
 * This file provides utilities for testing and validating the complete
 * integration of all enhanced theming features across the app.
 */

import { 
  ThemeCollection, 
  ThemeMode, 
  VisualMode, 
  CustomTheme,
  ColorPalette,
  ZenModeConfig 
} from '../types/theme';
import { themeRegistry, validateColorCombination } from './themeValidation';
import { savePreference, loadPreference } from './storage';

// ============================================================================
// Integration Test Utilities
// ============================================================================

export interface ThemeIntegrationTest {
  name: string;
  description: string;
  test: () => Promise<boolean>;
  errorMessage?: string;
}

/**
 * Test theme persistence across app restarts
 */
export async function testThemePersistence(): Promise<boolean> {
  try {
    // Test theme ID persistence
    const testThemeId = 'midnight-ocean';
    await savePreference('theme_id', testThemeId);
    const savedThemeId = await loadPreference('theme_id');
    
    if (savedThemeId !== testThemeId) {
      throw new Error('Theme ID persistence failed');
    }

    // Test theme mode persistence
    const testThemeMode: ThemeMode = 'dark';
    await savePreference('theme_mode', testThemeMode);
    const savedThemeMode = await loadPreference('theme_mode');
    
    if (savedThemeMode !== testThemeMode) {
      throw new Error('Theme mode persistence failed');
    }

    // Test visual mode persistence
    const testVisualMode: VisualMode = 'artistic';
    await savePreference('visual_mode', testVisualMode);
    const savedVisualMode = await loadPreference('visual_mode');
    
    if (savedVisualMode !== testVisualMode) {
      throw new Error('Visual mode persistence failed');
    }

    return true;
  } catch (error) {
    console.error('Theme persistence test failed:', error);
    return false;
  }
}

/**
 * Test custom theme creation and storage
 */
export async function testCustomThemeIntegration(): Promise<boolean> {
  try {
    const testCustomTheme: CustomTheme = {
      id: 'test-custom-theme',
      name: 'Test Theme',
      description: 'A test custom theme',
      baseTheme: 'dawn-mist',
      light: {
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
        onSecondaryContainer: '#1B5E20',
        secondaryFixed: '#388E3C',
        onSecondaryFixed: '#FFFFFF',
        tertiary: '#F57C00',
        onTertiary: '#FFFFFF',
        tertiaryContainer: '#FFF3E0',
        onTertiaryContainer: '#E65100',
        error: '#D32F2F',
        onError: '#FFFFFF',
        errorContainer: '#FFEBEE',
        onErrorContainer: '#B71C1C',
        outline: '#757575',
        outlineVariant: '#BDBDBD',
        shadow: '#000000',
        scrim: '#000000',
        accent: '#1976D2',
        button: '#F5F5F5',
        divider: '#E0E0E0',
        text: '#000000',
      },
      dark: {
        background: '#121212',
        surface: '#1E1E1E',
        surfaceVariant: '#2C2C2C',
        surfaceDim: '#0F0F0F',
        surfaceBright: '#2C2C2C',
        onBackground: '#FFFFFF',
        onSurface: '#FFFFFF',
        onSurfaceVariant: '#CCCCCC',
        primary: '#42A5F5',
        onPrimary: '#000000',
        primaryContainer: '#1565C0',
        onPrimaryContainer: '#E3F2FD',
        primaryFixed: '#42A5F5',
        onPrimaryFixed: '#000000',
        secondary: '#66BB6A',
        onSecondary: '#000000',
        secondaryContainer: '#2E7D32',
        onSecondaryContainer: '#E8F5E8',
        secondaryFixed: '#66BB6A',
        onSecondaryFixed: '#000000',
        tertiary: '#FFB74D',
        onTertiary: '#000000',
        tertiaryContainer: '#F57C00',
        onTertiaryContainer: '#FFF3E0',
        error: '#EF5350',
        onError: '#000000',
        errorContainer: '#C62828',
        onErrorContainer: '#FFEBEE',
        outline: '#9E9E9E',
        outlineVariant: '#424242',
        shadow: '#000000',
        scrim: '#000000',
        accent: '#42A5F5',
        button: '#2C2C2C',
        divider: '#424242',
        text: '#FFFFFF',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Test custom theme storage
    const customThemes = [testCustomTheme];
    await savePreference('custom_themes', JSON.stringify(customThemes));
    const savedCustomThemes = await loadPreference('custom_themes');
    
    if (!savedCustomThemes) {
      throw new Error('Custom theme storage failed');
    }

    const parsedCustomThemes = JSON.parse(savedCustomThemes);
    if (!Array.isArray(parsedCustomThemes) || parsedCustomThemes.length !== 1) {
      throw new Error('Custom theme parsing failed');
    }

    const savedTheme = parsedCustomThemes[0];
    if (savedTheme.id !== testCustomTheme.id || savedTheme.name !== testCustomTheme.name) {
      throw new Error('Custom theme data integrity failed');
    }

    return true;
  } catch (error) {
    console.error('Custom theme integration test failed:', error);
    return false;
  }
}

/**
 * Test zen mode configuration persistence
 */
export async function testZenModeIntegration(): Promise<boolean> {
  try {
    const testZenConfig: ZenModeConfig = {
      enabled: true,
      autoHideDelay: 5000,
      breathingAnimation: true,
      pulseEffect: false,
      gradualDimming: true,
      tapToReveal: true,
      revealDuration: 3000,
      hideStatusBar: true,
      preventScreenDim: true,
    };

    // Test zen mode configuration storage
    await savePreference('zenConfig', JSON.stringify(testZenConfig));
    const savedZenConfig = await loadPreference('zenConfig');
    
    if (!savedZenConfig) {
      throw new Error('Zen mode config storage failed');
    }

    const parsedZenConfig = JSON.parse(savedZenConfig);
    if (parsedZenConfig.enabled !== testZenConfig.enabled ||
        parsedZenConfig.breathingAnimation !== testZenConfig.breathingAnimation) {
      throw new Error('Zen mode config data integrity failed');
    }

    return true;
  } catch (error) {
    console.error('Zen mode integration test failed:', error);
    return false;
  }
}

/**
 * Test theme accessibility validation
 */
export async function testAccessibilityValidation(): Promise<boolean> {
  try {
    // Test color contrast validation
    const goodContrast = validateColorCombination('#000000', '#FFFFFF');
    if (!goodContrast.isValid || goodContrast.contrastRatio < 4.5) {
      throw new Error('Good contrast validation failed');
    }

    const badContrast = validateColorCombination('#CCCCCC', '#FFFFFF');
    if (badContrast.isValid || badContrast.contrastRatio >= 4.5) {
      throw new Error('Bad contrast validation failed');
    }

    // Test all default themes for accessibility
    const allThemes = themeRegistry.getAllThemes();
    for (const theme of allThemes) {
      // Test critical color combinations
      const lightBgContrast = validateColorCombination(theme.light.onBackground, theme.light.background);
      const darkBgContrast = validateColorCombination(theme.dark.onBackground, theme.dark.background);
      
      if (!lightBgContrast.isValid || !darkBgContrast.isValid) {
        throw new Error(`Theme ${theme.name} failed accessibility validation`);
      }
    }

    return true;
  } catch (error) {
    console.error('Accessibility validation test failed:', error);
    return false;
  }
}

/**
 * Test complete user workflow from theme selection to zen mode
 */
export async function testCompleteUserWorkflow(): Promise<boolean> {
  try {
    // Simulate complete user workflow
    const workflow = [
      // 1. User selects a theme
      { key: 'theme_id', value: 'forest-zen' },
      // 2. User changes theme mode
      { key: 'theme_mode', value: 'dark' },
      // 3. User selects visual mode
      { key: 'visual_mode', value: 'ambient' },
      // 4. User enables zen mode
      { key: 'zenMode', value: 'true' },
      // 5. User configures zen settings
      { 
        key: 'zenConfig', 
        value: JSON.stringify({
          enabled: true,
          breathingAnimation: true,
          tapToReveal: true,
          revealDuration: 4000,
        })
      },
    ];

    // Save all workflow preferences
    for (const step of workflow) {
      await savePreference(step.key, step.value);
    }

    // Verify all preferences were saved correctly
    for (const step of workflow) {
      const saved = await loadPreference(step.key);
      if (saved !== step.value) {
        throw new Error(`Workflow step failed: ${step.key}`);
      }
    }

    // Test theme switching with persistence
    const themes = ['dawn-mist', 'midnight-ocean', 'sunset-glow'];
    for (const themeId of themes) {
      await savePreference('theme_id', themeId);
      const saved = await loadPreference('theme_id');
      if (saved !== themeId) {
        throw new Error(`Theme switching failed for: ${themeId}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Complete user workflow test failed:', error);
    return false;
  }
}

/**
 * Test performance settings integration
 */
export async function testPerformanceIntegration(): Promise<boolean> {
  try {
    const performanceSettings = {
      reducedMotion: false,
      hardwareAcceleration: true,
      maxConcurrentAnimations: 5,
      frameRateTarget: 60,
      performanceLevel: 'high',
    };

    await savePreference('performance_settings', JSON.stringify(performanceSettings));
    const saved = await loadPreference('performance_settings');
    
    if (!saved) {
      throw new Error('Performance settings storage failed');
    }

    const parsed = JSON.parse(saved);
    if (parsed.frameRateTarget !== 60 || parsed.performanceLevel !== 'high') {
      throw new Error('Performance settings data integrity failed');
    }

    return true;
  } catch (error) {
    console.error('Performance integration test failed:', error);
    return false;
  }
}

// ============================================================================
// Integration Test Suite
// ============================================================================

export const integrationTests: ThemeIntegrationTest[] = [
  {
    name: 'Theme Persistence',
    description: 'Test theme persistence across app restarts and updates',
    test: testThemePersistence,
  },
  {
    name: 'Custom Theme Integration',
    description: 'Test custom theme creation, storage, and retrieval',
    test: testCustomThemeIntegration,
  },
  {
    name: 'Zen Mode Integration',
    description: 'Test zen mode configuration persistence and functionality',
    test: testZenModeIntegration,
  },
  {
    name: 'Accessibility Validation',
    description: 'Test color accessibility validation across all themes',
    test: testAccessibilityValidation,
  },
  {
    name: 'Complete User Workflow',
    description: 'Test complete user workflows from theme selection to zen mode usage',
    test: testCompleteUserWorkflow,
  },
  {
    name: 'Performance Integration',
    description: 'Test performance settings integration and persistence',
    test: testPerformanceIntegration,
  },
];

/**
 * Run all integration tests
 */
export async function runAllIntegrationTests(): Promise<{
  passed: number;
  failed: number;
  results: { name: string; passed: boolean; error?: string }[];
}> {
  const results: { name: string; passed: boolean; error?: string }[] = [];
  let passed = 0;
  let failed = 0;

  for (const test of integrationTests) {
    try {
      const result = await test.test();
      if (result) {
        results.push({ name: test.name, passed: true });
        passed++;
      } else {
        results.push({ name: test.name, passed: false, error: 'Test returned false' });
        failed++;
      }
    } catch (error) {
      results.push({ 
        name: test.name, 
        passed: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      failed++;
    }
  }

  return { passed, failed, results };
}

/**
 * Validate complete theme system integration
 */
export async function validateThemeSystemIntegration(): Promise<{
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    // Test theme registry
    const allThemes = themeRegistry.getAllThemes();
    if (allThemes.length < 5) {
      issues.push('Insufficient theme collections available');
      recommendations.push('Ensure all 5 curated theme collections are properly registered');
    }

    // Test theme validation
    const validation = themeRegistry.validateAllThemes();
    if (validation.invalid.length > 0) {
      issues.push(`${validation.invalid.length} themes have accessibility issues`);
      recommendations.push('Review and fix accessibility issues in theme color palettes');
    }

    // Test storage functionality
    try {
      await savePreference('test_key', 'test_value');
      const retrieved = await loadPreference('test_key');
      if (retrieved !== 'test_value') {
        issues.push('Storage system not functioning correctly');
        recommendations.push('Check AsyncStorage configuration and permissions');
      }
    } catch (error) {
      issues.push('Storage system error');
      recommendations.push('Verify AsyncStorage is properly installed and configured');
    }

    // Test integration tests
    const testResults = await runAllIntegrationTests();
    if (testResults.failed > 0) {
      issues.push(`${testResults.failed} integration tests failed`);
      recommendations.push('Review failed integration tests and fix underlying issues');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
    };
  } catch (error) {
    issues.push('Critical error during validation');
    recommendations.push('Check system configuration and dependencies');
    
    return {
      isValid: false,
      issues,
      recommendations,
    };
  }
}

// ============================================================================
// Migration and Upgrade Utilities
// ============================================================================

/**
 * Migrate legacy theme settings to enhanced theme system
 */
export async function migrateLegacyThemeSettings(): Promise<boolean> {
  try {
    // Check for legacy theme setting
    const legacyTheme = await loadPreference('theme');
    
    if (legacyTheme) {
      // Map legacy theme to new system
      let newThemeId = 'dawn-mist'; // default
      let newThemeMode: ThemeMode = 'system';
      
      switch (legacyTheme) {
        case 'light':
          newThemeMode = 'light';
          break;
        case 'dark':
          newThemeMode = 'dark';
          break;
        case 'system':
          newThemeMode = 'system';
          break;
      }
      
      // Save new theme settings
      await savePreference('theme_id', newThemeId);
      await savePreference('theme_mode', newThemeMode);
      await savePreference('visual_mode', 'minimal');
      
      console.log('Successfully migrated legacy theme settings');
      return true;
    }
    
    return true; // No migration needed
  } catch (error) {
    console.error('Failed to migrate legacy theme settings:', error);
    return false;
  }
}

/**
 * Clean up orphaned theme data
 */
export async function cleanupOrphanedThemeData(): Promise<void> {
  try {
    // Clean up any invalid custom themes
    const customThemesData = await loadPreference('custom_themes');
    
    if (customThemesData) {
      const customThemes = JSON.parse(customThemesData);
      const validThemes = customThemes.filter((theme: CustomTheme) => {
        try {
          // Basic validation
          return theme.id && theme.name && theme.baseTheme;
        } catch {
          return false;
        }
      });
      
      if (validThemes.length !== customThemes.length) {
        await savePreference('custom_themes', JSON.stringify(validThemes));
        console.log(`Cleaned up ${customThemes.length - validThemes.length} invalid custom themes`);
      }
    }
  } catch (error) {
    console.error('Failed to cleanup orphaned theme data:', error);
  }
}