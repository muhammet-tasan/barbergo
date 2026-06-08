import {
  ActivityIndicator,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import { AppButton } from '@/components/AppButton';
import { brandCopy } from '@/constants/brand-copy';
import { brandImageAspect, brandImages } from '@/constants/images';
import { colors } from '@/constants/theme';

/** Home-only layout — not shared with form/detail screens. */
const HOME = {
  horizontalPadding: 16,
  logoToHeadline: 80,
  headlineToSubtitle: 14,
  subtitleToBadge: 24,
  badgeToActions: 56,
  buttonGap: 14,
  heroPaddingTop: 12,
  heroLiftRatio: 0.07,
} as const;

const heroLogoSource = brandImages.heroDarkPreview;
const HERO_LOGO_ASPECT = brandImageAspect.heroDarkPreview;

type HomeHeroProps = {
  loading: boolean;
  isAdmin: boolean;
  isBarber: boolean;
  onBook: () => void;
  onAdmin: () => void;
  onBarberDashboard: () => void;
  onBookings: () => void;
};

export function HomeHero({
  loading,
  isAdmin,
  isBarber,
  onBook,
  onAdmin,
  onBarberDashboard,
  onBookings,
}: HomeHeroProps) {
  const { height } = useWindowDimensions();
  const heroLift = Math.round(height * HOME.heroLiftRatio);

  return (
    <View
      style={[
        styles.heroContainer,
        {
          paddingTop: HOME.heroPaddingTop,
          paddingBottom: heroLift,
          marginTop: -Math.round(heroLift * 0.4),
        },
      ]}
    >
      <View style={styles.brandGroup}>
        <View style={styles.heroLogoContainer}>
          <Image
            source={heroLogoSource}
            contentFit="contain"
            accessibilityLabel="BarberGo"
            style={styles.heroLogoImage}
          />
        </View>
      </View>

      <View style={styles.textGroup}>
        <Text style={styles.headline} selectable={false}>
          {brandCopy.claim}
        </Text>
        <Text style={styles.subtitle} selectable={false}>
          {brandCopy.subtitle}
        </Text>
      </View>

      <View style={styles.badgeGroup}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} selectable={false}>
            {brandCopy.serviceArea}
          </Text>
        </View>
      </View>

      <View style={styles.actionsGroup}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : isAdmin ? (
          <AppButton label="Admin-Bereich" onPress={onAdmin} />
        ) : isBarber ? (
          <AppButton label="Barber-Bereich" onPress={onBarberDashboard} />
        ) : (
          <>
            <AppButton label="Termin buchen" onPress={onBook} />
            <AppButton label="Meine Termine" variant="secondary" onPress={onBookings} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: HOME.horizontalPadding,
  },
  brandGroup: {
    width: '100%',
    alignItems: 'center',
  },
  heroLogoContainer: {
    width: '100%',
  },
  heroLogoImage: {
    width: '100%',
    aspectRatio: HERO_LOGO_ASPECT,
  },
  textGroup: {
    width: '100%',
    alignItems: 'center',
    marginTop: HOME.logoToHeadline,
  },
  headline: {
    fontSize: 33,
    fontWeight: '700',
    lineHeight: 40,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 350,
    marginTop: HOME.headlineToSubtitle,
  },
  badgeGroup: {
    alignItems: 'center',
    marginTop: HOME.subtitleToBadge,
  },
  badge: {
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
  },
  actionsGroup: {
    width: '100%',
    maxWidth: 400,
    marginTop: HOME.badgeToActions,
    gap: HOME.buttonGap,
  },
  loadingWrap: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
