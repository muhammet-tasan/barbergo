import { ActivityIndicator, Alert, Platform, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

type AuthActionButtonProps = {
  compact?: boolean;
};

const webPressableStyle =
  Platform.OS === 'web' ? ({ userSelect: 'none' } as Record<string, string>) : undefined;

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
    ? 'rounded-xl border border-brand-border/70 bg-transparent px-3 min-h-[36px] justify-center items-center'
    : 'rounded-xl border border-brand-border/70 bg-transparent px-4 min-h-[38px] justify-center items-center';

  const textClass = compact
    ? 'text-brand-muted text-xs font-medium'
    : 'text-brand-muted text-sm font-medium';

  if (!session) {
    return (
      <Pressable
        onPress={() => router.push('/login')}
        className={`${pillClass} active:opacity-70`}
        style={webPressableStyle}
        accessibilityRole="button"
        accessibilityLabel="Anmelden"
      >
        <Text className={textClass} selectable={false} suppressHighlighting>
          Anmelden
        </Text>
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
      className={`${pillClass} ${busy ? 'opacity-60' : 'active:opacity-70'}`}
      style={webPressableStyle}
      accessibilityRole="button"
      accessibilityLabel="Abmelden"
    >
      <Text className={textClass} selectable={false} suppressHighlighting>
        {busy ? '…' : 'Abmelden'}
      </Text>
    </Pressable>
  );
}
