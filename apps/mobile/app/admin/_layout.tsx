import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack, usePathname } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';
import { stackScreenOptions } from '@/constants/navigation';
import { colors } from '@/constants/theme';
import { isSupabaseConfigured } from '@/services/supabase';

export default function AdminLayout() {
  const { session, loading, adminAuthRequired, isAdmin } = useAuth();
  const pathname = usePathname();
  const onLoginScreen = pathname === '/admin/login';

  if (loading) {
    return (
      <View className="flex-1 bg-brand-dark items-center justify-center">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (session && !isAdmin && !onLoginScreen) {
    return <Redirect href="/" />;
  }

  const mustSignIn =
    adminAuthRequired && isSupabaseConfigured() && !session && !onLoginScreen;

  if (mustSignIn) {
    return <Redirect href="/login" />;
  }

  if (session && isAdmin && onLoginScreen) {
    return <Redirect href="/admin" />;
  }

  return <Stack screenOptions={stackScreenOptions} />;
}
