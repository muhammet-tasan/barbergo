import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useProvider } from '@/hooks/use-provider';

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
          <Text className="text-white text-center mb-4">Barber konnte nicht geladen werden.</Text>
          {error ? (
            <Text className="text-red-300 text-center text-sm mb-6">{error}</Text>
          ) : null}
          <AppButton label="Zur Startseite" onPress={() => router.replace('/')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Dein Barber" />
      <ScrollView className="flex-1 px-4" contentContainerClassName="pb-8">
        <View className="items-center py-8">
          <View className="w-24 h-24 rounded-full bg-brand-surface border-2 border-brand-gold items-center justify-center">
            <Ionicons name="cut" size={40} color={colors.accent} />
          </View>
          <Text className="text-2xl font-bold text-white mt-4">{provider.name}</Text>
          <View className="mt-2 rounded-full bg-brand-surface px-3 py-1">
            <Text className="text-sm text-brand-gold">{provider.serviceArea}</Text>
          </View>
        </View>

        <AppCard className="mb-6">
          <Text className="text-base text-slate-200 leading-relaxed">{provider.description}</Text>
          <View className="flex-row items-center mt-4 pt-4 border-t border-slate-700">
            <Ionicons name="home-outline" size={20} color={colors.textMuted} />
            <Text className="text-slate-400 ml-2 text-sm">Hausbesuche - wir kommen zu dir</Text>
          </View>
        </AppCard>

        <AppButton
          label="Service auswählen"
          onPress={() => router.push('/barber/services')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
