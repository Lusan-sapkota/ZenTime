import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StopwatchDisplay } from '../components/StopwatchDisplay';
import { MaterialButton } from '../components/MaterialButton';
import { useStopwatch } from '../hooks/useStopwatch';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import { formatTime } from '../utils/formatTime';

export const StopwatchScreen = () => {
  const { running, elapsed, start, stop, reset } = useStopwatch();
  const { getCurrentColors } = useEnhancedTheme();
  const colors = getCurrentColors();

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingBottom: 48,
      gap: 16,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <StopwatchDisplay 
        time={formatTime(elapsed)} 
        elapsed={elapsed}
        running={running}
      />
      <View style={dynamicStyles.controlsContainer}>
        <MaterialButton
          title={running ? 'Stop' : 'Start'}
          onPress={running ? stop : start}
          variant={running ? 'outlined' : 'filled'}
          style={{ flex: 1 }}
        />
        <MaterialButton
          title="Reset"
          onPress={reset}
          variant="text"
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};
