/**
 * Header Navigator Component with Animated Drawer Menu
 * 
 * This component provides a beautiful animated drawer navigation with
 * Clock, Stopwatch, and Settings options with smooth animations.
 */

import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Appbar, Avatar, Divider, TouchableRipple } from 'react-native-paper';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import { ClockScreen } from '../screens/ClockScreen';
import { StopwatchScreen } from '../screens/StopwatchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Drawer = createDrawerNavigator();
const { width: screenWidth } = Dimensions.get('window');

// Custom drawer content with beautiful animations
const CustomDrawerContent: React.FC<any> = (props) => {
    const { getCurrentColors, getMaterialConfig } = useEnhancedTheme();
    const colors = getCurrentColors();
    const materialConfig = getMaterialConfig();
    
    const slideAnim = React.useRef(new Animated.Value(-50)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const dynamicStyles = StyleSheet.create({
        drawerContainer: {
            flex: 1,
            backgroundColor: colors.surface,
        },
        headerSection: {
            padding: 24,
            paddingTop: 60,
            backgroundColor: colors.primaryContainer,
            borderBottomRightRadius: 24,
        },
        appTitle: {
            fontSize: 28,
            fontFamily: 'Inter_700Bold',
            color: colors.onPrimaryContainer,
            marginBottom: 4,
        },
        appSubtitle: {
            fontSize: 14,
            fontFamily: 'Inter_400Regular',
            color: colors.onPrimaryContainer,
            opacity: 0.8,
        },
        menuSection: {
            flex: 1,
            paddingTop: 16,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingVertical: 16,
            marginHorizontal: 12,
            marginVertical: 4,
            borderRadius: 12,
        },
        menuItemActive: {
            backgroundColor: colors.secondaryContainer,
        },
        menuItemIcon: {
            marginRight: 16,
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
        },
        menuItemText: {
            fontSize: 16,
            fontFamily: 'Inter_500Medium',
            color: colors.onSurface,
            flex: 1,
        },
        menuItemTextActive: {
            color: colors.onSecondaryContainer,
            fontFamily: 'Inter_600SemiBold',
        },
        divider: {
            marginVertical: 8,
            marginHorizontal: 24,
            backgroundColor: colors.outline,
        },
        footerSection: {
            padding: 24,
            borderTopWidth: 1,
            borderTopColor: colors.outline,
        },
        versionText: {
            fontSize: 12,
            fontFamily: 'Inter_400Regular',
            color: colors.onSurfaceVariant,
            textAlign: 'center',
        },
    });

    const menuItems = [
        { 
            name: 'Clock', 
            icon: 'clock-outline', 
            label: 'Clock',
            subtitle: 'World time & zones'
        },
        { 
            name: 'Stopwatch', 
            icon: 'timer-outline', 
            label: 'Stopwatch',
            subtitle: 'Precision timing'
        },
    ];

    const renderMenuItem = (item: any, index: number) => {
        const isActive = props.state.index === index;
        
        return (
            <Animated.View
                key={item.name}
                style={{
                    transform: [{ translateX: slideAnim }],
                    opacity: fadeAnim,
                }}
            >
                <TouchableRipple
                    onPress={() => props.navigation.navigate(item.name)}
                    style={[
                        dynamicStyles.menuItem,
                        isActive && dynamicStyles.menuItemActive,
                    ]}
                    rippleColor={colors.primary + '20'}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={dynamicStyles.menuItemIcon}>
                            <Text style={{ 
                                fontSize: 20,
                                color: isActive ? colors.onSecondaryContainer : colors.onSurface 
                            }}>
                                {item.icon === 'clock-outline' ? '🕐' : '⏱️'}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[
                                dynamicStyles.menuItemText,
                                isActive && dynamicStyles.menuItemTextActive,
                            ]}>
                                {item.label}
                            </Text>
                            <Text style={{
                                fontSize: 12,
                                fontFamily: 'Inter_400Regular',
                                color: isActive ? colors.onSecondaryContainer : colors.onSurfaceVariant,
                                opacity: 0.7,
                                marginTop: 2,
                            }}>
                                {item.subtitle}
                            </Text>
                        </View>
                    </View>
                </TouchableRipple>
            </Animated.View>
        );
    };

    return (
        <View style={dynamicStyles.drawerContainer}>
            {/* Header Section */}
            <Animated.View 
                style={[
                    dynamicStyles.headerSection,
                    {
                        transform: [{ translateX: slideAnim }],
                        opacity: fadeAnim,
                    }
                ]}
            >
                <Text style={dynamicStyles.appTitle}>ZenTime</Text>
                <Text style={dynamicStyles.appSubtitle}>Mindful time management</Text>
            </Animated.View>

            {/* Menu Section */}
            <View style={dynamicStyles.menuSection}>
                {menuItems.map(renderMenuItem)}
                
                <Divider style={dynamicStyles.divider} />
                
                <Animated.View
                    style={{
                        transform: [{ translateX: slideAnim }],
                        opacity: fadeAnim,
                    }}
                >
                    <TouchableRipple
                        onPress={() => props.navigation.navigate('Settings')}
                        style={[
                            dynamicStyles.menuItem,
                            props.state.index === 2 && dynamicStyles.menuItemActive,
                        ]}
                        rippleColor={colors.primary + '20'}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={dynamicStyles.menuItemIcon}>
                                <Text style={{ 
                                    fontSize: 20,
                                    color: props.state.index === 2 ? colors.onSecondaryContainer : colors.onSurface 
                                }}>
                                    ⚙️
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[
                                    dynamicStyles.menuItemText,
                                    props.state.index === 2 && dynamicStyles.menuItemTextActive,
                                ]}>
                                    Settings
                                </Text>
                                <Text style={{
                                    fontSize: 12,
                                    fontFamily: 'Inter_400Regular',
                                    color: props.state.index === 2 ? colors.onSecondaryContainer : colors.onSurfaceVariant,
                                    opacity: 0.7,
                                    marginTop: 2,
                                }}>
                                    Themes & preferences
                                </Text>
                            </View>
                        </View>
                    </TouchableRipple>
                </Animated.View>
            </View>

            {/* Footer Section */}
            <Animated.View 
                style={[
                    dynamicStyles.footerSection,
                    {
                        transform: [{ translateX: slideAnim }],
                        opacity: fadeAnim,
                    }
                ]}
            >
                <Text style={dynamicStyles.versionText}>ZenTime v1.0.0</Text>
            </Animated.View>
        </View>
    );
};

// Custom header component
const CustomHeader: React.FC<{
    navigation: any;
    route: any;
    options: any;
}> = ({ navigation, route, options }) => {
    const { getCurrentColors } = useEnhancedTheme();
    const colors = getCurrentColors();

    const getScreenTitle = () => {
        switch (route.name) {
            case 'Clock':
                return 'ZenTime';
            case 'Stopwatch':
                return 'Stopwatch';
            case 'Settings':
                return 'Settings';
            default:
                return 'ZenTime';
        }
    };

    return (
        <Appbar.Header 
            style={{ 
                backgroundColor: colors.surface,
                elevation: 2,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }}
        >
            <Appbar.Action
                icon="menu"
                onPress={() => navigation.openDrawer()}
                iconColor={colors.onSurface}
            />
            
            <Appbar.Content
                title={getScreenTitle()}
                titleStyle={{
                    color: colors.onSurface,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 20,
                }}
            />
        </Appbar.Header>
    );
};

export const HeaderNavigator: React.FC = () => {
    const { getCurrentColors } = useEnhancedTheme();
    const colors = getCurrentColors();

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={({ navigation, route }) => ({
                header: (props) => <CustomHeader {...props} />,
                drawerStyle: {
                    backgroundColor: colors.surface,
                    width: screenWidth * 0.8,
                },
                drawerType: 'slide',
                overlayColor: colors.shadow + '40',
                sceneContainerStyle: {
                    backgroundColor: colors.background,
                },
            })}
        >
            <Drawer.Screen
                name="Clock"
                component={ClockScreen}
                options={{
                    drawerLabel: 'Clock',
                }}
            />
            <Drawer.Screen
                name="Stopwatch"
                component={StopwatchScreen}
                options={{
                    drawerLabel: 'Stopwatch',
                }}
            />
            <Drawer.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    drawerLabel: 'Settings',
                }}
            />
        </Drawer.Navigator>
    );
};