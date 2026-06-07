import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { HomeHero } from '@/components/HomeHero';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/contexts/auth-context';
import { getBookingsListPath } from '@/services/auth-roles';
import { getDisplayName } from '@/utils/display-name';

export default function HomeScreen() {
  const router = useRouter();
  const { loading, isBarber, isCustomer, session } = useAuth();
  const greetingName = isCustomer ? getDisplayName(session) : undefined;

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader variant="home" />

      {greetingName ? (
        <View className="px-5 pt-1 items-end">
          <Text className="text-[11px] text-brand-muted tracking-wide" selectable={false}>
            Hallo {greetingName}
          </Text>
        </View>
      ) : null}

      <ScrollView
        className="flex-1 bg-brand-dark"
        contentContainerClassName="flex-grow justify-center pb-12 pt-1"
        showsVerticalScrollIndicator={false}
      >
        <HomeHero
          loading={loading}
          isBarber={isBarber}
          onBook={() => router.push('/barbers')}
          onManage={() => router.push('/admin')}
          onBookings={() => router.push(getBookingsListPath(session))}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
