import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';
import { colors } from '@/constants/theme';

export default function BarberDashboardLayout() {
  const { session, loading, isBarber } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-brand-dark items-center justify-center">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!session || !isBarber) {
    return <Redirect href="/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
