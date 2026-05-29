import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/contexts/auth-context';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [authError, setAuthError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

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
      router.replace('/admin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Barber Login" onBack={() => router.replace('/')} />
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
            Melde dich an, um Buchungen zu verwalten. Der Barber-Account wird in Supabase angelegt.
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
