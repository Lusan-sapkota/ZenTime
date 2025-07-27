/**
 * Enhanced Theme System Type Definitions
 * 
 * This file contains all type definitions and interfaces for the enhanced theming system,
 * including material design properties, comprehensive color tokens, and theme collections.
 */

// ============================================================================
// Core Color Palette Interface
// ============================================================================

/**
 * Comprehensive color palette interface following Material Design 3 color system
 * with additional tokens for enhanced theming capabilities
 */
export interface ColorPalette {
  // Surface Colors - Base surfaces and backgrounds
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceDim: string;
  surfaceBright: string;
  
  // Content Colors - Text and icons on surfaces
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  
  // Primary Colors - Main brand colors
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  primaryFixed: string;
  onPrimaryFixed: string;
  
  // Secondary Colors - Supporting colors
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  secondaryFixed: string;
  onSecondaryFixed: string;
  
  // Tertiary Colors - Additional accent colors
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  
  // System Colors - Error, warning, success states
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  
  // Utility Colors - Borders, dividers, shadows
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
  
  // Legacy support for existing components
  accent: string;
  button: string;
  divider: string;
  text: string;
}

// ============================================================================
// Material Design Configuration
// ============================================================================

/**
 * Elevation style configuration for material design depth
 */
export interface ElevationStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number; // Android elevation
  surfaceColor?: string; // Dark theme surface tint alternative
}

/**
 * Material Design elevation levels configuration
 */
export interface MaterialElevation {
  level0: ElevationStyle; // Background surfaces
  level1: ElevationStyle; // Cards, sheets
  level2: ElevationStyle; // Buttons, chips
  level3: ElevationStyle; // Dialogs, menus
  level4: ElevationStyle; // Navigation bars
  level5: ElevationStyle; // Floating action buttons
}

/**
 * Ripple effect configuration for interactive elements
 */
export interface RippleConfig {
  enabled: boolean;
  color: string;
  opacity: number;
  duration: number;
}

/**
 * Surface treatment configuration
 */
export interface SurfaceConfig {
  tonal: boolean; // Use tonal surface colors
  elevationOverlay: boolean; // Apply elevation overlay in dark theme
}

/**
 * Complete Material Design configuration
 */
export interface MaterialDesignConfig {
  elevation: MaterialElevation;
  surfaces: SurfaceConfig;
  ripple: RippleConfig;
}

// ============================================================================
// Animation System
// ============================================================================

/**
 * Animation easing curve types
 */
export type EasingCurve = 
  | 'linear' 
  | 'ease' 
  | 'ease-in' 
  | 'ease-out' 
  | 'ease-in-out' 
  | 'cubic-bezier';

/**
 * Animation direction types
 */
export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';

/**
 * Animation configuration interface
 */
export interface AnimationConfig {
  duration: number; // Duration in milliseconds
  easing: EasingCurve;
  delay?: number;
  iterations?: number | 'infinite';
  direction?: AnimationDirection;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

/**
 * Theme-specific animation configurations
 */
export interface ThemeAnimations {
  // Theme transition animations
  colorTransition: AnimationConfig;
  elevationTransition: AnimationConfig;
  
  // Zen mode animations
  breathingCycle: AnimationConfig;
  pulseEffect: AnimationConfig;
  fadeTransitions: AnimationConfig;
  
  // Timer visualizations
  digitTransition: AnimationConfig;
  progressAnimation: AnimationConfig;
}

// ============================================================================
// Theme Collection Interface
// ============================================================================

/**
 * Theme mode types
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Visual mode types for enhanced experiences
 */
export type VisualMode = 'minimal' | 'artistic' | 'ambient';

/**
 * Complete theme collection containing light/dark variants and configurations
 */
export interface ThemeCollection {
  // Identification
  id: string;
  name: string;
  description: string;
  
  // Color palettes
  light: ColorPalette;
  dark: ColorPalette;
  
  // Material design configuration
  materialConfig: MaterialDesignConfig;
  
  // Animation configurations
  animations: ThemeAnimations;
  
  // Metadata
  isCustom: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Custom Theme System
// ============================================================================

/**
 * Custom theme creation interface
 */
export interface CustomTheme extends Omit<ThemeCollection, 'id' | 'createdAt' | 'updatedAt'> {
  id: string;
  baseTheme: string; // ID of the base theme this custom theme is derived from
  customColors: {
    light: Partial<ColorPalette>;
    dark: Partial<ColorPalette>;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Performance and Accessibility
// ============================================================================

/**
 * Performance level indicators
 */
export type PerformanceLevel = 'low' | 'medium' | 'high';

/**
 * Performance settings for animations and visual effects
 */
export interface PerformanceSettings {
  reducedMotion: boolean;
  hardwareAcceleration: boolean;
  maxConcurrentAnimations: number;
  frameRateTarget: 30 | 60;
  performanceLevel: PerformanceLevel;
}

/**
 * Accessibility configuration
 */
export interface AccessibilityConfig {
  highContrast: boolean;
  contrastRatio: number; // Minimum contrast ratio (e.g., 4.5, 7.0)
  colorBlindnessSupport: boolean;
  reducedTransparency: boolean;
}

// ============================================================================
// Zen Mode Configuration
// ============================================================================

/**
 * Zen mode configuration interface for enhanced focus experience
 */
export interface ZenModeConfig {
  // Core Settings
  enabled: boolean;
  autoHideDelay: number; // milliseconds
  
  // Visual Effects
  breathingAnimation: boolean;
  pulseEffect: boolean;
  gradualDimming: boolean;
  
  // Interaction
  tapToReveal: boolean;
  revealDuration: number;
  
  // Immersion
  hideStatusBar: boolean;
  preventScreenDim: boolean;
}

/**
 * Zen mode animation configurations
 */
export interface ZenAnimations {
  breathingCycle: AnimationConfig;
  pulseEffect: AnimationConfig;
  fadeTransitions: AnimationConfig;
  revealAnimations: AnimationConfig;
}

// ============================================================================
// Enhanced Theme Context
// ============================================================================

/**
 * Enhanced theme context interface with comprehensive theming capabilities
 */
export interface EnhancedThemeContext {
  // Current theme state
  currentTheme: ThemeCollection;
  themeMode: ThemeMode;
  visualMode: VisualMode;
  
  // Available themes
  availableThemes: ThemeCollection[];
  customThemes: CustomTheme[];
  
  // Settings
  performanceSettings: PerformanceSettings;
  accessibilityConfig: AccessibilityConfig;
  
  // Theme actions
  setTheme: (themeId: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setVisualMode: (mode: VisualMode) => void;
  
  // Custom theme actions
  createCustomTheme: (theme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomTheme: (id: string, updates: Partial<CustomTheme>) => void;
  deleteCustomTheme: (id: string) => void;
  
  // Settings actions
  updatePerformanceSettings: (settings: Partial<PerformanceSettings>) => void;
  updateAccessibilityConfig: (config: Partial<AccessibilityConfig>) => void;
  
  // Utility functions
  getCurrentColors: () => ColorPalette;
  getMaterialConfig: () => MaterialDesignConfig;
  getAnimationConfig: (animationType: keyof ThemeAnimations) => AnimationConfig;
}

// ============================================================================
// Theme Validation
// ============================================================================

/**
 * Color accessibility validation result
 */
export interface ColorValidationResult {
  isValid: boolean;
  contrastRatio: number;
  wcagLevel: 'AA' | 'AAA' | 'fail';
  suggestions?: string[];
}

/**
 * Theme validation interface
 */
export interface ThemeValidator {
  validateColorPalette: (palette: ColorPalette) => ColorValidationResult[];
  validateCustomTheme: (theme: CustomTheme) => { isValid: boolean; errors: string[] };
  suggestColorAdjustments: (color: string, background: string) => string[];
}

// ============================================================================
// Legacy Support
// ============================================================================

/**
 * Legacy theme type for backward compatibility
 */
export interface LegacyTheme {
  dark: boolean;
  colors: {
    background: string;
    text: string;
    accent: string;
    secondary: string;
    button: string;
    divider: string;
  };
}

/**
 * Utility type to convert legacy theme to enhanced theme
 */
export type LegacyThemeConverter = (legacyTheme: LegacyTheme) => Partial<ColorPalette>;