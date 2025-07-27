import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

interface ClockDisplayProps {
  time: string;
  secondaryTime?: string;
  zenMode?: boolean;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({ time, secondaryTime, zenMode }) => (
  <View style={zenMode ? styles.zenContainer : styles.container}>
    <Text style={styles.time}>{time}</Text>
    {secondaryTime && !zenMode && (
      <Text style={styles.secondary}>{secondaryTime}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  zenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  time: {
    fontSize: 80,
    fontFamily: 'Inter_700Bold',
    color: '#1F2937',
  },
  secondary: {
    fontSize: 28,
    color: '#A3C4F3',
    marginTop: 8,
  },
});
