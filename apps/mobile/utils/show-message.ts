import { Alert, Platform } from 'react-native';

/** Works on native and web (Alert.alert is unreliable in Expo web). */
export function showUserMessage(title: string, message: string): void {
  if (Platform.OS === 'web') {
    globalThis.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
