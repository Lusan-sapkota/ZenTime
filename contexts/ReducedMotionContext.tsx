/**
 * Reduced Motion Context
 * 
 * This context provides accessibility support for users who prefer reduced motion,
 * automatically detecting system preferences and providing manual controls.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { savePreference, loadPreference } from '../utils/storage';
import { PerformanceSettings } from '../types/theme';

// ============================================================================
// Reduced Motion Context Interface
// ============================================================================

export interface ReducedMotionContextType {
  // Current state
  isReducedMotionEnabled: boolean;
  isSystemReducedMotion: boolean;
  isManuallyEnabled: boolean;
  
  // Controls
  enableReducedMotion: () => void;
  disableReducedMotion: () => void;
  toggleReducedMotion: () => void;
  resetToSystemPreference: () => void;
  
  // Animation helpers
  shouldAnimateTransitions: boolean;
  shouldAnimateDecorative: boolean;
  shouldAnimateEssential: boolean;
  
  // Performance integration
  getOptimizedDuration: (originalDuration: number) => number;
  getOptimizedIterations: (originalIterations: number | 'infinite') => number | 'infinite';
  shouldUseHardwareAcceleration: boolean;
}

// ============================================================================
// Animation Categories
// ============================================================================

/**
 * Animation categories for reduced motion handling
 */
export enum AnimationCategory {
  ESSENTIAL = 'essential',     // Critical for UX (loading, state changes)
  TRANSITIONS = 'transitions', // Page/screen transitions
  DECORATIVE = 'decorative',   // Visual enhancements, ambient effects
}

/**
 * Reduced motion levels
 */
export enum ReducedMotionLevel {
  NONE = 'none',           // All animations enabled
  REDUCED = 'reduced',     // Reduce decorative animations
  MINIMAL = 'minimal',     // Only essential animations
  DISABLED = 'disabled',   // No animations
}

// ============================================================================
// Context Implementation
// ============================================================================

const ReducedMotionContext = createContext<ReducedMotionContextType | undefined>(undefined);

interface ReducedMotionProviderProps {
  children: ReactNode;
  performanceSettings?: PerformanceSettings;
}

export const ReducedMotionProvider: React.FC<ReducedMotionProviderProps> = ({
  children,
  performanceSettings,
}) => {
  const [isSystemReducedMotion, setIsSystemReducedMotion] = useState(false);
  const [isManuallyEnabled, setIsManuallyEnabled] = useState<boolean | null>(null);
  const [reducedMotionLevel, setReducedMotionLevel] = useState<ReducedMotionLevel>(ReducedMotionLevel.NONE);

  const STORAGE_KEY = 'reduced_motion_preference';

  // Load saved preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const saved = await loadPreference(STORAGE_KEY);
        if (saved !== null) {
          const preference = JSON.parse(saved);
          setIsManuallyEnabled(preference.manuallyEnabled);
          setReducedMotionLevel(preference.level || ReducedMotionLevel.NONE);
        }
      } catch (error) {
        console.warn('Failed to load reduced motion preference:', error);
      }
    };

    loadPreference();
  }, []);

  // Listen to system accessibility changes
  useEffect(() => {
    const checkSystemPreference = async () => {
      try {
        if (Platform.OS === 'ios') {
          // iOS: Check for reduce motion preference
          const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
          setIsSystemReducedMotion(isEnabled);
        } else if (Platform.OS === 'android') {
          // Android: Check for animation scale settings
          // Note: This is a simplified check, actual implementation would need native module
          const animationScale = await AccessibilityInfo.isReduceTransparencyEnabled();
          setIsSystemReducedMotion(animationScale);
        }
      } catch (error) {
        console.warn('Failed to check system reduced motion preference:', error);
        setIsSystemReducedMotion(false);
      }
    };

    checkSystemPreference();

    // Listen for changes (iOS only)
    if (Platform.OS === 'ios') {
      const subscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        setIsSystemReducedMotion
      );

      return () => subscription?.remove();
    }
  }, []);

  // Determine final reduced motion state
  const isReducedMotionEnabled = isManuallyEnabled !== null 
    ? isManuallyEnabled 
    : isSystemReducedMotion || (performanceSettings?.reducedMotion ?? false);

  // Update reduced motion level based on performance settings
  useEffect(() => {
    if (performanceSettings?.performanceLevel === 'low') {
      setReducedMotionLevel(ReducedMotionLevel.MINIMAL);
    } else if (isReducedMotionEnabled) {
      setReducedMotionLevel(ReducedMotionLevel.REDUCED);
    } else {
      setReducedMotionLevel(ReducedMotionLevel.NONE);
    }
  }, [isReducedMotionEnabled, performanceSettings?.performanceLevel]);

  // Save preference when manually changed
  const savePreference = async (manuallyEnabled: boolean | null, level: ReducedMotionLevel) => {
    try {
      await savePreference(STORAGE_KEY, JSON.stringify({
        manuallyEnabled,
        level,
      }));
    } catch (error) {
      console.warn('Failed to save reduced motion preference:', error);
    }
  };

  // Control functions
  const enableReducedMotion = () => {
    setIsManuallyEnabled(true);
    setReducedMotionLevel(ReducedMotionLevel.REDUCED);
    savePreference(true, ReducedMotionLevel.REDUCED);
  };

  const disableReducedMotion = () => {
    setIsManuallyEnabled(false);
    setReducedMotionLevel(ReducedMotionLevel.NONE);
    savePreference(false, ReducedMotionLevel.NONE);
  };

  const toggleReducedMotion = () => {
    if (isReducedMotionEnabled) {
      disableReducedMotion();
    } else {
      enableReducedMotion();
    }
  };

  const resetToSystemPreference = () => {
    setIsManuallyEnabled(null);
    const level = isSystemReducedMotion ? ReducedMotionLevel.REDUCED : ReducedMotionLevel.NONE;
    setReducedMotionLevel(level);
    savePreference(null, level);
  };

  // Animation category helpers
  const shouldAnimateTransitions = reducedMotionLevel === ReducedMotionLevel.NONE || 
                                  reducedMotionLevel === ReducedMotionLevel.REDUCED;
  
  const shouldAnimateDecorative = reducedMotionLevel === ReducedMotionLevel.NONE;
  
  const shouldAnimateEssential = reducedMotionLevel !== ReducedMotionLevel.DISABLED;

  // Performance helpers
  const getOptimizedDuration = (originalDuration: number): number => {
    switch (reducedMotionLevel) {
      case ReducedMotionLevel.DISABLED:
        return 0;
      case ReducedMotionLevel.MINIMAL:
        return Math.min(originalDuration * 0.3, 100);
      case ReducedMotionLevel.REDUCED:
        return originalDuration * 0.6;
      case ReducedMotionLevel.NONE:
      default:
        return originalDuration;
    }
  };

  const getOptimizedIterations = (originalIterations: number | 'infinite'): number | 'infinite' => {
    if (reducedMotionLevel === ReducedMotionLevel.DISABLED) {
      return 1;
    }
    
    if (originalIterations === 'infinite') {
      return reducedMotionLevel === ReducedMotionLevel.MINIMAL ? 1 : 'infinite';
    }
    
    switch (reducedMotionLevel) {
      case ReducedMotionLevel.MINIMAL:
        return 1;
      case ReducedMotionLevel.REDUCED:
        return Math.min(originalIterations, 3);
      case ReducedMotionLevel.NONE:
      default:
        return originalIterations;
    }
  };

  const shouldUseHardwareAcceleration = performanceSettings?.hardwareAcceleration !== false && 
                                       reducedMotionLevel !== ReducedMotionLevel.DISABLED;

  const contextValue: ReducedMotionContextType = {
    // Current state
    isReducedMotionEnabled,
    isSystemReducedMotion,
    isManuallyEnabled: isManuallyEnabled ?? false,
    
    // Controls
    enableReducedMotion,
    disableReducedMotion,
    toggleReducedMotion,
    resetToSystemPreference,
    
    // Animation helpers
    shouldAnimateTransitions,
    shouldAnimateDecorative,
    shouldAnimateEssential,
    
    // Performance integration
    getOptimizedDuration,
    getOptimizedIterations,
    shouldUseHardwareAcceleration,
  };

  return (
    <ReducedMotionContext.Provider value={contextValue}>
      {children}
    </ReducedMotionContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useReducedMotion = (): ReducedMotionContextType => {
  const context = useContext(ReducedMotionContext);
  if (!context) {
    throw new Error('useReducedMotion must be used within ReducedMotionProvider');
  }
  return context;
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Higher-order component to wrap animations with reduced motion support
 */
export const withReducedMotion = <T extends object>(
  Component: React.ComponentType<T>,
  animationCategory: AnimationCategory = AnimationCategory.DECORATIVE
) => {
  return React.forwardRef<any, T>((props, ref) => {
    const { 
      shouldAnimateTransitions, 
      shouldAnimateDecorative, 
      shouldAnimateEssential 
    } = useReducedMotion();

    let shouldAnimate = true;
    switch (animationCategory) {
      case AnimationCategory.ESSENTIAL:
        shouldAnimate = shouldAnimateEssential;
        break;
      case AnimationCategory.TRANSITIONS:
        shouldAnimate = shouldAnimateTransitions;
        break;
      case AnimationCategory.DECORATIVE:
        shouldAnimate = shouldAnimateDecorative;
        break;
    }

    return <Component {...props} ref={ref} shouldAnimate={shouldAnimate} />;
  });
};

/**
 * Hook for conditional animation execution
 */
export const useConditionalAnimation = (category: AnimationCategory = AnimationCategory.DECORATIVE) => {
  const { 
    shouldAnimateTransitions, 
    shouldAnimateDecorative, 
    shouldAnimateEssential,
    getOptimizedDuration,
    getOptimizedIterations,
  } = useReducedMotion();

  let shouldAnimate = true;
  switch (category) {
    case AnimationCategory.ESSENTIAL:
      shouldAnimate = shouldAnimateEssential;
      break;
    case AnimationCategory.TRANSITIONS:
      shouldAnimate = shouldAnimateTransitions;
      break;
    case AnimationCategory.DECORATIVE:
      shouldAnimate = shouldAnimateDecorative;
      break;
  }

  return {
    shouldAnimate,
    getOptimizedDuration,
    getOptimizedIterations,
  };
};