import { Image } from 'expo-image';
import { View } from 'react-native';

import { brandImages } from '@/constants/images';

type ProfileAvatarProps = {
  imageUrl?: string | null;
  size?: number;
  name?: string;
  /** card = round-dark; small = avatar-round-512 */
  variant?: 'profile' | 'card' | 'small';
};

const fallbackSources = {
  profile: brandImages.avatarRoundDark,
  card: brandImages.avatarRoundDark,
  small: brandImages.avatarRound,
} as const;

/** Round profile image — provider photo or brand avatar fallback. */
export function ProfileAvatar({
  imageUrl,
  size = 96,
  name,
  variant = 'profile',
}: ProfileAvatarProps) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View
      style={dimension}
      className="rounded-full border-2 border-brand-gold/70 overflow-hidden items-center justify-center"
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size }}
          contentFit="cover"
          accessibilityLabel={name ? `Profilbild ${name}` : 'Profilbild'}
        />
      ) : (
        <Image
          source={fallbackSources[variant]}
          style={{ width: size, height: size }}
          contentFit="cover"
          accessibilityLabel={name ? `Avatar ${name}` : 'Barber Avatar'}
        />
      )}
    </View>
  );
}
