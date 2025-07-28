import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Animated, Appearance } from 'react-native';
import {
  ThemeCollection,
  ThemeMode,
  VisualMode,
  CustomTheme,
  EnhancedThemeContext,
  ColorPalette,
  MaterialDesignConfig,
  ThemeAnimations,
  PerformanceSettings,
  AccessibilityConfig,
  VisualModeConfig,
  TimerVisualization,
  VisualEffect,
  VisualEffectType,
  EffectIntensity,
  PerformanceLevel
} from '../types/theme';
import { dawnMistTheme, defaultThemeCollections } from '../constants/themes';
import { savePreference, loadPreference } from '../utils/storage';
import { getThemeById } from '../utils/themeValidation';
import { VisualModeEngine, createVisualModeEngine, getDefaultModeConfig } from '../utils/visualModeEngine';

// ============================================================================
// Enhanced Theme Context Implementation
// ============================================================================

const defaultPerformanceSettings: PerformanceSettings = {
  reducedMotion: false,
  hardwareAcceleration: true,
  maxConcurrentAnimations: 5,
  frameRateTarget: 60,
  performanceLevel: 'high',
};

const defaultAccessibilityConfig: AccessibilityConfig = {
  highContrast: false,
  contrastRatio: 4.5,
  colorBlindnessSupport: false,
  reducedTransparency: false,
};

const EnhancedThemeContextInstance = createContext<EnhancedThemeContext | undefined>(undefined);

export const EnhancedThemeProvider = ({ children }: { children: ReactNode }) => {
  // Core theme state
  const [currentTheme, setCurrentTheme] = useState<ThemeCollection>(dawnMistTheme);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [visualMode, setVisualMode] = useState<VisualMode>('minimal');
  const [isLoading, setIsLoading] = useState(true);
  const [systemColorScheme, setSystemColorScheme] = useState<'light' | 'dark'>('light');

  // Theme collections
  const [availableThemes] = useState<ThemeCollection[]>(defaultThemeCollections);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);

  // Settings
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>(defaultPerformanceSettings);
  const [accessibilityConfig, setAccessibilityConfig] = useState<AccessibilityConfig>(defaultAccessibilityConfig);

  // Visual mode engine
  const [visualModeEngine] = useState(() => createVisualModeEngine('minimal', 'high'));

  // Sync visual mode engine with state
  useEffect(() => {
    visualModeEngine.switchMode(visualMode);
  }, [visualMode, visualModeEngine]);

  // Sync visual mode engine with performance settings
  useEffect(() => {
    visualModeEngine.optimizeForPerformance(performanceSettings.performanceLevel);
  }, [performanceSettings.performanceLevel, visualModeEngine]);

  // Animation values for smooth transitions
  const [transitionAnimation] = useState(new Animated.Value(1));

  // Storage keys for persistence
  const STORAGE_KEYS = {
    THEME_ID: 'theme_id',
    THEME_MODE: 'theme_mode',
    VISUAL_MODE: 'visual_mode',
    CUSTOM_THEMES: 'custom_themes',
    PERFORMANCE_SETTINGS: 'performance_settings',
    ACCESSIBILITY_CONFIG: 'accessibility_config',
  };

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load theme preferences
        const savedThemeId = await loadPreference(STORAGE_KEYS.THEME_ID);
        const savedThemeMode = await loadPreference(STORAGE_KEYS.THEME_MODE);
        const savedVisualMode = await loadPreference(STORAGE_KEYS.VISUAL_MODE);

        // Load custom themes
        const savedCustomThemes = await loadPreference(STORAGE_KEYS.CUSTOM_THEMES);

        // Load settings
        const savedPerformanceSettings = await loadPreference(STORAGE_KEYS.PERFORMANCE_SETTINGS);
        const savedAccessibilityConfig = await loadPreference(STORAGE_KEYS.ACCESSIBILITY_CONFIG);

        // Apply loaded preferences
        if (savedThemeId) {
          const theme = getThemeById(savedThemeId);
          if (theme) {
            setCurrentTheme(theme);
          }
        }

        if (savedThemeMode && ['light', 'dark', 'system'].includes(savedThemeMode)) {
          setThemeMode(savedThemeMode as ThemeMode);
        }

        if (savedVisualMode && ['minimal', 'artistic', 'ambient'].includes(savedVisualMode)) {
          setVisualMode(savedVisualMode as VisualMode);
        }

        if (savedCustomThemes) {
          try {
            const parsedCustomThemes = JSON.parse(savedCustomThemes);
            if (Array.isArray(parsedCustomThemes)) {
              setCustomThemes(parsedCustomThemes);
            }
          } catch (error) {
            console.warn('Failed to parse custom themes from storage:', error);
          }
        }

        if (savedPerformanceSettings) {
          try {
            const parsedSettings = JSON.parse(savedPerformanceSettings);
            setPerformanceSettings(prev => ({ ...prev, ...parsedSettings }));
          } catch (error) {
            console.warn('Failed to parse performance settings from storage:', error);
          }
        }

        if (savedAccessibilityConfig) {
          try {
            const parsedConfig = JSON.parse(savedAccessibilityConfig);
            setAccessibilityConfig(prev => ({ ...prev, ...parsedConfig }));
          } catch (error) {
            console.warn('Failed to parse accessibility config from storage:', error);
          }
        }
      } catch (error) {
        console.warn('Failed to load theme preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Listen to system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme || 'light');
    });

    // Set initial system color scheme
    setSystemColorScheme(Appearance.getColorScheme() || 'light');

    return () => subscription?.remove();
  }, []);

  // Smooth theme transition animation
  const animateThemeTransition = (callback: () => void) => {
    if (performanceSettings.reducedMotion) {
      callback();
      return;
    }

    // Fade out
    Animated.timing(transitionAnimation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start(() => {
      // Apply theme change
      callback();

      // Fade in
      Animated.timing(transitionAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }).start();
    });
  };

  // Enhanced theme actions with persistence and smooth transitions
  const setTheme = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId) ||
      customThemes.find(t => t.id === themeId);

    if (theme && theme.id !== currentTheme.id) {
      animateThemeTransition(() => {
        setCurrentTheme(theme);
        savePreference(STORAGE_KEYS.THEME_ID, themeId).catch(error =>
          console.warn('Failed to save theme preference:', error)
        );
      });
    }
  };

  const setThemeModeWithPersistence = (mode: ThemeMode) => {
    if (mode !== themeMode) {
      animateThemeTransition(() => {
        setThemeMode(mode);
        savePreference(STORAGE_KEYS.THEME_MODE, mode).catch(error =>
          console.warn('Failed to save theme mode preference:', error)
        );
      });
    }
  };

  const setVisualModeWithPersistence = (mode: VisualMode) => {
    if (mode !== visualMode) {
      animateThemeTransition(() => {
        setVisualMode(mode);
        savePreference(STORAGE_KEYS.VISUAL_MODE, mode).catch(error =>
          console.warn('Failed to save visual mode preference:', error)
        );
      });
    }
  };

  // Custom theme actions with persistence
  const createCustomTheme = (theme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTheme: CustomTheme = {
      ...theme,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCustomThemes(prev => {
      const updated = [...prev, newTheme];
      // Persist custom themes
      savePreference(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(updated)).catch(error =>
        console.warn('Failed to save custom themes:', error)
      );
      return updated;
    });
  };

  const updateCustomTheme = (id: string, updates: Partial<CustomTheme>) => {
    setCustomThemes(prev => {
      const updated = prev.map(theme =>
        theme.id === id
          ? { ...theme, ...updates, updatedAt: new Date() }
          : theme
      );

      // Persist custom themes
      savePreference(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(updated)).catch(error =>
        console.warn('Failed to save custom themes:', error)
      );

      return updated;
    });

    // Update current theme if it's the one being modified
    if (currentTheme.id === id) {
      const updatedTheme = { ...currentTheme, ...updates, updatedAt: new Date() };
      setCurrentTheme(updatedTheme as ThemeCollection);
    }
  };

  const deleteCustomTheme = (id: string) => {
    setCustomThemes(prev => {
      const updated = prev.filter(theme => theme.id !== id);

      // Persist custom themes
      savePreference(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(updated)).catch(error =>
        console.warn('Failed to save custom themes:', error)
      );

      return updated;
    });

    // Switch to default theme if current theme is being deleted
    if (currentTheme.id === id) {
      animateThemeTransition(() => {
        setCurrentTheme(dawnMistTheme);
        savePreference(STORAGE_KEYS.THEME_ID, dawnMistTheme.id).catch(error =>
          console.warn('Failed to save theme preference:', error)
        );
      });
    }
  };

  // Settings actions with persistence
  const updatePerformanceSettings = (settings: Partial<PerformanceSettings>) => {
    setPerformanceSettings(prev => {
      const updated = { ...prev, ...settings };

      // Persist performance settings
      savePreference(STORAGE_KEYS.PERFORMANCE_SETTINGS, JSON.stringify(updated)).catch(error =>
        console.warn('Failed to save performance settings:', error)
      );

      return updated;
    });
  };

  const updateAccessibilityConfig = (config: Partial<AccessibilityConfig>) => {
    setAccessibilityConfig(prev => {
      const updated = { ...prev, ...config };

      // Persist accessibility config
      savePreference(STORAGE_KEYS.ACCESSIBILITY_CONFIG, JSON.stringify(updated)).catch(error =>
        console.warn('Failed to save accessibility config:', error)
      );

      return updated;
    });
  };

  // Utility functions
  const getCurrentColors = (): ColorPalette => {
    // Determine if we should use light or dark colors based on themeMode
    const shouldUseDark = themeMode === 'dark' ||
      (themeMode === 'system' && systemColorScheme === 'dark');

    return shouldUseDark ? currentTheme.dark : currentTheme.light;
  };

  const getMaterialConfig = (): MaterialDesignConfig => {
    return currentTheme.materialConfig;
  };

  const getAnimationConfig = (animationType: keyof ThemeAnimations) => {
    const config = currentTheme.animations[animationType];

    // Apply performance settings
    if (performanceSettings.reducedMotion) {
      return {
        ...config,
        duration: 0,
        iterations: 1,
      };
    }

    return config;
  };

  // Visual mode engine methods
  const getVisualModeConfig = (mode?: VisualMode): VisualModeConfig => {
    if (mode) {
      return getDefaultModeConfig(mode);
    }
    return visualModeEngine.getCurrentModeConfig();
  };

  const getActiveVisualEffects = (): VisualEffect[] => {
    return visualModeEngine.getActiveEffects();
  };

  const getTimerVisualization = (): TimerVisualization => {
    return visualModeEngine.getTimerVisualization();
  };

  const updateTimerVisualization = (updates: Partial<TimerVisualization>): void => {
    visualModeEngine.updateTimerVisualization(updates);
  };

  const enableVisualEffect = (effectType: VisualEffectType): void => {
    visualModeEngine.enableEffect(effectType);
  };

  const disableVisualEffect = (effectType: VisualEffectType): void => {
    visualModeEngine.disableEffect(effectType);
  };

  const setVisualEffectIntensity = (effectType: VisualEffectType, intensity: EffectIntensity): void => {
    visualModeEngine.setEffectIntensity(effectType, intensity);
  };

  const isVisualEffectSupported = (effectType: VisualEffectType): boolean => {
    return visualModeEngine.isEffectSupported(effectType);
  };

  const getVisualPerformanceImpact = (): PerformanceLevel => {
    return visualModeEngine.getPerformanceImpact();
  };

  const contextValue: EnhancedThemeContext = useMemo(() => ({
    // Current theme state
    currentTheme,
    themeMode,
    visualMode,

    // Available themes
    availableThemes,
    customThemes,

    // Settings
    performanceSettings,
    accessibilityConfig,

    // Theme actions (using the enhanced versions with persistence)
    setTheme,
    setThemeMode: setThemeModeWithPersistence,
    setVisualMode: setVisualModeWithPersistence,

    // Custom theme actions
    createCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,

    // Settings actions
    updatePerformanceSettings,
    updateAccessibilityConfig,

    // Visual mode engine methods
    getVisualModeConfig,
    getActiveVisualEffects,
    getTimerVisualization,
    updateTimerVisualization,
    enableVisualEffect,
    disableVisualEffect,
    setVisualEffectIntensity,
    isVisualEffectSupported,
    getVisualPerformanceImpact,

    // Utility functions
    getCurrentColors,
    getMaterialConfig,
    getAnimationConfig,
  }), [
    currentTheme,
    themeMode,
    visualMode,
    availableThemes,
    customThemes,
    performanceSettings,
    accessibilityConfig,
    systemColorScheme, // Add this dependency since getCurrentColors uses it
    visualModeEngine, // Add visual mode engine as dependency
  ]);

  // Show loading state while preferences are being loaded
  if (isLoading) {
    return (
      <EnhancedThemeContextInstance.Provider value={contextValue}>
        {children}
      </EnhancedThemeContextInstance.Provider>
    );
  }

  return (
    <EnhancedThemeContextInstance.Provider value={contextValue}>
      <Animated.View style={{ flex: 1, opacity: transitionAnimation }}>
        {children}
      </Animated.View>
    </EnhancedThemeContextInstance.Provider>
  );
};

export const useEnhancedTheme = () => {
  const context = useContext(EnhancedThemeContextInstance);
  if (!context) {
    throw new Error('useEnhancedTheme must be used within EnhancedThemeProvider');
  }
  return context;
};

// ============================================================================
// Legacy Theme Context (for backward compatibility)
// ============================================================================

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const LegacyThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>('system');
  return (
    <LegacyThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </LegacyThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(LegacyThemeContext);
  if (!context) throw new Error('useThemeContext must be used within ThemeProvider');
  return context;
};
