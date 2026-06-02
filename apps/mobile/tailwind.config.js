/** @type {import('tailwindcss').Config} */
/** Keep hex values in sync with `constants/theme.ts` — see `docs/branding.md`. */
const brandPalette = {
  gold: '#D4A574',
  accentDark: '#B8864E',
  dark: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  border: '#334155',
  text: '#F8FAFC',
  muted: '#94A3B8',
};

module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: brandPalette,
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
    },
  },
  plugins: [],
};
