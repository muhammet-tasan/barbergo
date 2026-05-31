import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { getPostLoginPath } from '@/services/auth-roles';
import { getCurrentSession } from '@/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading: authLoading, isAuthenticated, postLoginPath } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [authError, setAuthError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center" edges={['top']}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={postLoginPath} />;
  }

  const handleSubmit = async () => {
    setEmailError(undefined);
    setPasswordError(undefined);
    setAuthError(undefined);

    let hasError = false;
    if (!email.trim()) {
      setEmailError('E-Mail ist erforderlich');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Passwort ist erforderlich');
      hasError = true;
    }
    if (hasError) return;

    setSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (result.error) {
        setAuthError(result.error);
        return;
      }

      const session = await getCurrentSession();
      router.replace(getPostLoginPath(session));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Anmelden" onBack={() => router.replace('/')} showAuthAction={false} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-4 pt-4"
          contentContainerClassName="pb-8"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-slate-400 mb-6">
            Melde dich als Kunde oder Barber an. Accounts werden in Supabase angelegt — Rolle
            über Benutzer-Metadaten (`customer` oder `barber`).
          </Text>

          <AppInput
            label="E-Mail"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setAuthError(undefined);
            }}
            error={emailError}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <AppInput
            label="Passwort"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setAuthError(undefined);
            }}
            error={passwordError}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
          />

          {authError ? (
            <View className="mb-4 rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-2">
              <Text className="text-red-300 text-sm">{authError}</Text>
            </View>
          ) : null}

          <AppButton label="Anmelden" onPress={handleSubmit} loading={submitting} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
