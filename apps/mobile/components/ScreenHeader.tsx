import { type ReactNode } from 'react';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AuthActionButton } from '@/components/AuthActionButton';
import { brandImages } from '@/constants/images';
import { colors } from '@/constants/theme';

export type HeaderLogoVariant = 'mark' | 'wordmark' | 'none';

type ScreenHeaderProps = {
  /** Home: auth only (no header logo). Subpages: back + title. */
  variant?: 'home' | 'subpage';
  title?: string;
  showBack?: boolean;
  showAuthAction?: boolean;
  logoVariant?: HeaderLogoVariant;
  /** Reserved for future logo micro-animations — pass animated logo node here. */
  animatedLogoSlot?: ReactNode;
  onBack?: () => void;
};

const SIDE_SLOT = 'w-[80px]';

export function ScreenHeader({
  variant = 'subpage',
  title,
  showBack = true,
  showAuthAction = true,
  logoVariant = 'none',
  animatedLogoSlot,
  onBack,
}: ScreenHeaderProps) {
  const router = useRouter();
  const isHome = variant === 'home';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const goHome = () => router.replace('/');

  const logoNode =
    animatedLogoSlot ??
    (logoVariant === 'wordmark' ? (
      <Pressable onPress={goHome} className="active:opacity-80" accessibilityLabel="Zur Startseite">
        <Image
          source={brandImages.headerLogo}
          style={{ width: 150, height: 44 }}
          contentFit="contain"
        />
      </Pressable>
    ) : null);

  if (isHome) {
    return (
      <View className="border-b border-brand-border/80 bg-brand-dark">
        <View className="flex-row items-center px-4 py-2.5 min-h-[52px]">
          <View className={`${SIDE_SLOT} items-start`} />
          <View className="flex-1" />
          <View className={`${SIDE_SLOT} items-end justify-center`}>
            {showAuthAction ? <AuthActionButton compact /> : null}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="border-b border-brand-border/80 bg-brand-dark">
      <View className="flex-row items-center px-3 py-2.5 min-h-[52px]">
        <View className={`${SIDE_SLOT} flex-row items-center`}>
          {showBack ? (
            <Pressable
              onPress={handleBack}
              className="min-h-[48px] min-w-[40px] items-center justify-center active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Zurück"
            >
              <Ionicons name="chevron-back" size={26} color={colors.accent} />
            </Pressable>
          ) : null}
        </View>

        <View className="flex-1 items-center justify-center px-1">
          {title ? (
            <Text
              className="text-base font-semibold text-brand-text text-center"
              numberOfLines={1}
              accessibilityRole="header"
            >
              {title}
            </Text>
          ) : (
            logoNode
          )}
        </View>

        <View className={`${SIDE_SLOT} items-end justify-center`}>
          {showAuthAction ? <AuthActionButton compact /> : null}
        </View>
      </View>
    </View>
  );
}
