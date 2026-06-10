import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';
import { stackScreenOptions } from '@/constants/navigation';
import { colors } from '@/constants/theme';

export default function BarberDashboardLayout() {
  const { session, loading, isBarber, isBarberPending } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-brand-dark items-center justify-center">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (isBarberPending) {
    return <Redirect href="/" />;
  }

  if (!isBarber) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={stackScreenOptions} />;
}
