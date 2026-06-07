/**
 * BarberGo design tokens — canonical palette (see `docs/branding.md`).
 * Use Tailwind `brand-*`, `success`, `warning`, `error` in UI; import `colors` for icons, StatusBar, inline styles.
 */
export const colors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  accent: '#D4A574',
  accentDark: '#B8864E',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#334155',
} as const;

/** Same values as Tailwind `brand.*` utilities */
export const brand = {
  dark: colors.background,
  surface: colors.surface,
  surfaceLight: colors.surfaceLight,
  border: colors.border,
  text: colors.text,
  muted: colors.textMuted,
  gold: colors.accent,
  accentDark: colors.accentDark,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Screen rhythm tokens — see `constants/layout.ts` for Tailwind class helpers. */
export { layout, layoutClasses } from '@/constants/layout';

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  logo: 36,
  title: 24,
  subtitle: 18,
  body: 16,
  caption: 14,
  small: 12,
} as const;
