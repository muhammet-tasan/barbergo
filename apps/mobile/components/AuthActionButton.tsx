import { ActivityIndicator, Alert, Platform, Pressable, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { getProfilePath } from '@/services/auth-roles';

type AuthActionButtonProps = {
  compact?: boolean;
};

const webPressableStyle =
  Platform.OS === 'web' ? ({ userSelect: 'none' } as Record<string, string>) : undefined;

/** Header auth: guest login/register or profile icon + logout for signed-in users. */
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
    ? 'rounded-xl border border-brand-border/70 bg-transparent px-2.5 min-h-[36px] justify-center items-center'
    : 'rounded-xl border border-brand-border/70 bg-transparent px-4 min-h-[38px] justify-center items-center';

  const textClass = compact
    ? 'text-brand-muted text-xs font-medium'
    : 'text-brand-muted text-sm font-medium';

  if (!session) {
    return (
      <View className="flex-row items-center gap-1.5">
        <Pressable
          onPress={() => router.push('/register')}
          className={`${pillClass} active:opacity-70`}
          style={webPressableStyle}
          accessibilityRole="button"
          accessibilityLabel="Registrieren"
        >
          <Text className={textClass} selectable={false} suppressHighlighting>
            Registrieren
          </Text>
        </Pressable>
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
      </View>
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

  const profilePath = getProfilePath();

  return (
    <View className="flex-row items-center justify-end gap-0.5" style={{ zIndex: 2 }}>
      <Link href={profilePath} asChild>
        <Pressable
          className="min-h-[40px] min-w-[40px] items-center justify-center active:opacity-70"
          style={webPressableStyle}
          accessibilityRole="button"
          accessibilityLabel="Mein Profil"
        >
          <Ionicons name="person-circle-outline" size={compact ? 26 : 28} color={colors.accent} />
        </Pressable>
      </Link>
      <Pressable
        onPress={handleSignOut}
        disabled={busy}
        className={`min-h-[36px] px-2 items-center justify-center active:opacity-70 ${busy ? 'opacity-60' : ''}`}
        style={webPressableStyle}
        accessibilityRole="button"
        accessibilityLabel="Abmelden"
      >
        <Text className="text-brand-muted text-[11px] font-medium" selectable={false} suppressHighlighting>
          {busy ? '…' : 'Abmelden'}
        </Text>
      </Pressable>
    </View>
  );
}
