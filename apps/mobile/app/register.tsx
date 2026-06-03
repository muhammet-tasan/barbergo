import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppForm } from '@/components/AppForm';
import { AppInput } from '@/components/AppInput';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { AUTOFILL } from '@/constants/form-autofill';
import { useAuth } from '@/contexts/auth-context';
import { getCurrentSession } from '@/services/auth';
import { getPostLoginPath } from '@/services/auth-roles';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, loading: authLoading, isAuthenticated, postLoginPath } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
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
    setNameError(undefined);
    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(undefined);
    setSuccessMessage(undefined);

    let hasError = false;
    if (!displayName.trim()) {
      setNameError('Name ist erforderlich');
      hasError = true;
    }
    if (!email.trim()) {
      setEmailError('E-Mail ist erforderlich');
      hasError = true;
    }
    if (password.length < 6) {
      setPasswordError('Mindestens 6 Zeichen');
      hasError = true;
    }
    if (hasError) return;

    setSubmitting(true);
    try {
      const result = await signUp({ email, password, displayName: displayName.trim() });
      if (result.error) {
        setFormError(result.error);
        return;
      }

      if (result.needsEmailConfirmation) {
        setSuccessMessage(
          'Konto angelegt. Bitte bestätige deine E-Mail (Link von Supabase) und melde dich danach an. ' +
            'Tipp für Tests: Supabase → Authentication → Providers → Email → „Confirm email“ deaktivieren.'
        );
        return;
      }

      const session = await getCurrentSession();
      if (session) {
        router.replace(getPostLoginPath(session));
        return;
      }

      setFormError('Registrierung ohne Session — bitte erneut anmelden.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Registrieren" showAuthAction={false} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-4 pt-4"
          contentContainerClassName="pb-8"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-brand-muted mb-6">
            Erstelle ein Kundenkonto für „Meine Termine“ und Stornierungen.
          </Text>

          <AppForm onSubmit={handleSubmit}>
            <AppInput
              label="Dein Name"
              value={displayName}
              onChangeText={setDisplayName}
              error={nameError}
              autofill={AUTOFILL.name}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <AppInput
              label="E-Mail"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              autofill={AUTOFILL.email}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
            <AppInput
              label="Passwort"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              secureTextEntry
              autofill={AUTOFILL.newPassword}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />

            {formError ? (
              <View className="mb-4 rounded-lg border border-error/50 bg-error/10 px-3 py-2">
                <Text className="text-error text-sm">{formError}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View className="mb-4 rounded-lg border border-success/50 bg-success/10 px-3 py-2">
                <Text className="text-success text-sm">{successMessage}</Text>
              </View>
            ) : null}

            <AppButton label="Konto erstellen" onPress={handleSubmit} loading={submitting} submit />
          </AppForm>

          <Pressable onPress={() => router.push('/login')} className="mt-6 items-center py-2">
            <Text className="text-brand-gold text-sm">Bereits ein Konto? Anmelden</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
