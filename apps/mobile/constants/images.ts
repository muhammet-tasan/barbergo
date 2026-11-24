/** Known aspect ratios (width / height) for layout without resolveAssetSource (web-safe). */
export const brandImageAspect = {
  /** logo-transparent(-web).png — 1536×1024 (Original), Web-Kopie 1120×747, gleiches Seitenverhältnis (Home + Header) */
  logoTransparent: 1536 / 1024,
  /** barbergo-wordmark-transparent(-web).png (Original 1536×1024; Layout-Verhältnis bleibt 1080/400) */
  wordmark: 1080 / 400,
  /** barbergodark-preview.png — 853×337 */
  heroDarkPreview: 853 / 337,
} as const;

const logoTransparent = require('../assets/images/logo-transparent-web.png');

/** BarberGo raster assets — all under `apps/mobile/assets/images/`. */
export const brandImages = {
  /** Primary brand logo — Home (gross), Header */
  logoTransparent,
  headerLogo: logoTransparent,
  logoHorizontal: logoTransparent,
  heroLogoWide: logoTransparent,
  wordmark: require('../assets/images/barbergo-wordmark-transparent-web.png'),
  logoVertical: require('../assets/images/barbergo-wordmark-transparent-web.png'),
  heroDarkPreview: require('../assets/images/barbergodark-preview.png'),
  logoMark: require('../assets/images/barbergo-mark-transparent.png'),
  avatarRound: require('../assets/images/barbergo-avatar-round-512.png'),
  avatarRoundDark: require('../assets/images/barbergo-round-dark.png'),
  logoIconOnly: require('../assets/images/android-icon-foreground-v2.png'),
} as const;

/** Service-Kopf-Illustrationen — Service-Auswahl statt generischer Icons. */
export const serviceImages = {
  haircut: require('../assets/images/kopf_1_haarschnitt.png'),
  beard: require('../assets/images/kopf_2_bart.png'),
  combo: require('../assets/images/kopf_3_haare_und_bart.png'),
  kids: require('../assets/images/kopf_4_kind.png'),
} as const;
