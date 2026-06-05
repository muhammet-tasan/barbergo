import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { BrandIntro } from '@/components/BrandIntro';
import { BrandLogo } from '@/components/BrandLogo';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export default function HomeScreen() {
  const router = useRouter();
  const { loading, isBarber, isCustomer } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader variant="home" />
      <ScrollView
        className="flex-1 bg-brand-dark"
        contentContainerClassName="px-6 pt-6 pb-12"
      >
        <View className="items-center mb-6">
          <BrandLogo variant="hero" width={320} height={100} />
        </View>

        <View className="mb-8">
          <BrandIntro align="center" />
        </View>

        <View className="gap-4 mt-2">
          {loading ? (
            <ActivityIndicator color={colors.accent} />
          ) : isBarber ? (
            <AppButton label="Buchungen verwalten" onPress={() => router.push('/admin')} />
          ) : isCustomer ? (
            <>
              <AppButton label="Termin buchen" onPress={() => router.push('/barbers')} />
              <AppButton
                label="Meine Termine"
                variant="secondary"
                onPress={() => router.push('/customer/bookings')}
              />
            </>
          ) : (
            <>
              <AppButton label="Termin buchen" onPress={() => router.push('/barbers')} />
              <AppButton
                label="Meine Termine"
                variant="secondary"
                onPress={() => router.push('/guest/bookings')}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
