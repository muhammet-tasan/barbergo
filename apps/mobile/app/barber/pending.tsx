import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, Redirect, useRouter } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/contexts/auth-context';

export default function BarberPendingScreen() {
  const router = useRouter();
  const { loading, isBarberPending, isBarber, isAuthenticated } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (isBarber) {
    return <Redirect href={'/barber/dashboard' as Href} />;
  }

  if (!isBarberPending) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Freigabe ausstehend" onBack={() => router.replace('/')} />
      <View className="flex-1 px-6 justify-center">
        <Text className="text-brand-text text-xl font-bold text-center mb-3">
          Barber-Konto in Prüfung
        </Text>
        <Text className="text-brand-muted text-center leading-6 mb-6">
          Dein Barber-Profil wartet auf Freigabe durch den Admin. Du erhältst Zugang zum
          Barber-Bereich, sobald dein Konto bestätigt wurde.
        </Text>
        <AppButton label="Zur Startseite" variant="secondary" onPress={() => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
}
