import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { savePreference, loadPreference } from '../utils/storage';
import { ZenModeConfig } from '../types/theme';

interface ZenModeContextProps {
  zenMode: boolean;
  zenConfig: ZenModeConfig;
  setZenMode: (zen: boolean) => void;
  updateZenConfig: (config: Partial<ZenModeConfig>) => void;
  isTransitioning: boolean;
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

const ZEN_MODE_STORAGE_KEY = 'zenMode';
const ZEN_CONFIG_STORAGE_KEY = 'zenConfig';

export const ZenModeProvider = ({ children }: { children: ReactNode }) => {
  const [zenMode, setZenModeState] = useState(false);
  const [zenConfig, setZenConfig] = useState<ZenModeConfig>(DEFAULT_ZEN_CONFIG);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load zen mode settings on mount
  useEffect(() => {
    const loadZenSettings = async () => {
      try {
        const savedZenMode = await loadPreference(ZEN_MODE_STORAGE_KEY);
        const savedZenConfig = await loadPreference(ZEN_CONFIG_STORAGE_KEY);

        if (savedZenMode !== null) {
          setZenModeState(savedZenMode === 'true');
        }

        if (savedZenConfig !== null) {
          const parsedConfig = JSON.parse(savedZenConfig);
          setZenConfig({ ...DEFAULT_ZEN_CONFIG, ...parsedConfig });
        }
      } catch (error) {
        console.warn('Failed to load zen mode settings:', error);
      }
    };

    loadZenSettings();
  }, []);

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

  return (
    <ZenModeContext.Provider 
      value={{ 
        zenMode, 
        zenConfig, 
        setZenMode, 
        updateZenConfig, 
        isTransitioning 
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
