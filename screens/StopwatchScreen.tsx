import React from 'react';
import { View, Button } from 'react-native';
import { StopwatchDisplay } from '../components/StopwatchDisplay';
import { useStopwatch } from '../hooks/useStopwatch';
import { formatTime } from '../utils/formatTime';

export const StopwatchScreen = () => {
  const { running, elapsed, start, stop, reset } = useStopwatch();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <StopwatchDisplay time={formatTime(elapsed)} />
      <Button title={running ? 'Stop' : 'Start'} onPress={running ? stop : start} />
      <Button title="Reset" onPress={reset} />
    </View>
  );
};
