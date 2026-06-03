import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { BrandIntro } from '@/components/BrandIntro';
import { HomeHeader } from '@/components/HomeHeader';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export default function HomeScreen() {
  const router = useRouter();
  const { loading, isBarber, isCustomer } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <HomeHeader />
      <View className="flex-1 px-6 justify-center">
        <View className="mb-10">
          <BrandIntro />
        </View>

        <View className="gap-4 min-h-[132px] justify-center">
          {loading ? (
            <ActivityIndicator color={colors.accent} />
          ) : isBarber ? (
            <AppButton label="Buchungen verwalten" onPress={() => router.push('/admin')} />
          ) : isCustomer ? (
            <>
              <AppButton label="Termin buchen" onPress={() => router.push('/barbers')} />
              <AppButton
                label="Termine verwalten"
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
      </View>
    </SafeAreaView>
  );
}
