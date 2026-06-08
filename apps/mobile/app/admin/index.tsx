import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';

type HubLink = {
  title: string;
  subtitle: string;
  href: '/admin/bookings' | '/admin/profiles' | '/admin/pending-barbers' | '/admin/profile';
  icon: keyof typeof Ionicons.glyphMap;
};

const LINKS: HubLink[] = [
  {
    title: 'Alle Buchungen',
    subtitle: 'Termine verwalten und Status ändern',
    href: '/admin/bookings',
    icon: 'calendar-outline',
  },
  {
    title: 'Profile',
    subtitle: 'Kunden und Barber einsehen',
    href: '/admin/profiles',
    icon: 'people-outline',
  },
  {
    title: 'Barber-Freigaben',
    subtitle: 'Neue Barber genehmigen oder ablehnen',
    href: '/admin/pending-barbers',
    icon: 'shield-checkmark-outline',
  },
  {
    title: 'Mein Admin-Profil',
    subtitle: 'Kontaktdaten bearbeiten',
    href: '/admin/profile',
    icon: 'person-outline',
  },
];

export default function AdminHubScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Admin" onBack={() => router.push('/')} />
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
        <Text className="text-brand-muted mb-4 leading-5">
          Verwaltung für BarberGo — Buchungen, Profile und Freigaben.
        </Text>
        {LINKS.map((link) => (
          <Pressable key={link.href} onPress={() => router.push(link.href)} className="mb-3">
            <AppCard>
              <View className="flex-row items-center">
                <Ionicons name={link.icon} size={22} color={colors.accent} />
                <View className="flex-1 ml-3">
                  <Text className="text-brand-text font-semibold text-base">{link.title}</Text>
                  <Text className="text-brand-muted text-sm mt-0.5">{link.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </AppCard>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
