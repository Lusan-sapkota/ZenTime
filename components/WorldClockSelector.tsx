/**
 * World Clock Selector Component
 * 
 * Modal component for selecting and adding world clocks with offline support
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import {
  Modal,
  Portal,
  Surface,
  TouchableRipple,
  Searchbar,
  Chip,
  Button,
  IconButton,
} from 'react-native-paper';
import { useEnhancedTheme } from '../contexts/ThemeContext';
import { useWorldClock, popularTimezones } from '../contexts/WorldClockContext';

const { height: screenHeight } = Dimensions.get('window');

interface WorldClockSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export const WorldClockSelector: React.FC<WorldClockSelectorProps> = ({
  visible,
  onClose,
}) => {
  const { getCurrentColors } = useEnhancedTheme();
  const { addWorldClock, worldClocks, isOffline } = useWorldClock();
  const colors = getCurrentColors();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState<typeof popularTimezones[0] | null>(null);

  // Filter timezones based on search query
  const filteredTimezones = popularTimezones.filter(tz => {
    const query = searchQuery.toLowerCase();
    return (
      tz.city.toLowerCase().includes(query) ||
      tz.country.toLowerCase().includes(query) ||
      tz.timezone.toLowerCase().includes(query)
    );
  });

  // Check if timezone is already added
  const isTimezoneAdded = (timezone: string) => {
    return worldClocks.some(clock => clock.timezone === timezone);
  };

  const handleAddClock = () => {
    if (selectedTimezone && !isTimezoneAdded(selectedTimezone.timezone)) {
      addWorldClock({
        timezone: selectedTimezone.timezone,
        city: selectedTimezone.city,
        country: selectedTimezone.country,
        offset: selectedTimezone.offset,
      });
      setSelectedTimezone(null);
      setSearchQuery('');
      onClose();
    }
  };

  const dynamicStyles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: screenHeight * 0.8,
      minHeight: screenHeight * 0.6,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: 'Inter_600SemiBold',
      color: colors.onSurface,
      flex: 1,
    },
    searchContainer: {
      padding: 16,
      paddingTop: 8,
    },
    searchBar: {
      backgroundColor: colors.surfaceVariant,
    },
    offlineIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.errorContainer,
      padding: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 8,
    },
    offlineText: {
      color: colors.onErrorContainer,
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      marginLeft: 8,
      flex: 1,
    },
    timezoneList: {
      flex: 1,
      paddingHorizontal: 16,
    },
    timezoneItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.surfaceVariant,
    },
    timezoneItemSelected: {
      backgroundColor: colors.primaryContainer,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    timezoneItemDisabled: {
      opacity: 0.5,
      backgroundColor: colors.surfaceVariant,
    },
    timezoneInfo: {
      flex: 1,
    },
    timezoneCity: {
      fontSize: 16,
      fontFamily: 'Inter_500Medium',
      color: colors.onSurface,
    },
    timezoneCitySelected: {
      color: colors.onPrimaryContainer,
    },
    timezoneCountry: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.onSurfaceVariant,
      marginTop: 2,
    },
    timezoneCountrySelected: {
      color: colors.onPrimaryContainer,
      opacity: 0.8,
    },
    timezoneOffset: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: colors.onSurfaceVariant,
      backgroundColor: colors.outline + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginLeft: 12,
    },
    timezoneOffsetSelected: {
      color: colors.onPrimaryContainer,
      backgroundColor: colors.primary + '20',
    },
    addedChip: {
      marginLeft: 12,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 24,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.outline,
    },
    cancelButton: {
      flex: 1,
      marginRight: 8,
    },
    addButton: {
      flex: 1,
      marginLeft: 8,
    },
  });

  const formatOffset = (offset: number) => {
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.abs(offset) % 1 === 0.5 ? '30' : '00';
    return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const renderTimezoneItem = (timezone: typeof popularTimezones[0]) => {
    const isSelected = selectedTimezone?.timezone === timezone.timezone;
    const isAdded = isTimezoneAdded(timezone.timezone);
    const isDisabled = isAdded;

    return (
      <TouchableRipple
        key={timezone.timezone}
        onPress={() => {
          if (!isDisabled) {
            setSelectedTimezone(isSelected ? null : timezone);
          }
        }}
        style={[
          dynamicStyles.timezoneItem,
          isSelected && dynamicStyles.timezoneItemSelected,
          isDisabled && dynamicStyles.timezoneItemDisabled,
        ]}
        rippleColor={colors.primary + '20'}
        disabled={isDisabled}
      >
        <View style={dynamicStyles.timezoneInfo}>
          <Text style={[
            dynamicStyles.timezoneCity,
            isSelected && dynamicStyles.timezoneCitySelected,
          ]}>
            {timezone.city}
          </Text>
          <Text style={[
            dynamicStyles.timezoneCountry,
            isSelected && dynamicStyles.timezoneCountrySelected,
          ]}>
            {timezone.country} • {timezone.timezone}
          </Text>
        </View>
        
        <Text style={[
          dynamicStyles.timezoneOffset,
          isSelected && dynamicStyles.timezoneOffsetSelected,
        ]}>
          {formatOffset(timezone.offset)}
        </Text>

        {isAdded && (
          <Chip
            style={dynamicStyles.addedChip}
            textStyle={{ fontSize: 10 }}
            compact
          >
            Added
          </Chip>
        )}
      </TouchableRipple>
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={dynamicStyles.modalContainer}
      >
        <Surface style={dynamicStyles.modalContent} elevation={5}>
          {/* Header */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.headerTitle}>Add World Clock</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onClose}
              iconColor={colors.onSurface}
            />
          </View>

          {/* Offline Indicator */}
          {isOffline && (
            <View style={dynamicStyles.offlineIndicator}>
              <Text style={{ fontSize: 16 }}>⚠️</Text>
              <Text style={dynamicStyles.offlineText}>
                Offline mode - Using cached timezone data
              </Text>
            </View>
          )}

          {/* Search */}
          <View style={dynamicStyles.searchContainer}>
            <Searchbar
              placeholder="Search cities or countries..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={dynamicStyles.searchBar}
              inputStyle={{ color: colors.onSurface }}
              iconColor={colors.onSurfaceVariant}
            />
          </View>

          {/* Timezone List */}
          <ScrollView 
            style={dynamicStyles.timezoneList}
            showsVerticalScrollIndicator={false}
          >
            {filteredTimezones.map(renderTimezoneItem)}
          </ScrollView>

          {/* Action Buttons */}
          <View style={dynamicStyles.actionButtons}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={dynamicStyles.cancelButton}
              textColor={colors.onSurface}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddClock}
              style={dynamicStyles.addButton}
              disabled={!selectedTimezone || isTimezoneAdded(selectedTimezone?.timezone || '')}
            >
              Add Clock
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
};