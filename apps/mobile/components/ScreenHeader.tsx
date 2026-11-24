import { useState, type ReactNode } from 'react';
import { Image } from 'expo-image';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AuthActionButton } from '@/components/AuthActionButton';
import { brandImageAspect, brandImages } from '@/constants/images';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { getHeaderWelcomeText } from '@/utils/welcome-text';

export type HeaderLogoVariant = 'mark' | 'wordmark' | 'none';

type ScreenHeaderProps = {
  /** Home: welcome + auth. Subpages: back + title. */
  variant?: 'home' | 'subpage';
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showAuthAction?: boolean;
  logoVariant?: HeaderLogoVariant;
  animatedLogoSlot?: ReactNode;
  onBack?: () => void;
};

/** Minimum bar height (home + subpage); grows when the text moves to its own line. */
const HEADER_BAR_HEIGHT = 52;
/** Width reserved for the back button (subpage). */
const BACK_SLOT_WIDTH = 48;
/** Gap between text and auth buttons that must stay free before the text is moved down. */
const TEXT_AUTH_GAP = 12;

const HIDDEN_MEASURE_STYLE = {
  position: 'absolute',
  top: 0,
  left: 0,
  opacity: 0,
} as const;

function useWidth() {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    setWidth((current) => (current === next ? current : next));
  };
  return [width, onLayout] as const;
}

export function ScreenHeader({
  variant = 'subpage',
  title,
  subtitle,
  showBack = true,
  showAuthAction = true,
  logoVariant = 'none',
  animatedLogoSlot,
  onBack,
}: ScreenHeaderProps) {
  const router = useRouter();
  const { session, profile, loading, isAdmin } = useAuth();
  const isHome = variant === 'home';

  const [rowWidth, onRowLayout] = useWidth();
  const [authWidth, onAuthLayout] = useWidth();
  const [textWidth, onTextLayout] = useWidth();

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
          transition={200}
          priority="high"
        />
      </Pressable>
    ) : null);

  const authNode = showAuthAction ? (
    <View onLayout={onAuthLayout} style={{ alignSelf: 'flex-end' }}>
      <AuthActionButton compact />
    </View>
  ) : null;

  if (isHome) {
    const welcome = loading ? '' : getHeaderWelcomeText(session, profile, { isAdmin });
    const measured = rowWidth > 0 && textWidth > 0;
    // Text and auth buttons would overlap -> the text moves below the buttons, full width.
    const stacked = measured && textWidth + authWidth + TEXT_AUTH_GAP > rowWidth;

    return (
      <View className="border-b border-brand-border/80 bg-brand-dark">
        <View className="px-4 py-1.5" style={{ minHeight: HEADER_BAR_HEIGHT, justifyContent: 'center' }}>
          <View onLayout={onRowLayout} style={{ position: 'relative' }}>
            {stacked ? (
              <View style={{ gap: 4 }}>
                <View style={{ alignItems: 'flex-end' }}>{authNode}</View>
                <Text className="text-sm font-medium text-brand-text leading-5" selectable={false}>
                  {welcome}
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center" style={{ gap: TEXT_AUTH_GAP }}>
                <Text
                  className="flex-1 min-w-0 text-sm font-medium text-brand-text leading-5"
                  selectable={false}
                >
                  {welcome || ' '}
                </Text>
                {authNode}
              </View>
            )}

            {/* Invisible copy to measure the natural (single-line) width of the welcome text. */}
            <Text
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              numberOfLines={1}
              onLayout={onTextLayout}
              style={HIDDEN_MEASURE_STYLE}
              className="text-sm font-medium leading-5"
              selectable={false}
            >
              {welcome}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Subpage: [back] [title] [auth]; a title that does not fit between the sides moves down.
  const backWidth = showBack ? BACK_SLOT_WIDTH : 0;
  const rightWidth = showAuthAction ? authWidth : 0;
  // rowWidth includes the container's horizontal padding (px-3 = 24).
  const availableForTitle = rowWidth - 24 - backWidth - rightWidth - 8;
  const titleMeasured = Boolean(title) && rowWidth > 0 && textWidth > 0;
  const stacked = titleMeasured && textWidth > availableForTitle;

  const backNode = showBack ? (
    <Pressable
      onPress={handleBack}
      className="min-h-[48px] min-w-[40px] items-center justify-center active:opacity-70"
      accessibilityRole="button"
      accessibilityLabel="Zurück"
    >
      <Ionicons name="chevron-back" size={26} color={colors.accent} />
    </Pressable>
  ) : null;

  const titleBlock = title ? (
    <View className="items-center justify-center max-w-full">
      <Text
        className="text-base font-semibold text-brand-text text-center"
        numberOfLines={stacked ? 3 : 1}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          className="text-xs text-brand-muted text-center mt-0.5"
          numberOfLines={stacked ? 3 : 1}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  ) : (
    logoNode
  );

  return (
    <View className="border-b border-brand-border/80 bg-brand-dark">
      <View
        className="px-3"
        style={{ minHeight: HEADER_BAR_HEIGHT, justifyContent: 'center' }}
        onLayout={onRowLayout}
      >
        {stacked ? (
          <>
            <View className="flex-row items-center justify-between" style={{ minHeight: HEADER_BAR_HEIGHT }}>
              <View style={{ width: backWidth }} className="flex-row items-center">
                {backNode}
              </View>
              {authNode}
            </View>
            <View className="items-center justify-center pb-2 px-1">{titleBlock}</View>
          </>
        ) : (
          <View className="flex-row items-center" style={{ minHeight: HEADER_BAR_HEIGHT }}>
            <View style={{ width: backWidth }} className="flex-row items-center">
              {backNode}
            </View>
            <View className="flex-1 items-center justify-center px-1 min-w-0">{titleBlock}</View>
            <View className="items-end justify-center shrink-0">{authNode}</View>
          </View>
        )}

        {title ? (
          <View pointerEvents="none" style={HIDDEN_MEASURE_STYLE} onLayout={onTextLayout}>
            <Text
              numberOfLines={1}
              className="text-base font-semibold"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              {title}
            </Text>
            {subtitle ? (
              <Text numberOfLines={1} className="text-xs mt-0.5">
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
