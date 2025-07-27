import React from 'react';
import { View, Text } from 'react-native';
import { ZenToggle } from '../components/ZenToggle';
import { useZenModeContext } from '../contexts/ZenModeContext';
import { useThemeContext } from '../contexts/ThemeContext';

export const SettingsScreen = () => {
  const { zenMode, setZenMode } = useZenModeContext();
  const { theme, setTheme } = useThemeContext();
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text>Theme</Text>
      <ZenToggle value={theme === 'dark'} onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      <Text>Zen Mode</Text>
      <ZenToggle value={zenMode} onValueChange={setZenMode} />
    </View>
  );
};
