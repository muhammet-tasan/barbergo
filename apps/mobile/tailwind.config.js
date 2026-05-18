/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#D4A574',
          dark: '#0F172A',
          surface: '#1E293B',
        },
      },
    },
  },
  plugins: [],
};
