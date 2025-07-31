
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { EnhancedThemeProvider } from './contexts/ThemeContext';
import { ZenModeProvider } from './contexts/ZenModeContext';
import { WorldClockProvider } from './contexts/WorldClockContext';
import { HeaderNavigator } from './components/HeaderNavigator';

export default function App() {
  return (
    <EnhancedThemeProvider>
      <ZenModeProvider>
        <WorldClockProvider>
          <PaperProvider>
            <NavigationContainer>
              <HeaderNavigator />
            </NavigationContainer>
          </PaperProvider>
        </WorldClockProvider>
      </ZenModeProvider>
    </EnhancedThemeProvider>
  );
}
