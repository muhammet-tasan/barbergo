import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { ProfileFactRow } from '@/components/ProfileFactRow';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useProvider } from '@/hooks/use-provider';
import { getProviderQuote } from '@/utils/provider-profile';

export default function BarberProfileScreen() {
  const router = useRouter();
  const { providerId } = useLocalSearchParams<{ providerId?: string }>();
  const { provider, loading, error } = useProvider(providerId);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Barber-Profil" />
        <View className="flex-1 items-center justify-center bg-brand-dark">
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!provider) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Barber-Profil" />
        <View className="flex-1 px-6 justify-center bg-brand-dark">
          <Text className="text-brand-text text-center mb-4">Barber konnte nicht geladen werden.</Text>
          {error ? (
            <Text className="text-error text-center text-sm mb-6">{error}</Text>
          ) : null}
          <AppButton label="Zur Startseite" onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }

  const quote = getProviderQuote(provider);

  const goToServices = () => {
    router.push({
      pathname: '/barber/services',
      params: { providerId: provider.id },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title={provider.name} />
      <ScrollView
        className="flex-1 bg-brand-dark"
        contentContainerClassName="px-4 pb-8"
      >
        <View className="items-center py-5">
          <ProfileAvatar imageUrl={provider.imageUrl} name={provider.name} size={112} variant="profile" />
          <Text className="text-2xl font-bold text-brand-text mt-4">{provider.name}</Text>
        </View>

        <AppCard className="mb-4 border-brand-gold/25">
          <Text className="text-base italic leading-6 text-brand-text text-center">{`„${quote}"`}</Text>
        </AppCard>

        <AppCard className="mb-4">
          <Text className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
            Steckbrief
          </Text>
          <ProfileFactRow icon="location-outline" label="Einsatzgebiet" value={provider.serviceArea} />
          <ProfileFactRow icon="home-outline" label="Serviceart" value="Hausbesuch · mobil" />
          <ProfileFactRow icon="cut-outline" label="Spezialität" value="Fade, Bart & Finish" />
          <ProfileFactRow icon="chatbubble-ellipses-outline" label="Kontakt" value="WhatsApp nach Buchung" />
          <ProfileFactRow icon="information-circle-outline" label="Über mich" value={provider.description} />
        </AppCard>

        <AppButton label="Services anzeigen" onPress={goToServices} />
      </ScrollView>
    </SafeAreaView>
  );
}
