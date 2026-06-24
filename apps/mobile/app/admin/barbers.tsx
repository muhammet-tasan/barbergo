import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import {
  listBarberProfiles,
  mapBarberApprovalError,
  setBarberApproval,
  type UserProfile,
} from '@/services/profiles';

function barberNeedsApproval(barber: UserProfile): boolean {
  if (barber.role !== 'barber') return false;
  if (barber.approvalStatus === 'rejected') return false;
  if (barber.approvalStatus === 'pending') return true;
  return !barber.providerId;
}

function barberStatusLabel(barber: UserProfile): string {
  if (barber.approvalStatus === 'rejected') return 'Abgelehnt';
  if (barberNeedsApproval(barber)) return 'Freigabe ausstehend';
  return 'Aktiv';
}

export default function AdminBarbersScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [barbers, setBarbers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [actingId, setActingId] = useState<string | null>(null);

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

  const handleApproval = async (profileId: string, approval: 'approved' | 'rejected') => {
    setActingId(profileId);
    const result = await setBarberApproval(profileId, approval);
    if (result.error) {
      Alert.alert('Freigabe fehlgeschlagen', mapBarberApprovalError(result.error));
    } else {
      await reload();
    }
    setActingId(null);
  };

  const openBarberCalendar = (barber: UserProfile) => {
    if (!barber.providerId) return;
    router.push({
      pathname: '/admin/barbers/[barberId]/slots',
      params: {
        barberId: barber.id,
        barberName: barber.displayName ?? 'Barber',
      },
    } as Href);
  };

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
          {error ? <Text className="text-error mb-3 text-sm">{error}</Text> : null}
          {barbers.length === 0 ? (
            <AppCard>
              <Text className="text-brand-muted text-center">Keine Barber-Profile.</Text>
            </AppCard>
          ) : (
            barbers.map((barber) => {
              const needsApproval = barberNeedsApproval(barber);
              return (
                <AppCard key={barber.id} className="mb-3">
                  <Pressable
                    onPress={() => openBarberCalendar(barber)}
                    disabled={needsApproval}
                    className={needsApproval ? '' : 'active:opacity-80'}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-2">
                        <Text className="text-brand-text font-semibold">
                          {barber.displayName ?? 'Unbenannt'}
                        </Text>
                        <Text className="text-brand-muted text-sm mt-1">
                          {barberStatusLabel(barber)}
                        </Text>
                      </View>
                      {!needsApproval ? (
                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                      ) : null}
                    </View>
                  </Pressable>
                  {needsApproval ? (
                    <View className="flex-row gap-2 mt-4">
                      <View className="flex-1">
                        <AppButton
                          label="Genehmigen"
                          onPress={() => handleApproval(barber.id, 'approved')}
                          loading={actingId === barber.id}
                        />
                      </View>
                      <View className="flex-1">
                        <AppButton
                          label="Ablehnen"
                          variant="danger"
                          onPress={() => handleApproval(barber.id, 'rejected')}
                          loading={actingId === barber.id}
                        />
                      </View>
                    </View>
                  ) : null}
                </AppCard>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
