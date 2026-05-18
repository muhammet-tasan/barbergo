import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export async function openAddressInMaps(address: string): Promise<boolean> {
  const query = encodeURIComponent(address.trim());
  const url =
    Platform.OS === 'ios'
      ? `https://maps.apple.com/?q=${query}`
      : `https://www.google.com/maps/search/?api=1&query=${query}`;

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    return false;
  }
  await Linking.openURL(url);
  return true;
}
