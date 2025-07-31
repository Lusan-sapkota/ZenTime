/**
 * Enhanced Tab Navigator Component
 * 
 * This component provides material design elevation and theming
 * for the bottom tab navigation, integrating with the enhanced theme system.
 */

import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import { ELEVATION_LEVELS } from '../utils/elevationUtils';
import { ClockScreen } from '../screens/ClockScreen';
import { StopwatchScreen } from '../screens/StopwatchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export const EnhancedTabNavigator: React.FC = () => {
  const { getCurrentColors, getMaterialConfig } = useEnhancedTheme();
  const colors = getCurrentColors();
  const materialConfig = getMaterialConfig();

  // Get elevation style for navigation bar
  const navigationElevation = materialConfig.elevation.level4;

  return (
    <Tab.Navigator
      screenOptions={{
        // Header styling with material design elevation
        headerStyle: {
          backgroundColor: colors.surface,
          shadowColor: navigationElevation.shadowColor,
          shadowOffset: navigationElevation.shadowOffset,
          shadowOpacity: navigationElevation.shadowOpacity,
          shadowRadius: navigationElevation.shadowRadius,
          elevation: navigationElevation.elevation,
        },
        headerTitleStyle: {
          color: colors.onSurface,
          fontFamily: 'Inter_600SemiBold',
          fontSize: 20,
        },
        headerTintColor: colors.primary,

        // Tab bar styling with material design elevation
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outline,
          borderTopWidth: 0.5,
          shadowColor: navigationElevation.shadowColor,
          shadowOffset: navigationElevation.shadowOffset,
          shadowOpacity: navigationElevation.shadowOpacity,
          shadowRadius: navigationElevation.shadowRadius,
          elevation: navigationElevation.elevation,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          marginTop: 4,
        },

        // Tab bar icon styling
        tabBarIconStyle: {
          marginBottom: 2,
        },

        // Animation and interaction
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: false,
      }}
    >
      <Tab.Screen 
        name="Clock" 
        component={ClockScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            // Using a simple circle as placeholder - you can replace with actual icons
            <TabIcon name="clock" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Stopwatch" 
        component={StopwatchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="stopwatch" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Simple tab icon component (placeholder - replace with actual icon library)
interface TabIconProps {
  name: string;
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, color, size }) => {
  const iconMap: Record<string, string> = {
    clock: '🕐',
    stopwatch: '⏱️',
    settings: '⚙️',
  };

  return (
    <Text style={{ 
      fontSize: size, 
      color,
      textAlign: 'center',
    }}>
      {iconMap[name] || '●'}
    </Text>
  );
};