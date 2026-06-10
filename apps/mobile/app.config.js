/** Loads .env into Expo config so runtime can read via expo-constants extra (web + native). */
const appJson = require('./app.json');

module.exports = () => ({
  expo: {
    ...appJson.expo,
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_WHATSAPP_PHONE: process.env.EXPO_PUBLIC_WHATSAPP_PHONE,
      EXPO_PUBLIC_BARBER_WHATSAPP: process.env.EXPO_PUBLIC_BARBER_WHATSAPP,
      EXPO_PUBLIC_AUTH_REDIRECT_URL: process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL,
      EXPO_PUBLIC_AUTH_EMAIL_REDIRECT_URL: process.env.EXPO_PUBLIC_AUTH_EMAIL_REDIRECT_URL,
    },
  },
});
