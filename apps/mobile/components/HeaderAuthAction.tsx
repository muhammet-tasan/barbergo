import { ActivityIndicator, Alert, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export function HeaderAuthAction() {
  const router = useRouter();
  const { session, loading, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  if (loading) {
    return <ActivityIndicator size="small" color={colors.accent} />;
  }

  if (!session) {
    return (
      <Pressable
        onPress={() => router.push('/login')}
        className="px-2 py-1 active:opacity-70"
        accessibilityLabel="Anmelden"
      >
        <Text className="text-brand-gold text-sm font-semibold">Anmelden</Text>
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
      className="px-2 py-1 active:opacity-70"
      accessibilityLabel="Abmelden"
    >
      <Text className="text-brand-gold text-sm font-semibold">{busy ? '…' : 'Abmelden'}</Text>
    </Pressable>
  );
}
