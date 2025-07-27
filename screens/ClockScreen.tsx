import React from 'react';
import { View } from 'react-native';
import { ClockDisplay } from '../components/ClockDisplay';
import { useTime } from '../hooks/useTime';
import { useZenModeContext } from '../contexts/ZenModeContext';

export const ClockScreen = () => {
  const now = useTime();
  const { zenMode } = useZenModeContext();
  return (
    <View style={{ flex: 1 }}>
      <ClockDisplay time={now.format('HH:mm:ss')} zenMode={zenMode} />
    </View>
  );
};
