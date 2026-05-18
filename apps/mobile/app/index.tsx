import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppButton } from '@/components/AppButton';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-brand-dark">
      <View className="flex-1 px-6 justify-center">
        <View className="mb-10">
          <Text className="text-4xl font-bold text-white tracking-tight">barbergo</Text>
          <Text className="text-lg text-slate-300 mt-3 leading-relaxed">
            Mobile Haarschnitte bei dir zu Hause
          </Text>
          <View className="mt-4 self-start rounded-full bg-brand-surface px-3 py-1">
            <Text className="text-sm text-brand-gold">Basel & Umgebung</Text>
          </View>
        </View>

        <View className="gap-4">
          <AppButton
            label="Termin buchen"
            onPress={() => router.push('/barber')}
          />
          <AppButton
            label="Admin-Demo"
            variant="secondary"
            onPress={() => router.push('/admin')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
