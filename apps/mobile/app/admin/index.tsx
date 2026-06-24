import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppCard } from '@/components/AppCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { navigateBack } from '@/utils/navigation';

type HubLink = {
  title: string;
  subtitle: string;
  href: '/admin/barbers' | '/admin/customers' | '/admin/barber-approvals';
  icon: keyof typeof Ionicons.glyphMap;
};

const LINKS: HubLink[] = [
  {
    title: 'Barber verwalten',
    subtitle: 'Profile, Buchungskalender und Freigaben',
    href: '/admin/barbers',
    icon: 'cut-outline',
  },
  {
    title: 'Kunden verwalten',
    subtitle: 'Registrierte Kundenkonten ansehen',
    href: '/admin/customers',
    icon: 'people-outline',
  },
  {
    title: 'Barber-Freigaben',
    subtitle: 'Neue Barber prüfen und freigeben',
    href: '/admin/barber-approvals',
    icon: 'shield-checkmark-outline',
  },
];

export default function AdminHubScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader
        title="Admin-Bereich"
        subtitle="Barber, Kunden und Freigaben verwalten"
        onBack={() => navigateBack(router, '/')}
      />
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href as Href} asChild>
            <Pressable className="mb-3 active:opacity-80">
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
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
