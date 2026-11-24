import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { AppButton } from '@/components/AppButton';
import { brandCopy } from '@/constants/brand-copy';
import { brandImageAspect, brandImages } from '@/constants/images';
import { layout } from '@/constants/layout';
import { colors } from '@/constants/theme';
import { useWindowWidth } from '@/hooks/use-window-width';

const HOME = {
  horizontalPadding: 16,
  paddingTop: 4,
  paddingBottom: 24,
  /** Abstand zwischen Logo und Text */
  logoToText: 20,
  /** Abstand zwischen Textblock und Buttons */
  textToButtonsGap: 40,
  headlineToSubtitle: 12,
  subtitleToBadge: 20,
  buttonGap: 14,
} as const;

type HomeHeroProps = {
  loading: boolean;
  variant: 'guest' | 'customer' | 'barber' | 'barber_pending' | 'admin';
  onBook: () => void;
  onBookings: () => void;
  onProfile: () => void;
  onAdminPage: () => void;
  onAllBarbers: () => void;
  onAllBookings: () => void;
  onBarberSlots: () => void;
};

export function HomeHero({
  loading,
  variant,
  onBook,
  onBookings,
  onProfile,
  onAdminPage,
  onAllBarbers,
  onAllBookings,
  onBarberSlots,
}: HomeHeroProps) {
  const windowWidth = useWindowWidth();
  // Logo, texts and buttons use the full content width (screen, max. app column, minus padding).
  const logoWidth = Math.min(windowWidth, layout.maxContentWidth) - HOME.horizontalPadding * 2;
  const showActions = variant !== 'barber_pending';
  const isPending = variant === 'barber_pending';

  return (
    <View style={styles.shell}>
      <View style={styles.contentStack}>
        <View style={[styles.brandGroup, { width: logoWidth }]}>
          <Image
            source={brandImages.logoTransparent}
            contentFit="contain"
            transition={200}
            priority="high"
            accessibilityLabel="BarberGo"
            style={[styles.homeLogo, { width: logoWidth }]}
          />

          <View style={styles.textGroup}>
            {isPending ? (
              <Text style={styles.pendingText} selectable={false}>
                Dein Barber-Profil wird geprüft.
              </Text>
            ) : (
              <>
                <Text style={styles.headline} selectable={false}>
                  {brandCopy.claim}
                </Text>
                <Text style={styles.subtitle} selectable={false}>
                  {brandCopy.subtitle}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText} selectable={false}>
                    {brandCopy.serviceArea}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {showActions ? (
          <View style={styles.actionsGroup}>
            {loading ? (
              <ActivityIndicator color={colors.accent} />
            ) : variant === 'admin' ? (
              <>
                <AppButton label="Admin-Bereich öffnen" onPress={onAdminPage} />
                <AppButton label="Mein Profil" variant="secondary" onPress={onProfile} />
              </>
            ) : variant === 'barber' ? (
              <>
                <AppButton label="Alle Buchungen" onPress={onBarberSlots} />
                <AppButton label="Mein Profil" variant="secondary" onPress={onProfile} />
              </>
            ) : (
              <>
                <AppButton label="Termin buchen" onPress={onBook} />
                <AppButton label="Meine Termine" variant="secondary" onPress={onBookings} />
                {variant === 'customer' ? (
                  <AppButton label="Mein Profil" variant="tertiary" onPress={onProfile} />
                ) : null}
              </>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexGrow: 1,
    width: '100%',
    // The logo image is wider than the screen on purpose (transparent margins): clip, never scroll sideways.
    overflow: 'hidden',
    paddingHorizontal: HOME.horizontalPadding,
    paddingTop: HOME.paddingTop,
    paddingBottom: HOME.paddingBottom,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  contentStack: {
    width: '100%',
    alignItems: 'center',
    gap: HOME.textToButtonsGap,
  },
  brandGroup: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  homeLogo: {
    aspectRatio: brandImageAspect.logoTransparent,
  },
  textGroup: {
    width: '100%',
    alignItems: 'center',
    marginTop: HOME.logoToText,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: HOME.headlineToSubtitle,
  },
  badge: {
    marginTop: HOME.subtitleToBadge,
    height: 34,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: `${colors.border}B3`,
    backgroundColor: `${colors.surface}80`,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: colors.textMuted,
    textAlign: 'center',
  },
  pendingText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actionsGroup: {
    width: '100%',
    alignItems: 'stretch',
    gap: HOME.buttonGap,
  },
});
