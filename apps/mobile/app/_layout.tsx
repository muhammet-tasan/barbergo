import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/auth-context';
import { colors } from '@/constants/theme';

const defaultScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right' as const,
  gestureEnabled: true,
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={defaultScreenOptions}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="barber/confirm" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style="light" backgroundColor={colors.background} />
    </AuthProvider>
  );
}
