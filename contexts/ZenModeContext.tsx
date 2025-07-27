import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ZenModeContextProps {
  zenMode: boolean;
  setZenMode: (zen: boolean) => void;
}

const ZenModeContext = createContext<ZenModeContextProps | undefined>(undefined);

export const ZenModeProvider = ({ children }: { children: ReactNode }) => {
  const [zenMode, setZenMode] = useState(true);
  return (
    <ZenModeContext.Provider value={{ zenMode, setZenMode }}>
      {children}
    </ZenModeContext.Provider>
  );
};

export const useZenModeContext = () => {
  const context = useContext(ZenModeContext);
  if (!context) throw new Error('useZenModeContext must be used within ZenModeProvider');
  return context;
};
