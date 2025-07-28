import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { savePreference, loadPreference } from '../utils/storage';
import { ZenModeConfig, ZenAnimations, AnimationConfig } from '../types/theme';

interface ZenModeContextProps {
  zenMode: boolean;
  zenConfig: ZenModeConfig;
  zenAnimations: ZenAnimations;
  setZenMode: (zen: boolean) => void;
  updateZenConfig: (config: Partial<ZenModeConfig>) => void;
  updateZenAnimations: (animations: Partial<ZenAnimations>) => void;
  isTransitioning: boolean;
  isRevealed: boolean;
  setRevealed: (revealed: boolean) => void;
  resetRevealTimer: () => void;
}

const ZenModeContext = createContext<ZenModeContextProps | undefined>(undefined);

const DEFAULT_ZEN_CONFIG: ZenModeConfig = {
  enabled: false,
  autoHideDelay: 3000,
  breathingAnimation: true,
  pulseEffect: false,
  gradualDimming: true,
  tapToReveal: true,
  revealDuration: 3000,
  hideStatusBar: true,
  preventScreenDim: true,
};

const DEFAULT_ZEN_ANIMATIONS: ZenAnimations = {
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
    duration: 300,
    easing: 'ease-out',
  },
  revealAnimations: {
    duration: 250,
    easing: 'ease-in-out',
  },
};

const ZEN_MODE_STORAGE_KEY = 'zenMode';
const ZEN_CONFIG_STORAGE_KEY = 'zenConfig';
const ZEN_ANIMATIONS_STORAGE_KEY = 'zenAnimations';

export const ZenModeProvider = ({ children }: { children: ReactNode }) => {
  const [zenMode, setZenModeState] = useState(false);
  const [zenConfig, setZenConfig] = useState<ZenModeConfig>(DEFAULT_ZEN_CONFIG);
  const [zenAnimations, setZenAnimations] = useState<ZenAnimations>(DEFAULT_ZEN_ANIMATIONS);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealTimer, setRevealTimer] = useState<NodeJS.Timeout | null>(null);

  // Load zen mode settings on mount
  useEffect(() => {
    const loadZenSettings = async () => {
      try {
        const savedZenMode = await loadPreference(ZEN_MODE_STORAGE_KEY);
        const savedZenConfig = await loadPreference(ZEN_CONFIG_STORAGE_KEY);
        const savedZenAnimations = await loadPreference(ZEN_ANIMATIONS_STORAGE_KEY);

        if (savedZenMode !== null) {
          setZenModeState(savedZenMode === 'true');
        }

        if (savedZenConfig !== null) {
          const parsedConfig = JSON.parse(savedZenConfig);
          setZenConfig({ ...DEFAULT_ZEN_CONFIG, ...parsedConfig });
        }

        if (savedZenAnimations !== null) {
          const parsedAnimations = JSON.parse(savedZenAnimations);
          setZenAnimations({ ...DEFAULT_ZEN_ANIMATIONS, ...parsedAnimations });
        }
      } catch (error) {
        console.warn('Failed to load zen mode settings:', error);
      }
    };

    loadZenSettings();
  }, []);

  // Clean up reveal timer on unmount
  useEffect(() => {
    return () => {
      if (revealTimer) {
        clearTimeout(revealTimer);
      }
    };
  }, [revealTimer]);

  // Enhanced setZenMode with smooth transitions
  const setZenMode = async (zen: boolean) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    
    try {
      // Save zen mode state
      await savePreference(ZEN_MODE_STORAGE_KEY, zen.toString());
      
      // Apply zen mode with transition delay for smooth animation
      setTimeout(() => {
        setZenModeState(zen);
        setIsTransitioning(false);
      }, 150); // Small delay for smooth transition
      
    } catch (error) {
      console.warn('Failed to save zen mode state:', error);
      setZenModeState(zen);
      setIsTransitioning(false);
    }
  };

  // Update zen configuration with persistence
  const updateZenConfig = async (configUpdate: Partial<ZenModeConfig>) => {
    const newConfig = { ...zenConfig, ...configUpdate };
    
    try {
      await savePreference(ZEN_CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
      setZenConfig(newConfig);
    } catch (error) {
      console.warn('Failed to save zen config:', error);
      // Still update state even if save fails
      setZenConfig(newConfig);
    }
  };

  // Update zen animations with persistence
  const updateZenAnimations = async (animationsUpdate: Partial<ZenAnimations>) => {
    const newAnimations = { ...zenAnimations, ...animationsUpdate };
    
    try {
      await savePreference(ZEN_ANIMATIONS_STORAGE_KEY, JSON.stringify(newAnimations));
      setZenAnimations(newAnimations);
    } catch (error) {
      console.warn('Failed to save zen animations:', error);
      // Still update state even if save fails
      setZenAnimations(newAnimations);
    }
  };

  // Set revealed state with automatic timer reset
  const setRevealed = (revealed: boolean) => {
    setIsRevealed(revealed);
    
    if (revealed && zenConfig.tapToReveal) {
      // Clear existing timer
      if (revealTimer) {
        clearTimeout(revealTimer);
      }
      
      // Set new timer to hide controls after revealDuration
      const timer = setTimeout(() => {
        setIsRevealed(false);
        setRevealTimer(null);
      }, zenConfig.revealDuration);
      
      setRevealTimer(timer);
    } else if (!revealed && revealTimer) {
      // Clear timer if manually hiding
      clearTimeout(revealTimer);
      setRevealTimer(null);
    }
  };

  // Reset reveal timer (useful for extending reveal time on user interaction)
  const resetRevealTimer = () => {
    if (isRevealed && zenConfig.tapToReveal) {
      // Clear existing timer
      if (revealTimer) {
        clearTimeout(revealTimer);
      }
      
      // Set new timer
      const timer = setTimeout(() => {
        setIsRevealed(false);
        setRevealTimer(null);
      }, zenConfig.revealDuration);
      
      setRevealTimer(timer);
    }
  };

  return (
    <ZenModeContext.Provider 
      value={{ 
        zenMode, 
        zenConfig, 
        zenAnimations,
        setZenMode, 
        updateZenConfig, 
        updateZenAnimations,
        isTransitioning,
        isRevealed,
        setRevealed,
        resetRevealTimer
      }}
    >
      {children}
    </ZenModeContext.Provider>
  );
};

export const useZenModeContext = () => {
  const context = useContext(ZenModeContext);
  if (!context) throw new Error('useZenModeContext must be used within ZenModeProvider');
  return context;
};
