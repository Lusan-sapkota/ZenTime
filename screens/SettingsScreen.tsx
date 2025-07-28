import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ZenToggle } from '../components/ZenToggle';
import { MaterialButton, SecondaryButton, TonalButton } from '../components/MaterialButton';
import { CardSurface, ElevatedSurface } from '../components/ElevatedSurface';
import { CustomThemeManager } from '../components/CustomThemeManager';
import { useZenModeContext } from '../contexts/ZenModeContext';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import { ELEVATION_LEVELS } from '../utils/elevationUtils';

export const SettingsScreen = () => {
  const { zenMode, setZenMode } = useZenModeContext();
  const {
    currentTheme,
    themeMode,
    visualMode,
    availableThemes,
    customThemes,
    setTheme,
    setThemeMode,
    setVisualMode,
    getCurrentColors
  } = useEnhancedTheme();

  const colors = getCurrentColors();
  const [showCustomThemeManager, setShowCustomThemeManager] = useState(false);

  // Create dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 24,
    },
    sectionCard: {
      marginBottom: 16,
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: colors.onSurface,
      marginBottom: 16,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    settingLabel: {
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      color: colors.onSurface,
      flex: 1,
    },
    settingDescription: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.onSurfaceVariant,
      marginTop: 4,
      marginBottom: 8,
    },
    themeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    themeButton: {
      minWidth: 100,
      marginBottom: 8,
    },
    currentThemeIndicator: {
      backgroundColor: colors.primaryContainer,
      borderColor: colors.primary,
      borderWidth: 2,
    },
    visualModeGrid: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    visualModeButton: {
      flex: 1,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <ScrollView
        style={dynamicStyles.container}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Selection Section */}
        <CardSurface style={dynamicStyles.sectionCard}>
          <Text style={dynamicStyles.sectionTitle}>Theme</Text>

          {/* Theme Mode Selection */}
          <View style={dynamicStyles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={dynamicStyles.settingLabel}>Theme Mode</Text>
              <Text style={dynamicStyles.settingDescription}>
                Choose between light, dark, or system theme
              </Text>
            </View>
          </View>

          <View style={dynamicStyles.visualModeGrid}>
            <MaterialButton
              title="Light"
              onPress={() => setThemeMode('light')}
              style={
                themeMode === 'light'
                  ? StyleSheet.flatten([dynamicStyles.visualModeButton, dynamicStyles.currentThemeIndicator])
                  : dynamicStyles.visualModeButton
              }
              variant={themeMode === 'light' ? 'filled' : 'tonal'}
            />
            <MaterialButton
              title="Dark"
              onPress={() => setThemeMode('dark')}
              style={
                themeMode === 'dark'
                  ? StyleSheet.flatten([dynamicStyles.visualModeButton, dynamicStyles.currentThemeIndicator])
                  : dynamicStyles.visualModeButton
              }
              variant={themeMode === 'dark' ? 'filled' : 'tonal'}
            />
            <MaterialButton
              title="System"
              onPress={() => setThemeMode('system')}
              style={
                themeMode === 'system'
                  ? StyleSheet.flatten([dynamicStyles.visualModeButton, dynamicStyles.currentThemeIndicator])
                  : dynamicStyles.visualModeButton
              }
              variant={themeMode === 'system' ? 'filled' : 'tonal'}
            />
          </View>

          {/* Theme Collection Selection */}
          <View style={{ marginTop: 20 }}>
            <Text style={dynamicStyles.settingLabel}>Theme Collection</Text>
            <Text style={dynamicStyles.settingDescription}>
              Choose from curated color palettes
            </Text>

            <View style={dynamicStyles.themeGrid}>
              {availableThemes.map((theme) => (
                <TonalButton
                  key={theme.id}
                  title={theme.name}
                  onPress={() => setTheme(theme.id)}
                  style={
                    currentTheme.id === theme.id
                      ? StyleSheet.flatten([dynamicStyles.themeButton, dynamicStyles.currentThemeIndicator])
                      : dynamicStyles.themeButton
                  }
                  size="small"
                />
              ))}
            </View>
          </View>

          {/* Custom Themes Section */}
          <View style={{ marginTop: 20 }}>
            <View style={dynamicStyles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={dynamicStyles.settingLabel}>Custom Themes</Text>
                <Text style={dynamicStyles.settingDescription}>
                  Create and manage your personalized themes ({customThemes.length} created)
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 8 }}>
              <MaterialButton
                title="Manage Custom Themes"
                onPress={() => setShowCustomThemeManager(true)}
                variant="tonal"
                style={{ marginBottom: 8 }}
              />
              
              {/* Show custom themes if any exist */}
              {customThemes.length > 0 && (
                <View style={dynamicStyles.themeGrid}>
                  {customThemes.map((theme) => (
                    <TonalButton
                      key={theme.id}
                      title={theme.name}
                      onPress={() => setTheme(theme.id)}
                      style={
                        currentTheme.id === theme.id
                          ? StyleSheet.flatten([dynamicStyles.themeButton, dynamicStyles.currentThemeIndicator])
                          : dynamicStyles.themeButton
                      }
                      size="small"
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </CardSurface>

        {/* Visual Mode Section */}
        <CardSurface style={dynamicStyles.sectionCard}>
          <Text style={dynamicStyles.sectionTitle}>Visual Experience</Text>

          <View style={dynamicStyles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={dynamicStyles.settingLabel}>Visual Mode</Text>
              <Text style={dynamicStyles.settingDescription}>
                Choose your preferred visual style
              </Text>
            </View>
          </View>

          <View style={dynamicStyles.visualModeGrid}>
            <MaterialButton
              title="Minimal"
              onPress={() => setVisualMode('minimal')}
              style={
                visualMode === 'minimal'
                  ? StyleSheet.flatten([dynamicStyles.visualModeButton, dynamicStyles.currentThemeIndicator])
                  : dynamicStyles.visualModeButton
              }
              variant={visualMode === 'minimal' ? 'filled' : 'tonal'}
              size="small"
            />
            <MaterialButton
              title="Artistic"
              onPress={() => setVisualMode('artistic')}
              style={
                visualMode === 'artistic'
                  ? StyleSheet.flatten([dynamicStyles.visualModeButton, dynamicStyles.currentThemeIndicator])
                  : dynamicStyles.visualModeButton
              }
              variant={visualMode === 'artistic' ? 'filled' : 'tonal'}
              size="small"
            />
            <MaterialButton
              title="Ambient"
              onPress={() => setVisualMode('ambient')}
              style={
                visualMode === 'ambient'
                  ? StyleSheet.flatten([dynamicStyles.visualModeButton, dynamicStyles.currentThemeIndicator])
                  : dynamicStyles.visualModeButton
              }
              variant={visualMode === 'ambient' ? 'filled' : 'tonal'}
              size="small"
            />
          </View>
        </CardSurface>

        {/* Zen Mode Section */}
        <CardSurface style={dynamicStyles.sectionCard}>
          <Text style={dynamicStyles.sectionTitle}>Zen Mode</Text>

          <View style={dynamicStyles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={dynamicStyles.settingLabel}>Enable Zen Mode</Text>
              <Text style={dynamicStyles.settingDescription}>
                Hide distractions for focused time viewing
              </Text>
            </View>
            <ZenToggle value={zenMode} onValueChange={setZenMode} />
          </View>
        </CardSurface>

        {/* Action Buttons Section */}
        <ElevatedSurface
          level={ELEVATION_LEVELS.CARD}
          style={dynamicStyles.sectionCard}
        >
          <Text style={dynamicStyles.sectionTitle}>Actions</Text>

          <MaterialButton
            title="Reset to Defaults"
            onPress={() => {
              setTheme('dawn-mist');
              setThemeMode('system');
              setVisualMode('minimal');
              setZenMode(false);
            }}
            variant="outlined"
            style={{ marginBottom: 12 }}
          />

          <SecondaryButton
            title="Export Settings"
            onPress={() => {
              // TODO: Implement settings export
              console.log('Export settings');
            }}
          />
        </ElevatedSurface>
      </ScrollView>

      {/* Custom Theme Manager Modal */}
      <CustomThemeManager
        visible={showCustomThemeManager}
        onClose={() => setShowCustomThemeManager(false)}
      />
    </View>
  );
};
