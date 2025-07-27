
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { EnhancedThemeProvider } from './contexts/ThemeContext';
import { ZenModeProvider } from './contexts/ZenModeContext';
import { ClockScreen } from './screens/ClockScreen';
import { StopwatchScreen } from './screens/StopwatchScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <EnhancedThemeProvider>
      <ZenModeProvider>
        <PaperProvider>
          <NavigationContainer>
            <Tab.Navigator>
              <Tab.Screen name="Clock" component={ClockScreen} />
              <Tab.Screen name="Stopwatch" component={StopwatchScreen} />
              <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </ZenModeProvider>
    </EnhancedThemeProvider>
  );
}
