import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export default function HomeScreen() {
  const router = useRouter();
  const { loading, isAuthenticated, isBarber, isCustomer } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="barbergo" showBack={false} />
      <View className="flex-1 px-6 justify-center">
        <View className="mb-10">
          <Text className="text-4xl font-bold text-brand-text tracking-tight">barbergo</Text>
          <Text className="text-lg text-brand-muted mt-3 leading-relaxed">
            Mobile Haarschnitte bei dir zu Hause
          </Text>
          <View className="mt-4 self-start rounded-full bg-brand-surface px-3 py-1">
            <Text className="text-sm text-brand-gold">Basel & Umgebung</Text>
          </View>
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
