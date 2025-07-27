import AsyncStorage from '@react-native-async-storage/async-storage';

export async function savePreference(key: string, value: string) {
  await AsyncStorage.setItem(key, value);
}

export async function loadPreference(key: string) {
  return AsyncStorage.getItem(key);
}
