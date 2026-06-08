import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';

export default function BarberDashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Barber" onBack={() => router.push('/')} />
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
        <Text className="text-brand-muted mb-4 leading-5">
          Dein Barber-Bereich — Buchungen und Profil.
        </Text>
        <Pressable onPress={() => router.push('/barber/dashboard/bookings')} className="mb-3">
          <AppCard>
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={22} color={colors.accent} />
              <View className="flex-1 ml-3">
                <Text className="text-brand-text font-semibold">Meine Buchungen</Text>
                <Text className="text-brand-muted text-sm">Termine verwalten</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </AppCard>
        </Pressable>
        <Pressable onPress={() => router.push('/barber/dashboard/profile')} className="mb-3">
          <AppCard>
            <View className="flex-row items-center">
              <Ionicons name="person-outline" size={22} color={colors.accent} />
              <View className="flex-1 ml-3">
                <Text className="text-brand-text font-semibold">Mein Profil</Text>
                <Text className="text-brand-muted text-sm">Kontakt und Status</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </AppCard>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
