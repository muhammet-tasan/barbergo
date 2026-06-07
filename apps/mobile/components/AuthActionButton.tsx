import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

type AuthActionButtonProps = {
  compact?: boolean;
};

/** Small header outline button — visually distinct from status badges and main CTAs. */
export function AuthActionButton({ compact = false }: AuthActionButtonProps) {
  const router = useRouter();
  const { session, loading, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <View className="min-h-[36px] min-w-[72px] items-center justify-center">
        <ActivityIndicator size="small" color={colors.textMuted} />
      </View>
    );
  }

  const pillClass = compact
    ? 'rounded-xl border border-brand-border bg-brand-surface/90 px-3 min-h-[36px] justify-center items-center'
    : 'rounded-xl border border-brand-border bg-brand-surface/90 px-4 min-h-[38px] justify-center items-center';

  const textClass = compact
    ? 'text-brand-text text-xs font-semibold'
    : 'text-brand-text text-sm font-semibold';

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
