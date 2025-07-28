import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { MaterialButton, TonalButton, SecondaryButton, TertiaryButton } from './MaterialButton';
import { CardSurface, ElevatedSurface } from './ElevatedSurface';
import { CustomThemeEditor } from './CustomThemeEditor';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import { CustomTheme, ThemeCollection } from '../types/theme';
import { ELEVATION_LEVELS } from '../utils/elevationUtils';

// ============================================================================
// Custom Theme Manager Component
// ============================================================================

interface CustomThemeManagerProps {
  visible: boolean;
  onClose: () => void;
}

export const CustomThemeManager: React.FC<CustomThemeManagerProps> = ({
  visible,
  onClose,
}) => {
  const {
    getCurrentColors,
    availableThemes,
    customThemes,
    currentTheme,
    createCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    setTheme,
  } = useEnhancedTheme();
  
  const colors = getCurrentColors();

  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);
  const [selectedBaseTheme, setSelectedBaseTheme] = useState<ThemeCollection | null>(null);

  // Handle create new theme
  const handleCreateTheme = useCallback((baseTheme?: ThemeCollection) => {
    setSelectedBaseTheme(baseTheme || availableThemes[0]);
    setEditingTheme(null);
    setShowEditor(true);
  }, [availableThemes]);

  // Handle edit existing theme
  const handleEditTheme = useCallback((theme: CustomTheme) => {
    setEditingTheme(theme);
    setSelectedBaseTheme(null);
    setShowEditor(true);
  }, []);

  // Handle duplicate theme
  const handleDuplicateTheme = useCallback((theme: CustomTheme) => {
    const duplicatedTheme = {
      ...theme,
      name: `${theme.name} Copy`,
      description: `Copy of ${theme.name}`,
    };
    setEditingTheme(duplicatedTheme);
    setSelectedBaseTheme(null);
    setShowEditor(true);
  }, []);

  // Handle delete theme
  const handleDeleteTheme = useCallback((theme: CustomTheme) => {
    Alert.alert(
      'Delete Theme',
      `Are you sure you want to delete "${theme.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCustomTheme(theme.id),
        },
      ]
    );
  }, [deleteCustomTheme]);

  // Handle save theme
  const handleSaveTheme = useCallback((themeData: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTheme) {
      // Update existing theme
      updateCustomTheme(editingTheme.id, themeData);
    } else {
      // Create new theme
      createCustomTheme(themeData);
    }
    setShowEditor(false);
    setEditingTheme(null);
    setSelectedBaseTheme(null);
  }, [editingTheme, createCustomTheme, updateCustomTheme]);

  // Handle apply theme
  const handleApplyTheme = useCallback((theme: CustomTheme) => {
    setTheme(theme.id);
    Alert.alert(
      'Theme Applied',
      `"${theme.name}" has been applied successfully.`,
      [{ text: 'OK' }]
    );
  }, [setTheme]);

  const dynamicStyles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      marginTop: 50,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: 'Inter_600SemiBold',
      color: colors.onSurface,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: colors.onSurface,
      marginBottom: 12,
    },
    emptyState: {
      alignItems: 'center',
      padding: 32,
    },
    emptyStateText: {
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: 16,
    },
    themeCard: {
      marginBottom: 12,
      padding: 16,
    },
    themeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    themeInfo: {
      flex: 1,
      marginRight: 12,
    },
    themeName: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: colors.onSurface,
      marginBottom: 4,
    },
    themeDescription: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    themeMetadata: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: colors.onSurfaceVariant,
    },
    currentThemeIndicator: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      color: colors.primary,
      backgroundColor: colors.primaryContainer,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    colorPreview: {
      flexDirection: 'row',
      marginBottom: 12,
      gap: 4,
    },
    colorSwatch: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    themeActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
    },
    baseThemeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    baseThemeCard: {
      width: '48%',
      padding: 12,
      alignItems: 'center',
    },
    baseThemeName: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      color: colors.onSurface,
      textAlign: 'center',
      marginTop: 8,
    },
    baseThemeDescription: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 4,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.modal}>
        <ElevatedSurface level={ELEVATION_LEVELS.DIALOG} style={dynamicStyles.container}>
          {/* Header */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.headerTitle}>Custom Themes</Text>
            <TertiaryButton
              title="Done"
              onPress={onClose}
              size="small"
            />
          </View>

          {/* Content */}
          <ScrollView 
            style={dynamicStyles.content}
            contentContainerStyle={dynamicStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Create New Theme Section */}
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>Create New Theme</Text>
              
              <View style={dynamicStyles.baseThemeGrid}>
                {availableThemes.map((theme) => (
                  <TouchableOpacity
                    key={theme.id}
                    onPress={() => handleCreateTheme(theme)}
                    style={dynamicStyles.baseThemeCard}
                  >
                    <View style={dynamicStyles.colorPreview}>
                      <View
                        style={[
                          dynamicStyles.colorSwatch,
                          { backgroundColor: theme.light.primary },
                        ]}
                      />
                      <View
                        style={[
                          dynamicStyles.colorSwatch,
                          { backgroundColor: theme.light.secondary },
                        ]}
                      />
                      <View
                        style={[
                          dynamicStyles.colorSwatch,
                          { backgroundColor: theme.light.background },
                        ]}
                      />
                    </View>
                    <Text style={dynamicStyles.baseThemeName}>{theme.name}</Text>
                    <Text style={dynamicStyles.baseThemeDescription}>
                      {theme.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Themes Section */}
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>
                Your Custom Themes ({customThemes.length})
              </Text>

              {customThemes.length === 0 ? (
                <CardSurface style={dynamicStyles.emptyState}>
                  <Text style={dynamicStyles.emptyStateText}>
                    You haven't created any custom themes yet.{'\n'}
                    Choose a base theme above to get started!
                  </Text>
                  <MaterialButton
                    title="Create First Theme"
                    onPress={() => handleCreateTheme()}
                    variant="filled"
                  />
                </CardSurface>
              ) : (
                customThemes.map((theme) => {
                  const isCurrentTheme = currentTheme.id === theme.id;
                  
                  return (
                    <CardSurface key={theme.id} style={dynamicStyles.themeCard}>
                      <View style={dynamicStyles.themeHeader}>
                        <View style={dynamicStyles.themeInfo}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={dynamicStyles.themeName}>{theme.name}</Text>
                            {isCurrentTheme && (
                              <Text style={dynamicStyles.currentThemeIndicator}>
                                CURRENT
                              </Text>
                            )}
                          </View>
                          <Text style={dynamicStyles.themeDescription}>
                            {theme.description}
                          </Text>
                          <Text style={dynamicStyles.themeMetadata}>
                            Created {theme.createdAt.toLocaleDateString()}
                            {theme.updatedAt.getTime() !== theme.createdAt.getTime() && 
                              ` • Updated ${theme.updatedAt.toLocaleDateString()}`
                            }
                          </Text>
                        </View>
                      </View>

                      {/* Color Preview */}
                      <View style={dynamicStyles.colorPreview}>
                        <View
                          style={[
                            dynamicStyles.colorSwatch,
                            { backgroundColor: theme.light.primary },
                          ]}
                        />
                        <View
                          style={[
                            dynamicStyles.colorSwatch,
                            { backgroundColor: theme.light.secondary },
                          ]}
                        />
                        <View
                          style={[
                            dynamicStyles.colorSwatch,
                            { backgroundColor: theme.light.background },
                          ]}
                        />
                        <View
                          style={[
                            dynamicStyles.colorSwatch,
                            { backgroundColor: theme.dark.primary },
                          ]}
                        />
                        <View
                          style={[
                            dynamicStyles.colorSwatch,
                            { backgroundColor: theme.dark.secondary },
                          ]}
                        />
                        <View
                          style={[
                            dynamicStyles.colorSwatch,
                            { backgroundColor: theme.dark.background },
                          ]}
                        />
                      </View>

                      {/* Actions */}
                      <View style={dynamicStyles.themeActions}>
                        {!isCurrentTheme && (
                          <MaterialButton
                            title="Apply"
                            onPress={() => handleApplyTheme(theme)}
                            style={dynamicStyles.actionButton}
                            variant="filled"
                            size="small"
                          />
                        )}
                        <TonalButton
                          title="Edit"
                          onPress={() => handleEditTheme(theme)}
                          style={dynamicStyles.actionButton}
                          size="small"
                        />
                        <TonalButton
                          title="Duplicate"
                          onPress={() => handleDuplicateTheme(theme)}
                          style={dynamicStyles.actionButton}
                          size="small"
                        />
                        <SecondaryButton
                          title="Delete"
                          onPress={() => handleDeleteTheme(theme)}
                          style={dynamicStyles.actionButton}
                          size="small"
                        />
                      </View>
                    </CardSurface>
                  );
                })
              )}
            </View>
          </ScrollView>
        </ElevatedSurface>

        {/* Theme Editor Modal */}
        <CustomThemeEditor
          visible={showEditor}
          onClose={() => {
            setShowEditor(false);
            setEditingTheme(null);
            setSelectedBaseTheme(null);
          }}
          baseTheme={selectedBaseTheme || undefined}
          existingTheme={editingTheme || undefined}
          onSave={handleSaveTheme}
        />
      </View>
    </Modal>
  );
};