import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Svg, Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { MaterialButton, TonalButton } from './MaterialButton';
import { CardSurface } from './ElevatedSurface';
import { useEnhancedTheme } from '../contexts/ThemeContext';

// ============================================================================
// Color Utility Functions
// ============================================================================

/**
 * Convert HSV to RGB
 */
const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
};

/**
 * Convert RGB to HSV
 */
const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : diff / max;
  const v = max;

  return [h, s, v];
};

/**
 * Convert RGB to hex
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

/**
 * Convert hex to RGB
 */
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
};

/**
 * Calculate relative luminance for accessibility
 */
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 */
const getContrastRatio = (color1: string, color2: string): number => {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  
  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

// ============================================================================
// Color Picker Component
// ============================================================================

interface ColorPickerProps {
  initialColor?: string;
  onColorChange: (color: string) => void;
  onColorSelect?: (color: string) => void;
  backgroundColors?: string[]; // For contrast validation
  showAccessibilityInfo?: boolean;
  title?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  initialColor = '#A3C4F3',
  onColorChange,
  onColorSelect,
  backgroundColors = ['#FFFFFF', '#000000'],
  showAccessibilityInfo = true,
  title = 'Color Picker',
}) => {
  const { getCurrentColors } = useEnhancedTheme();
  const colors = getCurrentColors();

  // Parse initial color
  const [r, g, b] = hexToRgb(initialColor);
  const [h, s, v] = rgbToHsv(r, g, b);

  // Color state
  const [hue, setHue] = useState(h);
  const [saturation, setSaturation] = useState(s);
  const [value, setValue] = useState(v);

  // Picker dimensions
  const pickerSize = 200;
  const hueBarHeight = 20;
  const screenWidth = Dimensions.get('window').width;
  const pickerWidth = Math.min(pickerSize, screenWidth - 48);

  // Calculate current color
  const currentColor = useMemo(() => {
    const [r, g, b] = hsvToRgb(hue, saturation, value);
    return rgbToHex(r, g, b);
  }, [hue, saturation, value]);

  // Notify parent of color changes
  React.useEffect(() => {
    onColorChange(currentColor);
  }, [currentColor, onColorChange]);

  // Calculate accessibility information
  const accessibilityInfo = useMemo(() => {
    return backgroundColors.map(bgColor => {
      const ratio = getContrastRatio(currentColor, bgColor);
      return {
        background: bgColor,
        ratio: ratio,
        wcagAA: ratio >= 4.5,
        wcagAAA: ratio >= 7.0,
        level: ratio >= 7.0 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail',
      };
    });
  }, [currentColor, backgroundColors]);

  // Saturation/Value picker pan responder
  const svPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newSaturation = Math.max(0, Math.min(1, locationX / pickerWidth));
      const newValue = Math.max(0, Math.min(1, 1 - (locationY / pickerWidth)));
      setSaturation(newSaturation);
      setValue(newValue);
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newSaturation = Math.max(0, Math.min(1, locationX / pickerWidth));
      const newValue = Math.max(0, Math.min(1, 1 - (locationY / pickerWidth)));
      setSaturation(newSaturation);
      setValue(newValue);
    },
  });

  // Hue picker pan responder
  const huePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX } = evt.nativeEvent;
      const newHue = Math.max(0, Math.min(360, (locationX / pickerWidth) * 360));
      setHue(newHue);
    },
    onPanResponderMove: (evt) => {
      const { locationX } = evt.nativeEvent;
      const newHue = Math.max(0, Math.min(360, (locationX / pickerWidth) * 360));
      setHue(newHue);
    },
  });

  const handleColorSelect = useCallback(() => {
    onColorSelect?.(currentColor);
  }, [currentColor, onColorSelect]);

  const dynamicStyles = StyleSheet.create({
    container: {
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: colors.onSurface,
      marginBottom: 16,
      textAlign: 'center',
    },
    pickerContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    svPicker: {
      width: pickerWidth,
      height: pickerWidth,
      marginBottom: 16,
      borderRadius: 8,
      overflow: 'hidden',
    },
    huePicker: {
      width: pickerWidth,
      height: hueBarHeight,
      borderRadius: hueBarHeight / 2,
      overflow: 'hidden',
      marginBottom: 16,
    },
    colorPreview: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: colors.outline,
      marginBottom: 16,
    },
    colorValue: {
      fontSize: 16,
      fontFamily: 'Inter_500Medium',
      color: colors.onSurface,
      textAlign: 'center',
      marginBottom: 16,
    },
    accessibilitySection: {
      marginTop: 16,
    },
    accessibilityTitle: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: colors.onSurface,
      marginBottom: 12,
    },
    accessibilityItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
      marginBottom: 8,
    },
    accessibilityBackground: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.outline,
      marginRight: 12,
    },
    accessibilityInfo: {
      flex: 1,
    },
    accessibilityRatio: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.onSurfaceVariant,
    },
    accessibilityLevel: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      marginLeft: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    levelAAA: {
      backgroundColor: '#10B981',
      color: '#FFFFFF',
    },
    levelAA: {
      backgroundColor: '#F59E0B',
      color: '#FFFFFF',
    },
    levelFail: {
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
    },
    buttonContainer: {
      marginTop: 16,
    },
  });

  return (
    <CardSurface style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>{title}</Text>

      <View style={dynamicStyles.pickerContainer}>
        {/* Saturation/Value Picker */}
        <View style={dynamicStyles.svPicker} {...svPanResponder.panHandlers}>
          <Svg width={pickerWidth} height={pickerWidth}>
            <Defs>
              <LinearGradient id="saturation" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="100%" stopColor={`hsl(${hue}, 100%, 50%)`} />
              </LinearGradient>
              <LinearGradient id="value" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="rgba(0,0,0,0)" />
                <Stop offset="100%" stopColor="#000000" />
              </LinearGradient>
            </Defs>
            <Rect width={pickerWidth} height={pickerWidth} fill="url(#saturation)" />
            <Rect width={pickerWidth} height={pickerWidth} fill="url(#value)" />
            <Circle
              cx={saturation * pickerWidth}
              cy={(1 - value) * pickerWidth}
              r={8}
              stroke="#FFFFFF"
              strokeWidth={2}
              fill="none"
            />
          </Svg>
        </View>

        {/* Hue Picker */}
        <View style={dynamicStyles.huePicker} {...huePanResponder.panHandlers}>
          <Svg width={pickerWidth} height={hueBarHeight}>
            <Defs>
              <LinearGradient id="hue" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#FF0000" />
                <Stop offset="16.66%" stopColor="#FFFF00" />
                <Stop offset="33.33%" stopColor="#00FF00" />
                <Stop offset="50%" stopColor="#00FFFF" />
                <Stop offset="66.66%" stopColor="#0000FF" />
                <Stop offset="83.33%" stopColor="#FF00FF" />
                <Stop offset="100%" stopColor="#FF0000" />
              </LinearGradient>
            </Defs>
            <Rect width={pickerWidth} height={hueBarHeight} fill="url(#hue)" />
            <Circle
              cx={(hue / 360) * pickerWidth}
              cy={hueBarHeight / 2}
              r={hueBarHeight / 2 - 2}
              stroke="#FFFFFF"
              strokeWidth={2}
              fill="none"
            />
          </Svg>
        </View>

        {/* Color Preview */}
        <View
          style={[
            dynamicStyles.colorPreview,
            { backgroundColor: currentColor },
          ]}
        />

        <Text style={dynamicStyles.colorValue}>{currentColor}</Text>
      </View>

      {/* Accessibility Information */}
      {showAccessibilityInfo && (
        <View style={dynamicStyles.accessibilitySection}>
          <Text style={dynamicStyles.accessibilityTitle}>
            Accessibility Check
          </Text>
          {accessibilityInfo.map((info, index) => (
            <View key={index} style={dynamicStyles.accessibilityItem}>
              <View
                style={[
                  dynamicStyles.accessibilityBackground,
                  { backgroundColor: info.background },
                ]}
              />
              <View style={dynamicStyles.accessibilityInfo}>
                <Text style={dynamicStyles.accessibilityRatio}>
                  Contrast: {info.ratio.toFixed(2)}:1
                </Text>
              </View>
              <Text
                style={[
                  dynamicStyles.accessibilityLevel,
                  info.level === 'AAA'
                    ? dynamicStyles.levelAAA
                    : info.level === 'AA'
                    ? dynamicStyles.levelAA
                    : dynamicStyles.levelFail,
                ]}
              >
                {info.level}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      {onColorSelect && (
        <View style={dynamicStyles.buttonContainer}>
          <MaterialButton
            title="Select Color"
            onPress={handleColorSelect}
            variant="filled"
          />
        </View>
      )}
    </CardSurface>
  );
};

// ============================================================================
// Quick Color Palette Component
// ============================================================================

interface QuickColorPaletteProps {
  colors: string[];
  onColorSelect: (color: string) => void;
  selectedColor?: string;
  title?: string;
}

export const QuickColorPalette: React.FC<QuickColorPaletteProps> = ({
  colors: paletteColors,
  onColorSelect,
  selectedColor,
  title = 'Quick Colors',
}) => {
  const { getCurrentColors } = useEnhancedTheme();
  const colors = getCurrentColors();

  const dynamicStyles = StyleSheet.create({
    container: {
      padding: 16,
    },
    title: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: colors.onSurface,
      marginBottom: 12,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    colorSwatch: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedSwatch: {
      borderColor: colors.primary,
      borderWidth: 3,
    },
  });

  return (
    <CardSurface style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>{title}</Text>
      <View style={dynamicStyles.colorGrid}>
        {paletteColors.map((color, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onColorSelect(color)}
            style={[
              dynamicStyles.colorSwatch,
              { backgroundColor: color },
              selectedColor === color && dynamicStyles.selectedSwatch,
            ]}
          />
        ))}
      </View>
    </CardSurface>
  );
};