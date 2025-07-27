import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
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
  AccessibilityConfig
} from '../types/theme';
import { dawnMistTheme, defaultThemeCollections } from '../constants/themes';

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

const EnhancedThemeContext = createContext<EnhancedThemeContext | undefined>(undefined);

export const EnhancedThemeProvider = ({ children }: { children: ReactNode }) => {
  // Core theme state
  const [currentTheme, setCurrentTheme] = useState<ThemeCollection>(dawnMistTheme);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [visualMode, setVisualMode] = useState<VisualMode>('minimal');
  
  // Theme collections
  const [availableThemes] = useState<ThemeCollection[]>(defaultThemeCollections);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  
  // Settings
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>(defaultPerformanceSettings);
  const [accessibilityConfig, setAccessibilityConfig] = useState<AccessibilityConfig>(defaultAccessibilityConfig);

  // Theme actions
  const setTheme = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId) || 
                  customThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  };

  // Custom theme actions
  const createCustomTheme = (theme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTheme: CustomTheme = {
      ...theme,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCustomThemes(prev => [...prev, newTheme]);
  };

  const updateCustomTheme = (id: string, updates: Partial<CustomTheme>) => {
    setCustomThemes(prev => prev.map(theme => 
      theme.id === id 
        ? { ...theme, ...updates, updatedAt: new Date() }
        : theme
    ));
  };

  const deleteCustomTheme = (id: string) => {
    setCustomThemes(prev => prev.filter(theme => theme.id !== id));
    // Switch to default theme if current theme is being deleted
    if (currentTheme.id === id) {
      setCurrentTheme(dawnMistTheme);
    }
  };

  // Settings actions
  const updatePerformanceSettings = (settings: Partial<PerformanceSettings>) => {
    setPerformanceSettings(prev => ({ ...prev, ...settings }));
  };

  const updateAccessibilityConfig = (config: Partial<AccessibilityConfig>) => {
    setAccessibilityConfig(prev => ({ ...prev, ...config }));
  };

  // Utility functions
  const getCurrentColors = (): ColorPalette => {
    // Determine if we should use light or dark colors based on themeMode
    const shouldUseDark = themeMode === 'dark' || 
      (themeMode === 'system' && /* system dark mode check would go here */ false);
    
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
    
    // Theme actions
    setTheme,
    setThemeMode,
    setVisualMode,
    
    // Custom theme actions
    createCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    
    // Settings actions
    updatePerformanceSettings,
    updateAccessibilityConfig,
    
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
  ]);

  return (
    <EnhancedThemeContext.Provider value={contextValue}>
      {children}
    </EnhancedThemeContext.Provider>
  );
};

export const useEnhancedTheme = () => {
  const context = useContext(EnhancedThemeContext);
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
