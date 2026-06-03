import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useProvider } from '@/hooks/use-provider';
import { getProviderHeadline, getProviderQuote } from '@/utils/provider-profile';

export default function BarberProfileScreen() {
  const router = useRouter();
  const { provider, loading, error } = useProvider();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center" edges={['top']}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (!provider) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Dein Barber" />
        <View className="flex-1 px-6 justify-center">
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
  const headline = getProviderHeadline(provider);

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title={provider.name} />
      <ScrollView className="flex-1 px-4" contentContainerClassName="pb-8">
        <View className="items-center py-6">
          <ProfileAvatar imageUrl={provider.imageUrl} name={provider.name} size={112} />
          <Text className="text-2xl font-bold text-brand-text mt-5">{provider.name}</Text>
          <Text className="text-sm font-medium text-brand-gold mt-1 tracking-wide">{headline}</Text>
        </View>

        <AppCard className="mb-4 border-brand-gold/30 bg-brand-surface/90">
          <View className="flex-row">
            <Text className="text-3xl text-brand-gold leading-none mr-2">„</Text>
            <View className="flex-1">
              <Text className="text-base italic leading-6 text-brand-text">{quote}</Text>
              <Text className="text-sm text-brand-muted mt-3">— {provider.name}</Text>
            </View>
          </View>
        </AppCard>

        <AppCard className="mb-6">
          <Text className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
            Über mich
          </Text>
          <Text className="text-base leading-6 text-brand-text/90">{provider.description}</Text>
          <View className="flex-row items-center mt-4 pt-4 border-t border-brand-border">
            <Ionicons name="cut-outline" size={18} color={colors.accent} />
            <Text className="text-brand-muted ml-2 text-sm">
              Fade, Bart & Finish — {provider.serviceArea}
            </Text>
          </View>
        </AppCard>

        <AppButton label="Service auswählen" onPress={() => router.push('/barber/services')} />
      </ScrollView>
    </SafeAreaView>
  );
}
