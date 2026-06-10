import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { listCustomerProfiles, type ProfileListItem } from '@/services/profiles';

export default function AdminCustomersScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const reload = useCallback(async () => {
    setLoading(true);
    const result = await listCustomerProfiles();
    setProfiles(result.profiles);
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
      <ScreenHeader title="Alle Kunden" onBack={() => router.back()} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
          {error ? <Text className="text-warning mb-3">{error}</Text> : null}
          {profiles.length === 0 ? (
            <AppCard>
              <Text className="text-brand-muted text-center">Keine Kunden gefunden.</Text>
            </AppCard>
          ) : (
            profiles.map((profile) => (
              <AppCard key={profile.id} className="mb-3">
                <Text className="text-brand-text font-semibold">
                  {profile.displayName ?? 'Unbenannt'}
                </Text>
                {profile.phone ? (
                  <Text className="text-brand-muted text-sm mt-1">{profile.phone}</Text>
                ) : null}
                {profile.address ? (
                  <Text className="text-brand-muted text-sm mt-1">{profile.address}</Text>
                ) : null}
              </AppCard>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
