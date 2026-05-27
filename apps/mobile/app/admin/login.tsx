import { useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppInput } from '@/components/AppInput';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { signInWithMagicLink } from '@/services/auth';
import { showUserMessage } from '@/utils/show-message';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailTrimmed = useMemo(() => email.trim(), [email]);

  if (sessionLoading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center" edges={['top']}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (session) {
    router.replace('/admin');
    return null;
  }

  const handleSendLink = async () => {
    if (!emailTrimmed.includes('@')) {
      showUserMessage('E-Mail', 'Bitte eine gültige E-Mail-Adresse eingeben.');
      return;
    }

    setSubmitting(true);
    try {
      await signInWithMagicLink(emailTrimmed);
      showUserMessage(
        'Login-Link gesendet',
        'Bitte prüfe deine E-Mails und öffne den Link, um dich anzumelden.'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login-Link konnte nicht gesendet werden.';
      showUserMessage('Fehler', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Admin Login" onBack={() => router.replace('/')} />
      <View className="flex-1 px-4 pt-4">
        <AppCard className="mb-4">
          <Text className="text-slate-300 mb-3">
            Für den Admin-Bereich ist ein Login nötig. Wir senden dir einen Magic-Link per E-Mail.
          </Text>
          <AppInput
            label="E-Mail"
            value={email}
            onChangeText={setEmail}
            placeholder="barber@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <AppButton label="Link senden" onPress={handleSendLink} loading={submitting} />
        </AppCard>
        <Text className="text-slate-500 text-sm px-1">
          Hinweis: Für Expo Go / Web ist das ausreichend. In einem Production-Build wird der Link per
          Deep Link zurück in die App führen.
        </Text>
      </View>
    </SafeAreaView>
  );
}

