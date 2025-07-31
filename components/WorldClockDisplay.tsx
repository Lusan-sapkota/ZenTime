/**
 * World Clock Display Component
 * 
 * Displays multiple world clocks with beautiful animations and offline support
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Surface,
  TouchableRipple,
  IconButton,
  Chip,
} from 'react-native-paper';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import { useWorldClock, WorldClock } from '../contexts/WorldClockContext';
import { useTime } from '../hooks/useTime';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const { width: screenWidth } = Dimensions.get('window');

interface WorldClockDisplayProps {
  onAddClock: () => void;
}

export const WorldClockDisplay: React.FC<WorldClockDisplayProps> = ({
  onAddClock,
}) => {
  const { getCurrentColors } = useEnhancedTheme();
  const { worldClocks, removeWorldClock, isOffline } = useWorldClock();
  const colors = getCurrentColors();
  const now = useTime(undefined, 1000);

  const [animatedValues] = useState(() =>
    worldClocks.map(() => new Animated.Value(0))
  );

  // Animate clocks on mount
  useEffect(() => {
    const animations = animatedValues.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, animations).start();
  }, [worldClocks.length]);

  const getTimeForTimezone = (timezone: string, offset: number) => {
    try {
      // Try to use Intl.DateTimeFormat for accurate timezone conversion
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      return formatter.format(now.toDate());
    } catch (error) {
      // Fallback to manual offset calculation for offline mode
      const utc = now.utc();
      const localTime = utc.add(offset, 'hour');
      return localTime.format('HH:mm:ss');
    }
  };

  const getDateForTimezone = (timezone: string, offset: number) => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      return formatter.format(now.toDate());
    } catch (error) {
      // Fallback for offline mode
      const utc = now.utc();
      const localTime = utc.add(offset, 'hour');
      return localTime.format('ddd, MMM D');
    }
  };

  const isNextDay = (timezone: string, offset: number) => {
    try {
      const localDate = new Date();
      const timezoneDate = new Date(localDate.toLocaleString('en-US', { timeZone: timezone }));
      return timezoneDate.getDate() !== localDate.getDate();
    } catch (error) {
      // Fallback calculation
      const utc = now.utc();
      const localTime = utc.add(offset, 'hour');
      return localTime.date() !== now.date();
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
    },
    addButton: {
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 10,
      backgroundColor: colors.primaryContainer,
      borderRadius: 28,
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    offlineIndicator: {
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 10,
    },
    scrollContainer: {
      paddingTop: 80,
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    clockCard: {
      marginBottom: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    clockContent: {
      padding: 20,
      minHeight: 120,
    },
    clockHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    clockLocation: {
      flex: 1,
    },
    clockCity: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: colors.onSurface,
    },
    clockCountry: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.onSurfaceVariant,
      marginTop: 2,
    },
    clockTime: {
      fontSize: 32,
      fontFamily: 'Inter_700Bold',
      color: colors.primary,
      textAlign: 'center',
      marginVertical: 8,
    },
    clockDate: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
    nextDayIndicator: {
      backgroundColor: colors.tertiaryContainer,
      color: colors.onTertiaryContainer,
      fontSize: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: 4,
      alignSelf: 'center',
    },
    removeButton: {
      backgroundColor: colors.errorContainer,
    },
    defaultClockIndicator: {
      backgroundColor: colors.primaryContainer,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyStateText: {
      fontSize: 16,
      fontFamily: 'Inter_500Medium',
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 16,
    },
    emptyStateSubtext: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 8,
      opacity: 0.7,
    },
  });

  const renderClockCard = (clock: WorldClock, index: number) => {
    const time = getTimeForTimezone(clock.timezone, clock.offset);
    const date = getDateForTimezone(clock.timezone, clock.offset);
    const showNextDay = isNextDay(clock.timezone, clock.offset);

    return (
      <Animated.View
        key={clock.id}
        style={{
          opacity: animatedValues[index] || 1,
          transform: [
            {
              translateY: animatedValues[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }) || 0,
            },
          ],
        }}
      >
        <Surface
          style={[
            dynamicStyles.clockCard,
            clock.isDefault && dynamicStyles.defaultClockIndicator,
          ]}
          elevation={2}
        >
          <TouchableRipple
            style={dynamicStyles.clockContent}
            rippleColor={colors.primary + '10'}
            onPress={() => {}}
          >
            <View>
              {/* Header */}
              <View style={dynamicStyles.clockHeader}>
                <View style={dynamicStyles.clockLocation}>
                  <Text style={dynamicStyles.clockCity}>{clock.city}</Text>
                  <Text style={dynamicStyles.clockCountry}>
                    {clock.country}
                    {clock.isDefault && ' • Local Time'}
                  </Text>
                </View>
                
                {!clock.isDefault && (
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => removeWorldClock(clock.id)}
                    style={dynamicStyles.removeButton}
                    iconColor={colors.onErrorContainer}
                  />
                )}
              </View>

              {/* Time Display */}
              <Text style={dynamicStyles.clockTime}>{time}</Text>
              
              {/* Date */}
              <Text style={dynamicStyles.clockDate}>{date}</Text>
              
              {/* Next Day Indicator */}
              {showNextDay && (
                <Text style={dynamicStyles.nextDayIndicator}>
                  +1 day
                </Text>
              )}
            </View>
          </TouchableRipple>
        </Surface>
      </Animated.View>
    );
  };

  if (worldClocks.length === 0) {
    return (
      <View style={dynamicStyles.container}>
        <IconButton
          icon="plus"
          size={24}
          onPress={onAddClock}
          style={dynamicStyles.addButton}
          iconColor={colors.onPrimaryContainer}
        />
        
        <View style={dynamicStyles.emptyState}>
          <Text style={{ fontSize: 48 }}>🌍</Text>
          <Text style={dynamicStyles.emptyStateText}>
            No world clocks added yet
          </Text>
          <Text style={dynamicStyles.emptyStateSubtext}>
            Tap the + button to add clocks from different time zones
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {/* Add Button */}
      <IconButton
        icon="plus"
        size={24}
        onPress={onAddClock}
        style={dynamicStyles.addButton}
        iconColor={colors.onPrimaryContainer}
      />

      {/* Offline Indicator */}
      {isOffline && (
        <Chip
          style={dynamicStyles.offlineIndicator}
          textStyle={{ fontSize: 10 }}
          compact
        >
          Offline
        </Chip>
      )}

      {/* World Clocks */}
      <ScrollView
        style={dynamicStyles.container}
        contentContainerStyle={dynamicStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {worldClocks.map(renderClockCard)}
      </ScrollView>
    </View>
  );
};