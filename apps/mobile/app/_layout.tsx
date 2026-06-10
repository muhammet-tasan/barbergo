import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/auth-context';
import { stackFadeOptions, stackScreenOptions } from '@/constants/navigation';
import { colors } from '@/constants/theme';
import { usePushNotificationRouting } from '@/hooks/use-push-notifications';
import { useWebAuthCallbackRedirect } from '@/hooks/use-web-auth-callback-redirect';

function RootStack() {
  usePushNotificationRouting();
  useWebAuthCallbackRedirect();

  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={stackFadeOptions} />
      <Stack.Screen name="barber/confirm" options={stackFadeOptions} />
      <Stack.Screen name="auth/callback" options={stackFadeOptions} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
      <StatusBar style="light" backgroundColor={colors.background} />
    </AuthProvider>
  );
}
