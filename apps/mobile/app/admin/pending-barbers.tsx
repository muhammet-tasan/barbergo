import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { listPendingBarbers, setBarberApproval, type UserProfile } from '@/services/profiles';

export default function AdminPendingBarbersScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [pending, setPending] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const result = await listPendingBarbers();
    setPending(result.profiles);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  if (!isAdmin) return <Redirect href="/" />;

  const handleApproval = async (profileId: string, approval: 'approved' | 'rejected') => {
    setActingId(profileId);
    await setBarberApproval(profileId, approval);
    await reload();
    setActingId(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Barber-Freigaben" onBack={() => router.back()} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
          {pending.length === 0 ? (
            <AppCard>
              <Text className="text-brand-muted text-center">
                Keine ausstehenden Barber-Anmeldungen.
              </Text>
            </AppCard>
          ) : (
            pending.map((profile) => (
              <AppCard key={profile.id} className="mb-3">
                <Text className="text-brand-text font-semibold text-base">
                  {profile.displayName ?? 'Barber'}
                </Text>
                {profile.phone ? (
                  <Text className="text-brand-muted text-sm mt-1">{profile.phone}</Text>
                ) : null}
                <View className="flex-row gap-2 mt-4">
                  <View className="flex-1">
                    <AppButton
                      label="Genehmigen"
                      onPress={() => handleApproval(profile.id, 'approved')}
                      loading={actingId === profile.id}
                    />
                  </View>
                  <View className="flex-1">
                    <AppButton
                      label="Ablehnen"
                      variant="danger"
                      onPress={() => handleApproval(profile.id, 'rejected')}
                      loading={actingId === profile.id}
                    />
                  </View>
                </View>
              </AppCard>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
