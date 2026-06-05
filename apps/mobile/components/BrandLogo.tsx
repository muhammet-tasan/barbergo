import { Image } from 'expo-image';
import { View } from 'react-native';

import { brandImages } from '@/constants/images';

type BrandMarkProps = {
  size?: number;
  accessibilityLabel?: string;
};

/** Barber character mark (avatar / list icon). */
export function BrandMark({ size = 56, accessibilityLabel = 'BarberGo' }: BrandMarkProps) {
  return (
    <Image
      source={brandImages.logoMark}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityLabel={accessibilityLabel}
    />
  );
}

type BrandLogoProps = {
  variant?: 'hero' | 'horizontal' | 'vertical';
  width?: number;
  height?: number;
  /** Stretch logo to container width (e.g. home header). */
  fullWidth?: boolean;
  accessibilityLabel?: string;
};

const logoSources = {
  hero: brandImages.wordmark,
  horizontal: brandImages.headerLogo,
  vertical: brandImages.wordmark,
} as const;

/** Full wordmark — hero (start), horizontal (header), vertical (splash-style). */
export function BrandLogo({
  variant = 'horizontal',
  width,
  height,
  fullWidth = false,
  accessibilityLabel = 'BarberGo',
}: BrandLogoProps) {
  const defaults =
    variant === 'hero'
      ? { width: 300, height: 88 }
      : variant === 'vertical'
        ? { width: 280, height: 88 }
        : { width: 165, height: 48 };

  const resolvedHeight = height ?? (fullWidth ? 72 : defaults.height);
  const resolvedWidth = width ?? defaults.width;

  if (fullWidth) {
    return (
      <View className="w-full" style={{ height: resolvedHeight }}>
        <Image
          source={logoSources[variant]}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          accessibilityLabel={accessibilityLabel}
        />
      </View>
    );
  }

  return (
    <Image
      source={logoSources[variant]}
      style={{ width: resolvedWidth, height: resolvedHeight }}
      contentFit="contain"
      accessibilityLabel={accessibilityLabel}
    />
  );
}
