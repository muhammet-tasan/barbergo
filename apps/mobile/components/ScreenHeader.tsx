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

/** Height of the bar row (back button + auth buttons) — identical for every header. */
const BAR_HEIGHT = 52;
/** Width reserved for the back button. */
const BACK_SLOT_WIDTH = 44;
/** Space that must stay free between text and buttons, otherwise the text moves below. */
const TEXT_GAP = 12;
/** Extra space above/below the text when it sits on its own line. */
const STACKED_TEXT_PADDING_TOP = 2;
const STACKED_TEXT_PADDING_BOTTOM = 14;

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

/**
 * One header layout for all screens:
 *   bar row   [back]  [title]  [auth]   (fixed height, everything vertically centered)
 * The text (welcome text on home, title on subpages) stays in the bar row when it fits next to the
 * buttons (subpage titles are centered on the screen). Otherwise it moves to its own line below
 * the bar row, full width, and the buttons stay on the bar row.
 */
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
    <View onLayout={onAuthLayout}>
      <AuthActionButton compact />
    </View>
  ) : null;

  const backNode =
    !isHome && showBack ? (
      <Pressable
        onPress={handleBack}
        className="items-center justify-center active:opacity-70"
        style={{ width: BACK_SLOT_WIDTH, height: BAR_HEIGHT }}
        accessibilityRole="button"
        accessibilityLabel="Zurück"
      >
        <Ionicons name="chevron-back" size={26} color={colors.accent} />
      </Pressable>
    ) : null;

  const welcome = isHome && !loading ? getHeaderWelcomeText(session, profile, { isAdmin }) : '';
  const hasText = isHome ? Boolean(welcome) : Boolean(title);
  const measured = rowWidth > 0 && textWidth > 0;

  // Home: text left of the buttons. Subpage: text centered, needs the same room on both sides.
  const backWidth = backNode ? BACK_SLOT_WIDTH : 0;
  const sideWidth = Math.max(backWidth, showAuthAction ? authWidth : 0);
  const stacked = isHome
    ? measured && hasText && textWidth + authWidth + TEXT_GAP > rowWidth
    : measured && hasText && textWidth > rowWidth - 2 * sideWidth - 8;

  const textBlock = isHome ? (
    <Text
      className="text-sm font-medium text-brand-text leading-5"
      style={stacked ? undefined : { flexShrink: 1 }}
      selectable={false}
      numberOfLines={stacked ? 3 : 1}
    >
      {welcome}
    </Text>
  ) : title ? (
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
    <View className="border-b border-brand-border/80 bg-brand-dark px-4">
      <View onLayout={onRowLayout}>
        {/* Bar row: always the same height, back and auth buttons vertically centered. */}
        <View
          style={{
            height: BAR_HEIGHT,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ width: isHome ? 0 : Math.max(backWidth, 0) }}>{backNode}</View>

          {isHome && !stacked ? (
            <Text
              className="flex-1 text-sm font-medium text-brand-text leading-5"
              style={{ marginRight: TEXT_GAP }}
              selectable={false}
              numberOfLines={1}
            >
              {welcome || ' '}
            </Text>
          ) : null}

          {authNode}

          {/* Subpage title: centered on the bar, independent of the side widths. */}
          {!isHome && !stacked ? (
            <View
              pointerEvents="box-none"
              style={{
                position: 'absolute',
                left: sideWidth + 4,
                right: sideWidth + 4,
                top: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {textBlock}
            </View>
          ) : null}
        </View>

        {/* Text that did not fit next to the buttons: own line, full width. */}
        {stacked ? (
          <View
            style={{
              paddingTop: STACKED_TEXT_PADDING_TOP,
              paddingBottom: STACKED_TEXT_PADDING_BOTTOM,
              alignItems: isHome ? 'flex-start' : 'center',
            }}
          >
            {textBlock}
          </View>
        ) : null}

        {/* Invisible copy to measure the natural single-line width of the text. */}
        {hasText ? (
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={HIDDEN_MEASURE_STYLE}
            onLayout={onTextLayout}
          >
            <Text
              numberOfLines={1}
              className={isHome ? 'text-sm font-medium leading-5' : 'text-base font-semibold'}
              selectable={false}
            >
              {isHome ? welcome : title}
            </Text>
            {!isHome && subtitle ? (
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
