import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack, usePathname } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';
import { colors } from '@/constants/theme';
import { isSupabaseConfigured } from '@/services/supabase';

export default function AdminLayout() {
  const { session, loading, adminAuthRequired } = useAuth();
  const pathname = usePathname();
  const onLoginScreen = pathname === '/admin/login';

  if (loading) {
    return (
      <View className="flex-1 bg-brand-dark items-center justify-center">
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const mustSignIn =
    adminAuthRequired && isSupabaseConfigured() && !session && !onLoginScreen;

  if (mustSignIn) {
    return <Redirect href="/admin/login" />;
  }

  if (session && onLoginScreen) {
    return <Redirect href="/admin" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
