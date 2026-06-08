import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import * as Linking from 'expo-linking';

import { AppButton } from '@/components/AppButton';
import { AppForm } from '@/components/AppForm';
import { AppInput } from '@/components/AppInput';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AUTOFILL } from '@/constants/form-autofill';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { getCurrentSession, MIN_PASSWORD_LENGTH, type RegistrationRole } from '@/services/auth';
import { getPostLoginPath } from '@/services/auth-roles';
import { fetchUserProfile } from '@/services/profiles';

function RoleOption({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 rounded-xl border px-4 py-3 ${
        selected ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-border bg-brand-surface'
      }`}
    >
      <Text className={`font-semibold ${selected ? 'text-brand-gold' : 'text-brand-text'}`}>
        {label}
      </Text>
      <Text className="text-brand-muted text-sm mt-1">{description}</Text>
    </Pressable>
  );
}

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, loading: authLoading, isAuthenticated, postLoginPath } = useAuth();
  const [registrationRole, setRegistrationRole] = useState<RegistrationRole>('customer');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
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
    return <Redirect href={postLoginPath as Href} />;
  }

  const notifyAdminBarberSignup = async (name: string, userEmail: string) => {
    const message = encodeURIComponent(
      `Neue Barber-Registrierung bei BarberGo:\nName: ${name}\nE-Mail: ${userEmail}\nBitte im Admin-Bereich freigeben.`
    );
    const url = `https://wa.me/?text=${message}`;
    try {
      await Linking.openURL(url);
    } catch {
      // optional — registration still succeeds
    }
  };

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
    if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Mindestens ${MIN_PASSWORD_LENGTH} Zeichen`);
      hasError = true;
    }
    if (hasError) return;

    setSubmitting(true);
    try {
      const result = await signUp({
        email,
        password,
        displayName: displayName.trim(),
        phone: phone.trim() || undefined,
        registrationRole,
      });
      if (result.error) {
        setFormError(result.error);
        return;
      }

      if (result.needsEmailConfirmation) {
        setSuccessMessage(
          registrationRole === 'barber'
            ? 'Konto angelegt. Bitte bestätige deine E-Mail. Dein Barber-Profil wartet danach auf Admin-Freigabe.'
            : 'Konto angelegt. Bitte bestätige deine E-Mail und melde dich danach an.'
        );
        return;
      }

      const session = await getCurrentSession();
      if (session) {
        const profile = await fetchUserProfile(session.user.id);
        if (registrationRole === 'barber') {
          await notifyAdminBarberSignup(displayName.trim(), email.trim());
        }
        router.replace(getPostLoginPath(profile) as Href);
        return;
      }

      setFormError('Bitte melde dich mit deinen Zugangsdaten an.');
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
          <Text className="text-brand-muted mb-4">
            Wähle dein Konto — Kunde oder Barber. Admin-Konten werden nicht öffentlich
            registriert.
          </Text>

          <RoleOption
            label="Kunde"
            description="Termine buchen und verwalten"
            selected={registrationRole === 'customer'}
            onPress={() => setRegistrationRole('customer')}
          />
          <RoleOption
            label="Barber"
            description="Nach Admin-Freigabe Zugang zum Barber-Bereich"
            selected={registrationRole === 'barber'}
            onPress={() => setRegistrationRole('barber')}
          />

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
              label="Telefon (optional)"
              value={phone}
              onChangeText={setPhone}
              autofill={AUTOFILL.tel}
              keyboardType="phone-pad"
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
