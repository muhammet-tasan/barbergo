import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppButton } from '@/components/AppButton';

/** Placeholder — barber profile screen comes in the next milestone. */
export default function BarberPlaceholderScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-brand-dark">
      <View className="flex-1 px-6 justify-center items-center">
        <Text className="text-xl text-white font-semibold text-center">
          Barber profile — coming next
        </Text>
        <View className="mt-8 w-full">
          <AppButton label="Back to home" variant="secondary" onPress={() => router.back()} />
        </View>
      </View>
    </SafeAreaView>
  );
}
