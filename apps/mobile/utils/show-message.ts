import { Alert, Platform } from 'react-native';

/** Works on native and web (Alert.alert is unreliable in Expo web). */
export function showUserMessage(title: string, message: string): void {
  if (Platform.OS === 'web') {
    globalThis.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

/** Confirmation dialog — Alert.alert with buttons often fails on Expo web. */
export function confirmUserAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = 'Bestätigen'
): void {
  if (Platform.OS === 'web') {
    if (globalThis.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: 'Abbrechen', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
