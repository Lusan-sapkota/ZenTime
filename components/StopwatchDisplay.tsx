import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

interface StopwatchDisplayProps {
  time: string;
}

export const StopwatchDisplay: React.FC<StopwatchDisplayProps> = ({ time }) => (
  <View style={styles.container}>
    <Text style={styles.time}>{time}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  time: {
    fontSize: 64,
    fontFamily: 'Inter_700Bold',
    color: '#A3C4F3',
  },
});
