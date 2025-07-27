import { 
  ThemeCollection, 
  ColorPalette, 
  MaterialDesignConfig, 
  ThemeAnimations,
  ElevationStyle 
} from '../types/theme';

// ============================================================================
// Material Design Elevation Configurations
// ============================================================================

const createElevationStyle = (
  level: number, 
  shadowColor: string = '#000000',
  surfaceColor?: string
): ElevationStyle => ({
  shadowColor,
  shadowOffset: { 
    width: 0, 
    height: level === 0 ? 0 : Math.max(1, level / 2) 
  },
  shadowOpacity: level === 0 ? 0 : 0.1 + (level * 0.02),
  shadowRadius: level === 0 ? 0 : level * 2,
  elevation: level,
  surfaceColor,
});

const lightElevation = {
  level0: createElevationStyle(0),
  level1: createElevationStyle(1),
  level2: createElevationStyle(2),
  level3: createElevationStyle(3),
  level4: createElevationStyle(4),
  level5: createElevationStyle(8),
};



// ============================================================================
// Default Animation Configurations
// ============================================================================

const defaultAnimations: ThemeAnimations = {
  colorTransition: {
    duration: 300,
    easing: 'ease-in-out',
    fillMode: 'forwards',
  },
  elevationTransition: {
    duration: 200,
    easing: 'ease-out',
    fillMode: 'forwards',
  },
  breathingCycle: {
    duration: 4000,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'alternate',
  },
  pulseEffect: {
    duration: 2000,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'alternate',
  },
  fadeTransitions: {
    duration: 250,
    easing: 'ease-in-out',
    fillMode: 'forwards',
  },
  digitTransition: {
    duration: 150,
    easing: 'ease-out',
    fillMode: 'forwards',
  },
  progressAnimation: {
    duration: 1000,
    easing: 'linear',
    fillMode: 'forwards',
  },
};

// ============================================================================
// Theme Collection: Dawn Mist (Enhanced)
// ============================================================================

const dawnMistLight: ColorPalette = {
  // Surface Colors
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F3F4',
  surfaceDim: '#E8EAED',
  surfaceBright: '#FFFFFF',
  
  // Content Colors
  onBackground: '#1F2937',
  onSurface: '#1F2937',
  onSurfaceVariant: '#5F6368',
  
  // Primary Colors
  primary: '#A3C4F3',
  onPrimary: '#1F2937',
  primaryContainer: '#E3F2FD',
  onPrimaryContainer: '#0D47A1',
  primaryFixed: '#A3C4F3',
  onPrimaryFixed: '#1F2937',
  
  // Secondary Colors
  secondary: '#F2D0A4',
  onSecondary: '#1F2937',
  secondaryContainer: '#FFF8E1',
  onSecondaryContainer: '#E65100',
  secondaryFixed: '#F2D0A4',
  onSecondaryFixed: '#1F2937',
  
  // Tertiary Colors
  tertiary: '#C8E6C9',
  onTertiary: '#1F2937',
  tertiaryContainer: '#E8F5E8',
  onTertiaryContainer: '#2E7D32',
  
  // System Colors
  error: '#DC2626',
  onError: '#FFFFFF',
  errorContainer: '#FECACA',
  onErrorContainer: '#7F1D1D',
  
  // Utility Colors
  outline: '#9CA3AF',
  outlineVariant: '#D1D5DB',
  shadow: '#000000',
  scrim: '#000000',
  
  // Legacy support
  accent: '#A3C4F3',
  button: '#E5E7EB',
  divider: '#9CA3AF',
  text: '#1F2937',
};

const dawnMistDark: ColorPalette = {
  // Surface Colors
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  surfaceDim: '#0F0F0F',
  surfaceBright: '#2C2C2C',
  
  // Content Colors
  onBackground: '#E5E7EB',
  onSurface: '#E5E7EB',
  onSurfaceVariant: '#9CA3AF',
  
  // Primary Colors
  primary: '#A3C4F3',
  onPrimary: '#1F2937',
  primaryContainer: '#1E3A8A',
  onPrimaryContainer: '#DBEAFE',
  primaryFixed: '#A3C4F3',
  onPrimaryFixed: '#1F2937',
  
  // Secondary Colors
  secondary: '#A78BFA',
  onSecondary: '#1F2937',
  secondaryContainer: '#5B21B6',
  onSecondaryContainer: '#EDE9FE',
  secondaryFixed: '#A78BFA',
  onSecondaryFixed: '#1F2937',
  
  // Tertiary Colors
  tertiary: '#86EFAC',
  onTertiary: '#1F2937',
  tertiaryContainer: '#166534',
  onTertiaryContainer: '#DCFCE7',
  
  // System Colors
  error: '#F87171',
  onError: '#1F2937',
  errorContainer: '#7F1D1D',
  onErrorContainer: '#FECACA',
  
  // Utility Colors
  outline: '#6B7280',
  outlineVariant: '#374151',
  shadow: '#000000',
  scrim: '#000000',
  
  // Legacy support
  accent: '#A3C4F3',
  button: '#1F2937',
  divider: '#6B7280',
  text: '#E5E7EB',
};

const dawnMistMaterialConfig: MaterialDesignConfig = {
  elevation: lightElevation,
  surfaces: {
    tonal: true,
    elevationOverlay: true,
  },
  ripple: {
    enabled: true,
    color: '#A3C4F3',
    opacity: 0.12,
    duration: 300,
  },
};



export const dawnMistTheme: ThemeCollection = {
  id: 'dawn-mist',
  name: 'Dawn Mist',
  description: 'Soft whites, cool blues, and warm apricots for a gentle morning feel',
  light: dawnMistLight,
  dark: dawnMistDark,
  materialConfig: dawnMistMaterialConfig,
  animations: defaultAnimations,
  isCustom: false,
};

// ============================================================================
// Theme Collection: Midnight Ocean
// ============================================================================

const midnightOceanLight: ColorPalette = {
  // Surface Colors
  background: '#F0F8FF',
  surface: '#FFFFFF',
  surfaceVariant: '#E6F3FF',
  surfaceDim: '#E0F2FE',
  surfaceBright: '#FFFFFF',
  
  // Content Colors
  onBackground: '#0F172A',
  onSurface: '#0F172A',
  onSurfaceVariant: '#475569',
  
  // Primary Colors
  primary: '#0EA5E9',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E0F2FE',
  onPrimaryContainer: '#0C4A6E',
  primaryFixed: '#0EA5E9',
  onPrimaryFixed: '#FFFFFF',
  
  // Secondary Colors
  secondary: '#06B6D4',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#CFFAFE',
  onSecondaryContainer: '#164E63',
  secondaryFixed: '#06B6D4',
  onSecondaryFixed: '#FFFFFF',
  
  // Tertiary Colors
  tertiary: '#10B981',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#D1FAE5',
  onTertiaryContainer: '#065F46',
  
  // System Colors
  error: '#DC2626',
  onError: '#FFFFFF',
  errorContainer: '#FECACA',
  onErrorContainer: '#7F1D1D',
  
  // Utility Colors
  outline: '#64748B',
  outlineVariant: '#CBD5E1',
  shadow: '#000000',
  scrim: '#000000',
  
  // Legacy support
  accent: '#0EA5E9',
  button: '#F1F5F9',
  divider: '#64748B',
  text: '#0F172A',
};

const midnightOceanDark: ColorPalette = {
  // Surface Colors
  background: '#0C1821',
  surface: '#1E293B',
  surfaceVariant: '#334155',
  surfaceDim: '#020617',
  surfaceBright: '#475569',
  
  // Content Colors
  onBackground: '#F1F5F9',
  onSurface: '#F1F5F9',
  onSurfaceVariant: '#94A3B8',
  
  // Primary Colors
  primary: '#38BDF8',
  onPrimary: '#0C4A6E',
  primaryContainer: '#0369A1',
  onPrimaryContainer: '#E0F2FE',
  primaryFixed: '#38BDF8',
  onPrimaryFixed: '#0C4A6E',
  
  // Secondary Colors
  secondary: '#22D3EE',
  onSecondary: '#164E63',
  secondaryContainer: '#0891B2',
  onSecondaryContainer: '#CFFAFE',
  secondaryFixed: '#22D3EE',
  onSecondaryFixed: '#164E63',
  
  // Tertiary Colors
  tertiary: '#34D399',
  onTertiary: '#065F46',
  tertiaryContainer: '#059669',
  onTertiaryContainer: '#D1FAE5',
  
  // System Colors
  error: '#F87171',
  onError: '#7F1D1D',
  errorContainer: '#991B1B',
  onErrorContainer: '#FECACA',
  
  // Utility Colors
  outline: '#64748B',
  outlineVariant: '#475569',
  shadow: '#000000',
  scrim: '#000000',
  
  // Legacy support
  accent: '#38BDF8',
  button: '#334155',
  divider: '#64748B',
  text: '#F1F5F9',
};

export const midnightOceanTheme: ThemeCollection = {
  id: 'midnight-ocean',
  name: 'Midnight Ocean',
  description: 'Ocean blues, seafoam greens, and pearl whites for deep tranquility',
  light: midnightOceanLight,
  dark: midnightOceanDark,
  materialConfig: {
    elevation: lightElevation,
    surfaces: {
      tonal: true,
      elevationOverlay: true,
    },
    ripple: {
      enabled: true,
      color: '#0EA5E9',
      opacity: 0.12,
      duration: 300,
    },
  },
  animations: defaultAnimations,
  isCustom: false,
};

// ============================================================================
// Theme Collection: Forest Zen
// ============================================================================

const forestZenLight: ColorPalette = {
  // Surface Colors
  background: '#F7F9F7',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F4F0',
  surfaceDim: '#ECFDF5',
  surfaceBright: '#FFFFFF',
  
  // Content Colors
  onBackground: '#1C2E1C',
  onSurface: '#1C2E1C',
  onSurfaceVariant: '#4B5563',
  
  // Primary Colors
  primary: '#059669',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D1FAE5',
  onPrimaryContainer: '#064E3B',
  primaryFixed: '#059669',
  onPrimaryFixed: '#FFFFFF',
  
  // Secondary Colors
  secondary: '#92400E',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#FED7AA',
  onSecondaryContainer: '#451A03',
  secondaryFixed: '#92400E',
  onSecondaryFixed: '#FFFFFF',
  
  // Tertiary Colors
  tertiary: '#65A30D',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#ECFCCB',
  onTertiaryContainer: '#365314',
  
  // System Colors
  error: '#DC2626',
  onError: '#FFFFFF',
  errorContainer: '#FECACA',
  onErrorContainer: '#7F1D1D',
  
  // Utility Colors
  outline: '#6B7280',
  outlineVariant: '#D1D5DB',
  shadow: '#000000',
  scrim: '#000000',
  
  // Legacy support
  accent: '#059669',
  button: '#F3F4F6',
  divider: '#6B7280',
  text: '#1C2E1C',
};

const forestZenDark: ColorPalette = {
  // Surface Colors
  background: '#0F1B0F',
  surface: '#1A2E1A',
  surfaceVariant: '#2D3A2D',
  surfaceDim: '#0A120A',
  surfaceBright: '#374151',
  
  // Content Colors
  onBackground: '#ECFDF5',
  onSurface: '#ECFDF5',
  onSurfaceVariant: '#9CA3AF',
  
  // Primary Colors
  primary: '#10B981',
  onPrimary: '#064E3B',
  primaryContainer: '#047857',
  onPrimaryContainer: '#D1FAE5',
  primaryFixed: '#10B981',
  onPrimaryFixed: '#064E3B',
  
  // Secondary Colors
  secondary: '#F59E0B',
  onSecondary: '#451A03',
  secondaryContainer: '#92400E',
  onSecondaryContainer: '#FED7AA',
  secondaryFixed: '#F59E0B',
  onSecondaryFixed: '#451A03',
  
  // Tertiary Colors
  tertiary: '#84CC16',
  onTertiary: '#365314',
  tertiaryContainer: '#4D7C0F',
  onTertiaryContainer: '#ECFCCB',
  
  // System Colors
  error: '#F87171',
  onError: '#7F1D1D',
  errorContainer: '#991B1B',
  onErrorContainer: '#FECACA',
  
  // Utility Colors
  outline: '#6B7280',
  outlineVariant: '#374151',
  shadow: '#000000',
  scrim: '#000000',
  
  // Legacy support
  accent: '#10B981',
  button: '#2D3A2D',
  divider: '#6B7280',
  text: '#ECFDF5',
};

export const forestZenTheme: ThemeCollection = {
  id: 'forest-zen',
  name: 'Forest Zen',
  description: 'Sage greens, earth browns, and cream whites for natural harmony',
  light: forestZenLight,
  dark: forestZenDark,
  materialConfig: {
    elevation: lightElevation,
    surfaces: {
      tonal: true,
      elevationOverlay: true,
    },
    ripple: {
      enabled: true,
      color: '#059669',
      opacity: 0.12,
      duration: 300,
    },
  },
  animations: defaultAnimations,
  isCustom: false,
};

// ============================================================================
// Theme Collection: Sunset Glow
// ============================================================================

const sunsetGlowLight: ColorPalette = {
  // Surface Colors
  background: '#FFF7ED',
  surface: '#FFFFFF',
  surfaceVariant: '#FEF3C7',
  surfaceDim: '#FEF2F2',
  surfaceBright: '#FFFFFF',
  
  // Content Colors
  onBackground: '#1C0A00', // Darker for better contrast
  onSurface: '#1C0A00', // Darker for better contrast
  onSurfaceVariant: '#44403C', // Darker for better contrast
  
  // Primary Colors
  primary: '#C2410C', // Darker for better contrast
  onPrimary: '#FFFFFF',
  primaryContainer: '#FED7AA',
  onPrimaryContainer: '#7C2D12', // Darker for better contrast
  primaryFixed: '#C2410C',
  onPrimaryFixed: '#FFFFFF',
  
  // Secondary Colors
  secondary: '#BE185D', // Darker for better contrast
  onSecondary: '#FFFFFF',
  secondaryContainer: '#FCE7F3',
  onSecondaryContainer: '#701A75', // Darker for better contrast
  secondaryFixed: '#BE185D',
  onSecondaryFixed: '#FFFFFF',
  
  // Tertiary Colors
  tertiary: '#B45309', // Darker for better contrast
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FEF3C7',
  onTertiaryContainer: '#78350F', // Darker for better contrast
  
  // System Colors
  error: '#DC2626',
  onError: '#FFFFFF',
  errorContainer: '#FECACA',
  onErrorContainer: '#7F1D1D',
  
  // Utility Colors
  outline: '#78716C', // Darker for better contrast
  outlineVariant: '#D6D3D1',
  shadow: '#000000',
  scrim: '#000000',
  
  // Legacy support
  accent: '#C2410C',
  button: '#FEF2F2',
  divider: '#78716C',
  text: '#1C0A00',
};

const sunsetGlowDark: ColorPalette = {
  // Surface Colors
  background: '#1C0A00',
  surface: '#2D1B0E',
  surfaceVariant: '#44403C',
  surfaceDim: '#0C0A09',
  surfaceBright: '#57534E',
  
  // Content Colors
  onBackground: '#FFF7ED',
  onSurface: '#FFF7ED',
  onSurfaceVariant: '#D6D3D1', // Lighter for better contrast
  
  // Primary Colors
  primary: '#FB923C',
  onPrimary: '#1C0A00', // Darker for better contrast
  primaryContainer: '#C2410C',
  onPrimaryContainer: '#FED7AA',
  primaryFixed: '#FB923C',
  onPrimaryFixed: '#1C0A00',
  
  // Secondary Colors
  secondary: '#F472B6',
  onSecondary: '#1C0A00', // Darker for better contrast
  secondaryContainer: '#BE185D',
  onSecondaryContainer: '#FCE7F3',
  secondaryFixed: '#F472B6',
  onSecondaryFixed: '#1C0A00',
  
  // Tertiary Colors
  tertiary: '#FBBF24',
  onTertiary: '#1C0A00', // Darker for better contrast
  tertiaryContainer: '#B45309',
  onTertiaryContainer: '#FEF3C7',
  
  // System Colors
  error: '#F87171',
  onError: '#1C0A00', // Darker for better contrast
  errorContainer: '#991B1B',
  onErrorContainer: '#FECACA',
  
  // Utility Colors
  outline: '#A8A29E', // Lighter for better contrast
  outlineVariant: '#57534E',
  shadow: '#000000',
  scrim: '#000000',
  
  // Legacy support
  accent: '#FB923C',
  button: '#44403C',
  divider: '#A8A29E',
  text: '#FFF7ED',
};

export const sunsetGlowTheme: ThemeCollection = {
  id: 'sunset-glow',
  name: 'Sunset Glow',
  description: 'Warm oranges, coral pinks, and golden yellows for vibrant energy',
  light: sunsetGlowLight,
  dark: sunsetGlowDark,
  materialConfig: {
    elevation: lightElevation,
    surfaces: {
      tonal: true,
      elevationOverlay: true,
    },
    ripple: {
      enabled: true,
      color: '#EA580C',
      opacity: 0.12,
      duration: 300,
    },
  },
  animations: defaultAnimations,
  isCustom: false,
};

// ============================================================================
// Theme Collection: Arctic Minimal
// ============================================================================

const arcticMinimalLight: ColorPalette = {
  // Surface Colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  surfaceDim: '#F0F0F0',
  surfaceBright: '#FFFFFF',
  
  // Content Colors
  onBackground: '#0A0A0A',
  onSurface: '#0A0A0A',
  onSurfaceVariant: '#525252',
  
  // Primary Colors
  primary: '#374151',
  onPrimary: '#FFFFFF',
  primaryContainer: '#F3F4F6',
  onPrimaryContainer: '#111827',
  primaryFixed: '#374151',
  onPrimaryFixed: '#FFFFFF',
  
  // Secondary Colors
  secondary: '#6B7280',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E5E7EB',
  onSecondaryContainer: '#1F2937',
  secondaryFixed: '#6B7280',
  onSecondaryFixed: '#FFFFFF',
  
  // Tertiary Colors
  tertiary: '#059669',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#D1FAE5',
  onTertiaryContainer: '#064E3B',
  
  // System Colors
  error: '#DC2626',
  onError: '#FFFFFF',
  errorContainer: '#FECACA',
  onErrorContainer: '#7F1D1D',
  
  // Utility Colors
  outline: '#9CA3AF',
  outlineVariant: '#D1D5DB',
  shadow: '#000000',
  scrim: '#000000',
  
  // Legacy support
  accent: '#374151',
  button: '#F9FAFB',
  divider: '#E5E7EB',
  text: '#0A0A0A',
};

const arcticMinimalDark: ColorPalette = {
  // Surface Colors
  background: '#000000',
  surface: '#0A0A0A',
  surfaceVariant: '#171717',
  surfaceDim: '#000000',
  surfaceBright: '#262626',
  
  // Content Colors
  onBackground: '#FAFAFA',
  onSurface: '#FAFAFA',
  onSurfaceVariant: '#A3A3A3',
  
  // Primary Colors
  primary: '#D1D5DB',
  onPrimary: '#111827',
  primaryContainer: '#374151',
  onPrimaryContainer: '#F3F4F6',
  primaryFixed: '#D1D5DB',
  onPrimaryFixed: '#111827',
  
  // Secondary Colors
  secondary: '#9CA3AF',
  onSecondary: '#1F2937',
  secondaryContainer: '#4B5563',
  onSecondaryContainer: '#E5E7EB',
  secondaryFixed: '#9CA3AF',
  onSecondaryFixed: '#1F2937',
  
  // Tertiary Colors
  tertiary: '#10B981',
  onTertiary: '#064E3B',
  tertiaryContainer: '#047857',
  onTertiaryContainer: '#D1FAE5',
  
  // System Colors
  error: '#F87171',
  onError: '#7F1D1D',
  errorContainer: '#991B1B',
  onErrorContainer: '#FECACA',
  
  // Utility Colors
  outline: '#525252',
  outlineVariant: '#262626',
  shadow: '#000000',
  scrim: '#000000',
  
  // Legacy support
  accent: '#D1D5DB',
  button: '#171717',
  divider: '#525252',
  text: '#FAFAFA',
};

export const arcticMinimalTheme: ThemeCollection = {
  id: 'arctic-minimal',
  name: 'Arctic Minimal',
  description: 'Pure whites, ice blues, and crystal grays for clean simplicity',
  light: arcticMinimalLight,
  dark: arcticMinimalDark,
  materialConfig: {
    elevation: lightElevation,
    surfaces: {
      tonal: false, // Minimal theme uses less tonal surfaces
      elevationOverlay: true,
    },
    ripple: {
      enabled: true,
      color: '#374151',
      opacity: 0.08, // More subtle ripple for minimal theme
      duration: 300,
    },
  },
  animations: {
    ...defaultAnimations,
    // Slightly faster animations for minimal theme
    colorTransition: {
      ...defaultAnimations.colorTransition,
      duration: 250,
    },
    digitTransition: {
      ...defaultAnimations.digitTransition,
      duration: 100,
    },
  },
  isCustom: false,
};

// ============================================================================
// Legacy Theme Support (for backward compatibility)
// ============================================================================

export const lightTheme = {
  dark: false,
  colors: {
    background: dawnMistLight.background,
    text: dawnMistLight.text,
    accent: dawnMistLight.accent,
    secondary: dawnMistLight.secondary,
    button: dawnMistLight.button,
    divider: dawnMistLight.divider,
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    background: dawnMistDark.background,
    text: dawnMistDark.text,
    accent: dawnMistDark.accent,
    secondary: dawnMistDark.secondary,
    button: dawnMistDark.button,
    divider: dawnMistDark.divider,
  },
};

// ============================================================================
// Default Theme Collections Registry
// ============================================================================

export const defaultThemeCollections: ThemeCollection[] = [
  dawnMistTheme,
  midnightOceanTheme,
  forestZenTheme,
  sunsetGlowTheme,
  arcticMinimalTheme,
];
