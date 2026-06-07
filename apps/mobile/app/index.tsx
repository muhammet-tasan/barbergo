import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { BrandIntro } from '@/components/BrandIntro';
import { BrandLogo } from '@/components/BrandLogo';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
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
        <View className="px-5 pt-1 pb-0 items-end">
          <Text className="text-[11px] text-brand-muted tracking-wide">Hallo {greetingName}</Text>
        </View>
      ) : null}

      <ScrollView
        className="flex-1 bg-brand-dark"
        contentContainerClassName="flex-grow justify-center px-6 pt-4 pb-10"
      >
        <View className="w-full max-w-[400px] self-center items-center gap-5">
          <BrandLogo variant="hero" width={360} height={118} />

          <BrandIntro align="center" />

          <View className="w-full gap-3 mt-1">
            {loading ? (
              <ActivityIndicator color={colors.accent} />
            ) : isBarber ? (
              <AppButton label="Buchungen verwalten" onPress={() => router.push('/admin')} />
            ) : (
              <>
                <AppButton label="Termin buchen" onPress={() => router.push('/barbers')} />
                <AppButton
                  label="Meine Termine"
                  variant="secondary"
                  onPress={() => router.push(getBookingsListPath(session))}
                />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
