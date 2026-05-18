import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppButton } from '@/components/AppButton';

/** Placeholder — admin booking list comes in a later milestone. */
export default function AdminPlaceholderScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-brand-dark">
      <View className="flex-1 px-6 justify-center items-center">
        <Text className="text-xl text-white font-semibold text-center">
          Admin demo — coming next
        </Text>
        <View className="mt-8 w-full">
          <AppButton label="Back to home" variant="secondary" onPress={() => router.replace('/')} />
        </View>
      </View>
    </SafeAreaView>
  );
}
