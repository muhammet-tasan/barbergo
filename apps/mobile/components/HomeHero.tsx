import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';

import { AppButton } from '@/components/AppButton';
import { brandCopy } from '@/constants/brand-copy';
import { brandImageAspect, brandImages } from '@/constants/images';
import { colors } from '@/constants/theme';

const HOME = {
  horizontalPadding: 16,
  paddingTop: 4,
  paddingBottom: 24,
  /** Zieht Text näher ans Logo (PNG hat unten transparenten Rand) */
  textPullTowardLogo: -32,
  /** Abstand zwischen Textblock und Buttons */
  textToButtonsGap: 64,
  headlineToSubtitle: 12,
  subtitleToBadge: 20,
  buttonGap: 14,
  actionsMaxWidth: 400,
  logoWidthRatio: 1.28,
  logoMaxWidth: 560,
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
  const { width: windowWidth } = useWindowDimensions();
  const logoWidth = Math.min(windowWidth * HOME.logoWidthRatio, HOME.logoMaxWidth);
  const showActions = variant !== 'barber_pending';
  const isPending = variant === 'barber_pending';

  return (
    <View style={styles.shell}>
      <View style={styles.contentStack}>
        <View style={[styles.brandGroup, { width: logoWidth }]}>
          <Image
            source={brandImages.logoTransparent}
            contentFit="contain"
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
              <AppButton label="Admin-Seite" onPress={onAdminPage} />
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
    flex: 1,
    width: '100%',
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
    maxWidth: 360,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: HOME.textPullTowardLogo,
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
    maxWidth: HOME.actionsMaxWidth,
    alignItems: 'center',
    alignSelf: 'center',
    gap: HOME.buttonGap,
  },
});
