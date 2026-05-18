import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { defaultProvider } from '@/data/mockData';
import { colors } from '@/constants/theme';

export default function BarberProfileScreen() {
  const router = useRouter();
  const provider = defaultProvider;

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Your barber" />
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
            <Text className="text-slate-400 ml-2 text-sm">Home visits — we come to you</Text>
          </View>
        </AppCard>

        <AppButton
          label="Choose a service"
          onPress={() => router.push('/barber/services')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
