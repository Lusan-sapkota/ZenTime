import React from 'react';
import { Switch } from 'react-native-paper';

interface ZenToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const ZenToggle: React.FC<ZenToggleProps> = ({ value, onValueChange }) => (
  <Switch value={value} onValueChange={onValueChange} />
);
