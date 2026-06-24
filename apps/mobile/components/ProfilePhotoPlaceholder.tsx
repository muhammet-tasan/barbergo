import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { brandImages } from '@/constants/images';

/** UI-only avatar placeholder — no upload yet. */
export function ProfilePhotoPlaceholder() {
  return (
    <View className="items-center mb-6">
      <View className="w-20 h-20 rounded-full border border-brand-border/80 bg-brand-surface items-center justify-center overflow-hidden">
        <Image
          source={brandImages.avatarRoundDark}
          style={{ width: 64, height: 64 }}
          contentFit="contain"
          accessibilityLabel="Profilfoto Platzhalter"
        />
      </View>
      <Text className="text-brand-text text-sm font-medium mt-3">Profilfoto</Text>
    </View>
  );
}
