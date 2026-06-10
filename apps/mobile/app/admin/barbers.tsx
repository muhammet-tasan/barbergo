import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { listBarberProfiles, type UserProfile } from '@/services/profiles';

const STATUS_LABELS = {
  pending: 'Ausstehend',
  approved: 'Freigegeben',
  rejected: 'Abgelehnt',
} as const;

export default function AdminBarbersScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [barbers, setBarbers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const reload = useCallback(async () => {
    setLoading(true);
    const result = await listBarberProfiles();
    setBarbers(result.profiles);
    setError(result.error);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  if (!isAdmin) return <Redirect href="/" />;

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Alle Barber" onBack={() => router.back()} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
          {error ? <Text className="text-warning mb-3">{error}</Text> : null}
          {barbers.length === 0 ? (
            <AppCard>
              <Text className="text-brand-muted text-center">Keine Barber-Profile.</Text>
            </AppCard>
          ) : (
            barbers.map((barber) => (
              <Pressable
                key={barber.id}
                onPress={() =>
                  router.push({
                    pathname: '/admin/barbers/[barberId]/slots',
                    params: {
                      barberId: barber.id,
                      barberName: barber.displayName ?? 'Barber',
                    },
                  } as Href)
                }
                className="mb-3 active:opacity-80"
              >
                <AppCard>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-2">
                      <Text className="text-brand-text font-semibold">
                        {barber.displayName ?? 'Unbenannt'}
                      </Text>
                      <Text className="text-brand-muted text-sm mt-1">
                        {STATUS_LABELS[barber.approvalStatus]}
                      </Text>
                      {barber.phone ? (
                        <Text className="text-brand-muted text-sm mt-1">{barber.phone}</Text>
                      ) : null}
                      {!barber.providerId ? (
                        <Text className="text-warning text-xs mt-2">
                          Kein Provider zugewiesen — Buchungen nach Freigabe prüfen.
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </View>
                </AppCard>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
