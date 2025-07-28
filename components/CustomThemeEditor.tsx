import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    Modal,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { MaterialButton, TonalButton, SecondaryButton, TertiaryButton } from './MaterialButton';
import { CardSurface, ElevatedSurface } from './ElevatedSurface';
import { ColorPicker, QuickColorPalette } from './ColorPicker';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import {
    ColorPalette,
    CustomTheme,
    ThemeCollection,
    ThemeMode
} from '../types/theme';
import { ELEVATION_LEVELS } from '../utils/elevationUtils';

// ============================================================================
// Color Role Configuration
// ============================================================================

interface ColorRole {
    key: keyof ColorPalette;
    name: string;
    description: string;
    category: 'surface' | 'content' | 'primary' | 'secondary' | 'tertiary' | 'system' | 'utility';
    isEssential: boolean;
    contrastWith?: (keyof ColorPalette)[];
}

const COLOR_ROLES: ColorRole[] = [
    // Surface Colors
    {
        key: 'background',
        name: 'Background',
        description: 'Main app background',
        category: 'surface',
        isEssential: true,
        contrastWith: ['onBackground'],
    },
    {
        key: 'surface',
        name: 'Surface',
        description: 'Card and component surfaces',
        category: 'surface',
        isEssential: true,
        contrastWith: ['onSurface'],
    },
    {
        key: 'surfaceVariant',
        name: 'Surface Variant',
        description: 'Alternative surface color',
        category: 'surface',
        isEssential: false,
        contrastWith: ['onSurfaceVariant'],
    },

    // Content Colors
    {
        key: 'onBackground',
        name: 'On Background',
        description: 'Text and icons on background',
        category: 'content',
        isEssential: true,
        contrastWith: ['background'],
    },
    {
        key: 'onSurface',
        name: 'On Surface',
        description: 'Text and icons on surface',
        category: 'content',
        isEssential: true,
        contrastWith: ['surface'],
    },
    {
        key: 'onSurfaceVariant',
        name: 'On Surface Variant',
        description: 'Secondary text and icons',
        category: 'content',
        isEssential: false,
        contrastWith: ['surfaceVariant'],
    },

    // Primary Colors
    {
        key: 'primary',
        name: 'Primary',
        description: 'Main brand color',
        category: 'primary',
        isEssential: true,
        contrastWith: ['onPrimary'],
    },
    {
        key: 'onPrimary',
        name: 'On Primary',
        description: 'Text and icons on primary',
        category: 'primary',
        isEssential: true,
        contrastWith: ['primary'],
    },
    {
        key: 'primaryContainer',
        name: 'Primary Container',
        description: 'Primary container background',
        category: 'primary',
        isEssential: false,
        contrastWith: ['onPrimaryContainer'],
    },

    // Secondary Colors
    {
        key: 'secondary',
        name: 'Secondary',
        description: 'Supporting brand color',
        category: 'secondary',
        isEssential: true,
        contrastWith: ['onSecondary'],
    },
    {
        key: 'onSecondary',
        name: 'On Secondary',
        description: 'Text and icons on secondary',
        category: 'secondary',
        isEssential: true,
        contrastWith: ['secondary'],
    },

    // System Colors
    {
        key: 'error',
        name: 'Error',
        description: 'Error state color',
        category: 'system',
        isEssential: true,
        contrastWith: ['onError'],
    },
    {
        key: 'onError',
        name: 'On Error',
        description: 'Text and icons on error',
        category: 'system',
        isEssential: true,
        contrastWith: ['error'],
    },

    // Utility Colors
    {
        key: 'outline',
        name: 'Outline',
        description: 'Borders and dividers',
        category: 'utility',
        isEssential: true,
    },
];

// Quick color palettes for common color schemes
const QUICK_PALETTES = {
    blues: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2'],
    greens: ['#E8F5E8', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C'],
    oranges: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FB8C00', '#F57C00'],
    purples: ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC', '#9C27B0', '#8E24AA', '#7B1FA2'],
    grays: ['#FAFAFA', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161'],
};

// ============================================================================
// Custom Theme Editor Component
// ============================================================================

interface CustomThemeEditorProps {
    visible: boolean;
    onClose: () => void;
    baseTheme?: ThemeCollection;
    existingTheme?: CustomTheme;
    onSave: (theme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const CustomThemeEditor: React.FC<CustomThemeEditorProps> = ({
    visible,
    onClose,
    baseTheme,
    existingTheme,
    onSave,
}) => {
    const {
        getCurrentColors,
        availableThemes,
        themeMode,
        setThemeMode
    } = useEnhancedTheme();
    const colors = getCurrentColors();

    // Editor state
    const [themeName, setThemeName] = useState(existingTheme?.name || '');
    const [themeDescription, setThemeDescription] = useState(existingTheme?.description || '');
    const [selectedBaseTheme, setSelectedBaseTheme] = useState<ThemeCollection>(
        baseTheme || availableThemes[0]
    );
    const [previewMode, setPreviewMode] = useState<ThemeMode>('light');
    const [editingColorRole, setEditingColorRole] = useState<ColorRole | null>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Custom colors state
    const [customLightColors, setCustomLightColors] = useState<Partial<ColorPalette>>(
        existingTheme?.customColors.light || {}
    );
    const [customDarkColors, setCustomDarkColors] = useState<Partial<ColorPalette>>(
        existingTheme?.customColors.dark || {}
    );

    // Get current preview colors
    const previewColors = useMemo(() => {
        const baseColors = previewMode === 'light'
            ? selectedBaseTheme.light
            : selectedBaseTheme.dark;
        const customColors = previewMode === 'light'
            ? customLightColors
            : customDarkColors;

        return { ...baseColors, ...customColors };
    }, [selectedBaseTheme, previewMode, customLightColors, customDarkColors]);

    // Validation
    const isValid = useMemo(() => {
        return themeName.trim().length > 0 && themeName.trim().length <= 50;
    }, [themeName]);

    // Handle color role editing
    const handleEditColorRole = useCallback((role: ColorRole) => {
        setEditingColorRole(role);
        setShowColorPicker(true);
    }, []);

    // Handle color selection
    const handleColorSelect = useCallback((color: string) => {
        if (!editingColorRole) return;

        if (previewMode === 'light') {
            setCustomLightColors(prev => ({
                ...prev,
                [editingColorRole.key]: color,
            }));
        } else {
            setCustomDarkColors(prev => ({
                ...prev,
                [editingColorRole.key]: color,
            }));
        }

        setShowColorPicker(false);
        setEditingColorRole(null);
    }, [editingColorRole, previewMode]);

    // Handle save
    const handleSave = useCallback(() => {
        if (!isValid) {
            Alert.alert('Invalid Theme', 'Please provide a valid theme name.');
            return;
        }

        const customTheme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'> = {
            name: themeName.trim(),
            description: themeDescription.trim() || `Custom theme based on ${selectedBaseTheme.name}`,
            baseTheme: selectedBaseTheme.id,
            light: selectedBaseTheme.light,
            dark: selectedBaseTheme.dark,
            materialConfig: selectedBaseTheme.materialConfig,
            animations: selectedBaseTheme.animations,
            isCustom: true,
            customColors: {
                light: customLightColors,
                dark: customDarkColors,
            },
        };

        onSave(customTheme);
        onClose();
    }, [
        isValid,
        themeName,
        themeDescription,
        selectedBaseTheme,
        customLightColors,
        customDarkColors,
        onSave,
        onClose,
    ]);

    // Reset to base theme
    const handleReset = useCallback(() => {
        Alert.alert(
            'Reset Theme',
            'This will remove all custom colors and reset to the base theme. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        setCustomLightColors({});
                        setCustomDarkColors({});
                    },
                },
            ]
        );
    }, []);

    // Get contrast backgrounds for color picker
    const getContrastBackgrounds = useCallback((role: ColorRole): string[] => {
        if (!role.contrastWith) return [previewColors.background, previewColors.surface];

        return role.contrastWith.map(key => previewColors[key]).filter(Boolean);
    }, [previewColors]);

    const screenHeight = Dimensions.get('window').height;

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
        inputContainer: {
            marginBottom: 16,
        },
        inputLabel: {
            fontSize: 14,
            fontFamily: 'Inter_500Medium',
            color: colors.onSurface,
            marginBottom: 8,
        },
        textInput: {
            borderWidth: 1,
            borderColor: colors.outline,
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            fontFamily: 'Inter_400Regular',
            color: colors.onSurface,
            backgroundColor: colors.surface,
        },
        baseThemeGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        baseThemeButton: {
            minWidth: 100,
        },
        selectedBaseTheme: {
            backgroundColor: colors.primaryContainer,
            borderColor: colors.primary,
            borderWidth: 2,
        },
        previewModeContainer: {
            flexDirection: 'row',
            gap: 8,
            marginBottom: 16,
        },
        previewModeButton: {
            flex: 1,
        },
        colorRolesList: {
            gap: 8,
        },
        colorRoleItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: colors.surfaceVariant,
            borderRadius: 8,
        },
        colorSwatch: {
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.outline,
            marginRight: 12,
        },
        colorRoleInfo: {
            flex: 1,
        },
        colorRoleName: {
            fontSize: 16,
            fontFamily: 'Inter_500Medium',
            color: colors.onSurface,
        },
        colorRoleDescription: {
            fontSize: 12,
            fontFamily: 'Inter_400Regular',
            color: colors.onSurfaceVariant,
            marginTop: 2,
        },
        customIndicator: {
            fontSize: 10,
            fontFamily: 'Inter_600SemiBold',
            color: colors.primary,
            backgroundColor: colors.primaryContainer,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            marginLeft: 8,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: colors.outline,
            gap: 12,
        },
        footerButton: {
            flex: 1,
        },
        colorPickerModal: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            padding: 16,
        },
        colorPickerContainer: {
            maxHeight: screenHeight * 0.8,
        },
    });

    // Group color roles by category
    const colorRolesByCategory = useMemo(() => {
        const categories: Record<string, ColorRole[]> = {};
        COLOR_ROLES.forEach(role => {
            if (!categories[role.category]) {
                categories[role.category] = [];
            }
            categories[role.category].push(role);
        });
        return categories;
    }, []);

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
                        <Text style={dynamicStyles.headerTitle}>
                            {existingTheme ? 'Edit Theme' : 'Create Custom Theme'}
                        </Text>
                        <TertiaryButton
                            title="Cancel"
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
                        {/* Theme Info Section */}
                        <View style={dynamicStyles.section}>
                            <Text style={dynamicStyles.sectionTitle}>Theme Information</Text>

                            <View style={dynamicStyles.inputContainer}>
                                <Text style={dynamicStyles.inputLabel}>Theme Name *</Text>
                                <TextInput
                                    style={dynamicStyles.textInput}
                                    value={themeName}
                                    onChangeText={setThemeName}
                                    placeholder="Enter theme name"
                                    placeholderTextColor={colors.onSurfaceVariant}
                                    maxLength={50}
                                />
                            </View>

                            <View style={dynamicStyles.inputContainer}>
                                <Text style={dynamicStyles.inputLabel}>Description</Text>
                                <TextInput
                                    style={[dynamicStyles.textInput, { height: 80 }]}
                                    value={themeDescription}
                                    onChangeText={setThemeDescription}
                                    placeholder="Describe your theme"
                                    placeholderTextColor={colors.onSurfaceVariant}
                                    multiline
                                    textAlignVertical="top"
                                    maxLength={200}
                                />
                            </View>
                        </View>

                        {/* Base Theme Selection */}
                        <View style={dynamicStyles.section}>
                            <Text style={dynamicStyles.sectionTitle}>Base Theme</Text>
                            <View style={dynamicStyles.baseThemeGrid}>
                                {availableThemes.map((theme) => (
                                    <MaterialButton
                                        key={theme.id}
                                        title={theme.name}
                                        onPress={() => setSelectedBaseTheme(theme)}
                                        style={
                                            selectedBaseTheme.id === theme.id
                                                ? StyleSheet.flatten([dynamicStyles.baseThemeButton, dynamicStyles.selectedBaseTheme])
                                                : dynamicStyles.baseThemeButton
                                        }
                                        variant={selectedBaseTheme.id === theme.id ? 'filled' : 'tonal'}
                                        size="small"
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Preview Mode */}
                        <View style={dynamicStyles.section}>
                            <Text style={dynamicStyles.sectionTitle}>Preview Mode</Text>
                            <View style={dynamicStyles.previewModeContainer}>
                                <MaterialButton
                                    title="Light"
                                    onPress={() => setPreviewMode('light')}
                                    style={dynamicStyles.previewModeButton}
                                    variant={previewMode === 'light' ? 'filled' : 'tonal'}
                                    size="small"
                                />
                                <MaterialButton
                                    title="Dark"
                                    onPress={() => setPreviewMode('dark')}
                                    style={dynamicStyles.previewModeButton}
                                    variant={previewMode === 'dark' ? 'filled' : 'tonal'}
                                    size="small"
                                />
                            </View>
                        </View>

                        {/* Color Customization */}
                        <View style={dynamicStyles.section}>
                            <Text style={dynamicStyles.sectionTitle}>Color Customization</Text>

                            {Object.entries(colorRolesByCategory).map(([category, roles]) => (
                                <View key={category} style={{ marginBottom: 16 }}>
                                    <Text style={[dynamicStyles.inputLabel, { marginBottom: 8 }]}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)} Colors
                                    </Text>
                                    <View style={dynamicStyles.colorRolesList}>
                                        {roles.map((role) => {
                                            const currentColor = previewColors[role.key];
                                            const isCustomized = previewMode === 'light'
                                                ? customLightColors[role.key] !== undefined
                                                : customDarkColors[role.key] !== undefined;

                                            return (
                                                <TouchableOpacity
                                                    key={role.key}
                                                    onPress={() => handleEditColorRole(role)}
                                                    style={dynamicStyles.colorRoleItem}
                                                >
                                                    <View
                                                        style={[
                                                            dynamicStyles.colorSwatch,
                                                            { backgroundColor: currentColor },
                                                        ]}
                                                    />
                                                    <View style={dynamicStyles.colorRoleInfo}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                            <Text style={dynamicStyles.colorRoleName}>
                                                                {role.name}
                                                            </Text>
                                                            {isCustomized && (
                                                                <Text style={dynamicStyles.customIndicator}>
                                                                    CUSTOM
                                                                </Text>
                                                            )}
                                                        </View>
                                                        <Text style={dynamicStyles.colorRoleDescription}>
                                                            {role.description}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={dynamicStyles.footer}>
                        <SecondaryButton
                            title="Reset"
                            onPress={handleReset}
                            style={dynamicStyles.footerButton}
                        />
                        <MaterialButton
                            title={existingTheme ? 'Update Theme' : 'Create Theme'}
                            onPress={handleSave}
                            variant="filled"
                            style={dynamicStyles.footerButton}
                            disabled={!isValid}
                        />
                    </View>
                </ElevatedSurface>

                {/* Color Picker Modal */}
                <Modal
                    visible={showColorPicker}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowColorPicker(false)}
                >
                    <View style={dynamicStyles.colorPickerModal}>
                        <ScrollView
                            style={dynamicStyles.colorPickerContainer}
                            showsVerticalScrollIndicator={false}
                        >
                            {editingColorRole && (
                                <>
                                    <ColorPicker
                                        title={`Edit ${editingColorRole.name}`}
                                        initialColor={previewColors[editingColorRole.key]}
                                        onColorChange={() => { }} // Real-time preview disabled for performance
                                        onColorSelect={handleColorSelect}
                                        backgroundColors={getContrastBackgrounds(editingColorRole)}
                                        showAccessibilityInfo={true}
                                    />

                                    <QuickColorPalette
                                        title="Quick Colors"
                                        colors={Object.values(QUICK_PALETTES).flat()}
                                        onColorSelect={handleColorSelect}
                                        selectedColor={previewColors[editingColorRole.key]}
                                    />
                                </>
                            )}
                        </ScrollView>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
};