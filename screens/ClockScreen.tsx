import React, { useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { FAB, Portal } from 'react-native-paper';
import { ClockDisplay } from '../components/ClockDisplay';
import { WorldClockDisplay } from '../components/WorldClockDisplay';
import { WorldClockSelector } from '../components/WorldClockSelector';
import { ZenModeOverlay } from '../components/ZenModeOverlay';
import { ZenToggle } from '../components/ZenToggle';
import { useTime } from '../hooks/useTime';
import { useZenModeContext } from '../contexts/ZenModeContext';
import { useWorldClock } from '../contexts/WorldClockContext';
import { useEnhancedTheme } from '../contexts/ThemeContext';

export const ClockScreen = () => {
  const now = useTime(undefined, 1000);
  const { zenMode, setZenMode } = useZenModeContext();
  const { worldClocks } = useWorldClock();
  const { getCurrentColors } = useEnhancedTheme();
  const colors = getCurrentColors();
  
  const [showWorldClockSelector, setShowWorldClockSelector] = useState(false);
  const [showWorldClocks, setShowWorldClocks] = useState(false);
  const [fabAnimation] = useState(new Animated.Value(1));

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    mainClockContainer: {
      flex: 1,
    },
    worldClockContainer: {
      flex: 1,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: colors.primaryContainer,
    },
    fabWorldClock: {
      backgroundColor: colors.tertiaryContainer,
    },
  });
  
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

  const handleAddWorldClock = () => {
    setShowWorldClockSelector(true);
  };

  // Toggle between main clock and world clocks view with animation
  const toggleView = () => {
    Animated.sequence([
      Animated.timing(fabAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fabAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setShowWorldClocks(!showWorldClocks);
  };

  if (showWorldClocks) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.worldClockContainer}>
          <WorldClockDisplay onAddClock={handleAddWorldClock} />
        </View>
        
        {/* FAB to go back to main clock */}
        <Portal>
          <Animated.View style={{ opacity: fabAnimation }}>
            <FAB
              icon="clock-outline"
              style={[dynamicStyles.fab, dynamicStyles.fabWorldClock]}
              onPress={toggleView}
              label="Main Clock"
              color={colors.onTertiaryContainer}
            />
          </Animated.View>
        </Portal>
        
        <WorldClockSelector
          visible={showWorldClockSelector}
          onClose={() => setShowWorldClockSelector(false)}
        />
      </View>
    );
  }

  return (
    <ZenModeOverlay controls={controls}>
      <View style={dynamicStyles.mainClockContainer}>
        <ClockDisplay time={now.format('HH:mm:ss')} zenMode={zenMode} />
      </View>
      
      {/* FAB to access world clocks - only show if not in zen mode */}
      {!zenMode && (
        <Portal>
          <Animated.View style={{ opacity: fabAnimation }}>
            <FAB
              icon="earth"
              style={dynamicStyles.fab}
              onPress={toggleView}
              label={worldClocks.length > 1 ? `${worldClocks.length - 1} World Clocks` : "World Clocks"}
              color={colors.onPrimaryContainer}
            />
          </Animated.View>
        </Portal>
      )}
      
      <WorldClockSelector
        visible={showWorldClockSelector}
        onClose={() => setShowWorldClockSelector(false)}
      />
    </ZenModeOverlay>
  );
};
