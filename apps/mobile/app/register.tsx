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
import { AppButton } from '@/components/AppButton';
import { AppForm } from '@/components/AppForm';
import { AppInput } from '@/components/AppInput';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AUTOFILL } from '@/constants/form-autofill';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import {
  EMAIL_ALREADY_REGISTERED,
  getCurrentSession,
  isRegistrationRoleMismatch,
  MIN_PASSWORD_LENGTH,
  resendSignupConfirmation,
  type RegistrationRole,
} from '@/services/auth';
import { getPostLoginPath } from '@/services/auth-roles';
import { notifyNewBarberRegistration } from '@/services/push-notifications';
import { ensureUserProfileRow } from '@/services/profiles';
import { PHONE_FORMAT_HINT, validatePhoneNumber } from '@/utils/validation';

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
  const { signUp, signOut, loading: authLoading, isAuthenticated, postLoginPath, refreshProfile } =
    useAuth();
  const [registrationRole, setRegistrationRole] = useState<RegistrationRole>('customer');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [addressError, setAddressError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [awaitingEmailConfirmation, setAwaitingEmailConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isBarber = registrationRole === 'barber';

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center" edges={['top']}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (isAuthenticated && !submitting) {
    return <Redirect href={postLoginPath as Href} />;
  }

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setFormError('Bitte gib deine E-Mail-Adresse ein.');
      return;
    }

    setResendLoading(true);
    setFormError(undefined);
    try {
      const result = await resendSignupConfirmation(email);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      setSuccessMessage(
        'Bestätigungs-E-Mail wurde erneut gesendet. Bitte prüfe dein Postfach (auch Spam).'
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async () => {
    setNameError(undefined);
    setPhoneError(undefined);
    setAddressError(undefined);
    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(undefined);
    setSuccessMessage(undefined);
    setAwaitingEmailConfirmation(false);

    let hasError = false;
    if (!displayName.trim()) {
      setNameError('Name ist erforderlich');
      hasError = true;
    }
    if (isBarber) {
      const phoneValidation = validatePhoneNumber(phone);
      if (phoneValidation) {
        setPhoneError(phoneValidation);
        hasError = true;
      }
    }
    if (!isBarber && !address.trim()) {
      setAddressError('Adresse ist erforderlich');
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
        address: address.trim() || undefined,
        registrationRole,
      });
      if (result.error) {
        setFormError(result.error);
        return;
      }

      if (result.needsEmailConfirmation) {
        setAwaitingEmailConfirmation(true);
        setSuccessMessage(
          'Konto erstellt. Bitte bestätige die E-Mail in deinem Postfach (auch Spam) — den Link am besten auf dem Handy mit installierter BarberGo-App öffnen. Danach kannst du dich anmelden.'
        );
        return;
      }

      const session = await getCurrentSession();
      if (!session) {
        setFormError(
          'Registrierung konnte nicht abgeschlossen werden. Bitte versuche es erneut oder melde dich an, falls dein Konto bereits existiert.'
        );
        return;
      }

      if (isRegistrationRoleMismatch(session, registrationRole)) {
        await signOut();
        setFormError(EMAIL_ALREADY_REGISTERED);
        return;
      }

      const profile = await ensureUserProfileRow({
        userId: session.user.id,
        registrationRole,
        displayName: displayName.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      if (!profile) {
        setFormError('Konto erstellt, aber dein Profil konnte nicht geladen werden. Bitte versuche es erneut.');
        return;
      }

      await refreshProfile();

      if (isBarber) {
        await notifyNewBarberRegistration({
          barberId: session.user.id,
          displayName: displayName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        });
      }

      setSuccessMessage('Konto erfolgreich erstellt. Du wirst weitergeleitet …');

      const target = getPostLoginPath(profile, session.user.email, {
        registrationRole,
        metadata: session.user.user_metadata,
      });
      setTimeout(() => {
        router.replace(target as Href);
      }, 600);
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
          <Text className="text-brand-muted mb-4">Wähle dein Konto — Kunde oder Barber.</Text>

          <RoleOption
            label="Kunde"
            description="Termine buchen und verwalten"
            selected={registrationRole === 'customer'}
            onPress={() => setRegistrationRole('customer')}
          />
          <RoleOption
            label="Barber"
            description="Nach Freigabe Zugang zum Barber-Bereich"
            selected={isBarber}
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
              label={isBarber ? 'Telefon' : 'Telefon (optional)'}
              value={phone}
              onChangeText={setPhone}
              error={phoneError}
              autofill={AUTOFILL.tel}
              keyboardType="phone-pad"
              placeholder={PHONE_FORMAT_HINT}
              returnKeyType="next"
            />
            {!isBarber ? (
              <AppInput
                label="Adresse"
                value={address}
                onChangeText={setAddress}
                error={addressError}
                autofill={AUTOFILL.streetAddress}
                placeholder="Musterstrasse 1, 4051 Basel"
                multiline
                returnKeyType="next"
              />
            ) : null}
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

            {awaitingEmailConfirmation ? (
              <AppButton
                label="Bestätigungs-E-Mail erneut senden"
                variant="secondary"
                onPress={handleResendConfirmation}
                loading={resendLoading}
              />
            ) : (
              <AppButton label="Konto erstellen" onPress={handleSubmit} loading={submitting} submit />
            )}
          </AppForm>

          <Pressable onPress={() => router.push('/login')} className="mt-6 items-center py-2">
            <Text className="text-brand-gold text-sm">Bereits ein Konto? Anmelden</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
