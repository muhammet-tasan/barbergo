import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

type AuthActionButtonProps = {
  compact?: boolean;
};

/** Compact pill — login/logout in app header (min 40px touch height). */
export function AuthActionButton({ compact = false }: AuthActionButtonProps) {
  const router = useRouter();
  const { session, loading, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <View className="min-h-[36px] min-w-[64px] items-center justify-center">
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  }

  const pillClass = compact
    ? 'rounded-full border border-brand-gold/80 bg-brand-surface px-3 min-h-[36px] justify-center items-center'
    : 'rounded-full border border-brand-gold bg-brand-surface px-4 min-h-[40px] justify-center items-center';

  const textClass = compact
    ? 'text-brand-gold text-xs font-semibold'
    : 'text-brand-gold text-sm font-semibold';

  if (!session) {
    return (
      <Pressable
        onPress={() => router.push('/login')}
        className={`${pillClass} active:opacity-80`}
        accessibilityRole="button"
        accessibilityLabel="Anmelden"
      >
        <Text className={textClass}>Anmelden</Text>
      </Pressable>
    );
  }

  const handleSignOut = async () => {
    setBusy(true);
    try {
      const result = await signOut();
      if (result.error) {
        Alert.alert('Fehler', result.error);
        return;
      }
      router.replace('/');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Pressable
      onPress={handleSignOut}
      disabled={busy}
      className={`${pillClass} ${busy ? 'opacity-60' : 'active:opacity-80'}`}
      accessibilityRole="button"
      accessibilityLabel="Abmelden"
    >
      <Text className={textClass}>{busy ? '…' : 'Abmelden'}</Text>
    </Pressable>
  );
}
