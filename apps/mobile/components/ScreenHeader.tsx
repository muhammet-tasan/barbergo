import { type ReactNode } from 'react';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AuthActionButton } from '@/components/AuthActionButton';
import { FadeOutText } from '@/components/FadeOutText';
import { brandImageAspect, brandImages } from '@/constants/images';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { getHeaderWelcomeText } from '@/utils/welcome-text';

export type HeaderLogoVariant = 'mark' | 'wordmark' | 'none';

type ScreenHeaderProps = {
  /** Home: welcome + auth. Subpages: back + title. */
  variant?: 'home' | 'subpage';
  title?: string;
  showBack?: boolean;
  showAuthAction?: boolean;
  logoVariant?: HeaderLogoVariant;
  animatedLogoSlot?: ReactNode;
  onBack?: () => void;
};

const AUTH_SLOT_WIDTH = 88;
/** Fixed header bar height (home + subpage). */
const HEADER_BAR_HEIGHT = 52;
const WELCOME_LINE_HEIGHT = 20;

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
  const { session, profile, loading, isAdmin } = useAuth();
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
          source={brandImages.wordmark}
          style={{ width: 160, height: 160 / brandImageAspect.wordmark }}
          contentFit="contain"
        />
      </Pressable>
    ) : null);

  if (isHome) {
    const welcome = loading ? '' : getHeaderWelcomeText(session, profile, { isAdmin });

    return (
      <View className="border-b border-brand-border/80 bg-brand-dark">
        <View
          className="flex-row items-center px-4 gap-3"
          style={{ height: HEADER_BAR_HEIGHT }}
        >
          <View
            className="flex-1 min-w-0 justify-center pr-1"
            style={{ height: WELCOME_LINE_HEIGHT }}
          >
            {loading ? (
              <View style={{ height: WELCOME_LINE_HEIGHT }} />
            ) : (
              <FadeOutText className="text-sm font-medium text-brand-text leading-5">
                {welcome || ' '}
              </FadeOutText>
            )}
          </View>
          <View style={{ width: AUTH_SLOT_WIDTH }} className="items-end justify-center shrink-0">
            {showAuthAction ? <AuthActionButton compact /> : null}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="border-b border-brand-border/80 bg-brand-dark">
      <View className="flex-row items-center px-3" style={{ height: HEADER_BAR_HEIGHT }}>
        <View className="w-[80px] flex-row items-center">
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

        <View className="flex-1 items-center justify-center px-1 min-w-0">
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

        <View style={{ width: AUTH_SLOT_WIDTH }} className="items-end justify-center shrink-0">
          {showAuthAction ? <AuthActionButton compact /> : null}
        </View>
      </View>
    </View>
  );
}
