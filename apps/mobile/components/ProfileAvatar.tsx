import { Image } from 'expo-image';
import { View } from 'react-native';

import { BrandMark } from '@/components/BrandLogo';

type ProfileAvatarProps = {
  imageUrl?: string | null;
  size?: number;
  name?: string;
};

/** Round profile image — provider photo or brand mark fallback. */
export function ProfileAvatar({ imageUrl, size = 96, name }: ProfileAvatarProps) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View
      style={dimension}
      className="rounded-full border-2 border-brand-gold overflow-hidden bg-brand-surface items-center justify-center"
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size }}
          contentFit="cover"
          accessibilityLabel={name ? `Profilbild ${name}` : 'Profilbild'}
        />
      ) : (
        <BrandMark size={Math.round(size * 0.78)} accessibilityLabel={name ?? 'Barber'} />
      )}
    </View>
  );
}
