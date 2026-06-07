/** Known aspect ratios (width / height) for layout without resolveAssetSource (web-safe). */
export const brandImageAspect = {
  /** barbergo-header-logo-transparent.png — 1000×260 */
  headerLogo: 1000 / 260,
  /** barbergo-wordmark-transparent.png — 1080×400 */
  wordmark: 1080 / 400,
} as const;

/** BarberGo raster assets — all under `apps/mobile/assets/images/`. */
export const brandImages = {
  headerLogo: require('../assets/images/barbergo-header-logo-transparent.png'),
  wordmark: require('../assets/images/barbergo-wordmark-transparent.png'),
  heroLogoWide: require('../assets/images/hero-logo-wide.png'),
  logoHorizontal: require('../assets/images/barbergo-header-logo-transparent.png'),
  logoVertical: require('../assets/images/barbergo-wordmark-transparent.png'),
  logoMark: require('../assets/images/barbergo-mark-transparent.png'),
  avatarRound: require('../assets/images/barbergo-avatar-round-512.png'),
  avatarRoundDark: require('../assets/images/barbergo-round-dark.png'),
  logoIconOnly: require('../assets/images/android-icon-foreground.png'),
} as const;

/** Service-Kopf-Illustrationen — Service-Auswahl statt generischer Icons. */
export const serviceImages = {
  haircut: require('../assets/images/kopf_1_haarschnitt.png'),
  beard: require('../assets/images/kopf_2_bart.png'),
  combo: require('../assets/images/kopf_3_haare_und_bart.png'),
  kids: require('../assets/images/kopf_4_kind.png'),
} as const;
