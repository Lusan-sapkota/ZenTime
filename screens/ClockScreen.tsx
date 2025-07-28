import React from 'react';
import { View } from 'react-native';
import { ClockDisplay } from '../components/ClockDisplay';
import { ZenModeOverlay } from '../components/ZenModeOverlay';
import { ZenToggle } from '../components/ZenToggle';
import { useTime } from '../hooks/useTime';
import { useZenModeContext } from '../contexts/ZenModeContext';

export const ClockScreen = () => {
  const now = useTime();
  const { zenMode, setZenMode } = useZenModeContext();
  
  // Controls that can be revealed in zen mode
  const controls = (
    <View style={{ 
      position: 'absolute', 
      top: 50, 
      right: 20,
      zIndex: 10 
    }}>
      <ZenToggle value={zenMode} onValueChange={setZenMode} />
    </View>
  );

  return (
    <ZenModeOverlay controls={controls}>
      <ClockDisplay time={now.format('HH:mm:ss')} zenMode={zenMode} />
    </ZenModeOverlay>
  );
};
