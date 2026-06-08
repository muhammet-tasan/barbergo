import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, Redirect, useRouter } from 'expo-router';
import { useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppForm } from '@/components/AppForm';
import { AppInput } from '@/components/AppInput';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { AUTOFILL } from '@/constants/form-autofill';
import { useAuth } from '@/contexts/auth-context';
import { getPostLoginPath } from '@/services/auth-roles';
import { getCurrentSession } from '@/services/auth';
import { fetchUserProfile } from '@/services/profiles';

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
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <View className="flex-1 items-center justify-center bg-brand-dark">
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={postLoginPath as Href} />;
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
      if (session) {
        const profile = await fetchUserProfile(session.user.id);
        router.replace(getPostLoginPath(profile) as Href);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Anmelden" showAuthAction={false} />
      <KeyboardAvoidingView
        className="flex-1 bg-brand-dark"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 bg-brand-dark"
          contentContainerClassName="px-4 pt-6 pb-8"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-xl font-bold text-brand-text mb-2">Willkommen zurück</Text>
          <Text className="text-brand-muted mb-6 leading-5">
            Melde dich an, um deine Termine zu verwalten.
          </Text>

          <AppForm onSubmit={handleSubmit}>
            <AppInput
              label="E-Mail"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setAuthError(undefined);
              }}
              error={emailError}
              autofill={AUTOFILL.loginEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
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
              autofill={AUTOFILL.currentPassword}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />

            {authError ? (
              <View className="mb-4 rounded-lg border border-error/50 bg-error/10 px-3 py-2">
                <Text className="text-error text-sm">{authError}</Text>
              </View>
            ) : null}

            <AppButton label="Anmelden" onPress={handleSubmit} loading={submitting} submit />
          </AppForm>

          <Pressable onPress={() => router.push('/register')} className="mt-4 items-center py-2">
            <Text className="text-brand-gold text-sm">Noch kein Konto? Registrieren</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
