/**
 * World Clock Context
 * 
 * Manages multiple world clocks with offline support and graceful handling
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { savePreference, loadPreference } from '../utils/storage';

export interface WorldClock {
  id: string;
  timezone: string;
  city: string;
  country: string;
  offset: number; // UTC offset in hours
  isDefault?: boolean;
  createdAt: Date;
}

interface WorldClockContextType {
  worldClocks: WorldClock[];
  addWorldClock: (clock: Omit<WorldClock, 'id' | 'createdAt'>) => void;
  removeWorldClock: (id: string) => void;
  updateWorldClock: (id: string, updates: Partial<WorldClock>) => void;
  isOffline: boolean;
  lastSyncTime: Date | null;
}

const WorldClockContext = createContext<WorldClockContextType | undefined>(undefined);

const STORAGE_KEY = 'world_clocks';

// Default world clocks for offline fallback
const defaultWorldClocks: WorldClock[] = [
  {
    id: 'default-local',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    city: 'Local Time',
    country: 'Current Location',
    offset: new Date().getTimezoneOffset() / -60,
    isDefault: true,
    createdAt: new Date(),
  },
];

// Popular timezones for quick selection
export const popularTimezones = [
  { timezone: 'America/New_York', city: 'New York', country: 'USA', offset: -5 },
  { timezone: 'America/Los_Angeles', city: 'Los Angeles', country: 'USA', offset: -8 },
  { timezone: 'Europe/London', city: 'London', country: 'UK', offset: 0 },
  { timezone: 'Europe/Paris', city: 'Paris', country: 'France', offset: 1 },
  { timezone: 'Asia/Tokyo', city: 'Tokyo', country: 'Japan', offset: 9 },
  { timezone: 'Asia/Shanghai', city: 'Shanghai', country: 'China', offset: 8 },
  { timezone: 'Asia/Dubai', city: 'Dubai', country: 'UAE', offset: 4 },
  { timezone: 'Australia/Sydney', city: 'Sydney', country: 'Australia', offset: 11 },
  { timezone: 'Asia/Kolkata', city: 'Mumbai', country: 'India', offset: 5.5 },
  { timezone: 'America/Sao_Paulo', city: 'São Paulo', country: 'Brazil', offset: -3 },
];

export const WorldClockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [worldClocks, setWorldClocks] = useState<WorldClock[]>(defaultWorldClocks);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Load saved world clocks on mount
  useEffect(() => {
    const loadWorldClocks = async () => {
      try {
        const saved = await loadPreference(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Convert date strings back to Date objects
            const clocks = parsed.map(clock => ({
              ...clock,
              createdAt: new Date(clock.createdAt),
            }));
            setWorldClocks(clocks);
            setLastSyncTime(new Date());
          }
        }
      } catch (error) {
        console.warn('Failed to load world clocks, using defaults:', error);
        setIsOffline(true);
      }
    };

    loadWorldClocks();
  }, []);

  // Save world clocks whenever they change
  useEffect(() => {
    const saveWorldClocks = async () => {
      try {
        await savePreference(STORAGE_KEY, JSON.stringify(worldClocks));
        setLastSyncTime(new Date());
        setIsOffline(false);
      } catch (error) {
        console.warn('Failed to save world clocks:', error);
        setIsOffline(true);
      }
    };

    // Don't save on initial load
    if (worldClocks !== defaultWorldClocks) {
      saveWorldClocks();
    }
  }, [worldClocks]);

  const addWorldClock = (clock: Omit<WorldClock, 'id' | 'createdAt'>) => {
    const newClock: WorldClock = {
      ...clock,
      id: `clock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date(),
    };

    setWorldClocks(prev => [...prev, newClock]);
  };

  const removeWorldClock = (id: string) => {
    setWorldClocks(prev => prev.filter(clock => clock.id !== id));
  };

  const updateWorldClock = (id: string, updates: Partial<WorldClock>) => {
    setWorldClocks(prev =>
      prev.map(clock =>
        clock.id === id ? { ...clock, ...updates } : clock
      )
    );
  };

  const contextValue: WorldClockContextType = {
    worldClocks,
    addWorldClock,
    removeWorldClock,
    updateWorldClock,
    isOffline,
    lastSyncTime,
  };

  return (
    <WorldClockContext.Provider value={contextValue}>
      {children}
    </WorldClockContext.Provider>
  );
};

export const useWorldClock = () => {
  const context = useContext(WorldClockContext);
  if (!context) {
    throw new Error('useWorldClock must be used within WorldClockProvider');
  }
  return context;
};