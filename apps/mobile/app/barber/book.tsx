import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppForm } from '@/components/AppForm';
import { AppInput } from '@/components/AppInput';
import { ScreenHeader } from '@/components/ScreenHeader';
import { calculateBookingTotal, formatChf } from '@/constants/pricing';
import { colors } from '@/constants/theme';
import { AUTOFILL } from '@/constants/form-autofill';
import { useProvider } from '@/hooks/use-provider';
import { useServices } from '@/hooks/use-services';
import { useAuth } from '@/contexts/auth-context';
import { createBooking, getServiceById } from '@/services/bookings';
import { showUserMessage } from '@/utils/show-message';
import { resolveCatalogDisplayError } from '@/utils/catalog-error-display';
import { isMockCatalogId, isValidUuid } from '@/utils/uuid';
import {
  hasFormErrors,
  validateBookingForm,
  type BookingFormErrors,
} from '@/utils/validation';

export default function BookingFormScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const { isCustomer, session } = useAuth();
  const { provider, loading: providerLoading, usingFallback, error: providerError } = useProvider();
  const providerIdForServices =
    provider && isValidUuid(provider.id) ? provider.id : undefined;
  const { services, loading: servicesLoading, error: servicesError } =
    useServices(providerIdForServices);
  const catalogError = resolveCatalogDisplayError(provider, providerError, servicesError);
  const catalogBlocked = usingFallback || !!catalogError;
  const scrollRef = useRef<ScrollView>(null);

  const service = useMemo(
    () => (serviceId ? getServiceById(serviceId, services) : undefined),
    [serviceId, services]
  );

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitBanner, setSubmitBanner] = useState<string | null>(null);

  const totals = service ? calculateBookingTotal(service.priceChf) : null;
  const loading = providerLoading || servicesLoading;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark items-center justify-center" edges={['top']}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (!service || !provider) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Termin buchen" />
        <View className="flex-1 px-6 justify-center">
          <Text className="text-white text-center mb-6">
            Service nicht gefunden. Bitte wähle einen Service aus.
          </Text>
          <AppButton label="Service auswählen" onPress={() => router.replace('/barber/services')} />
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    setSubmitBanner(null);

    if (catalogBlocked) {
      const msg =
        catalogError ||
        'Barber und Services müssen aus Supabase geladen werden, bevor du buchen kannst.';
      setSubmitBanner(msg);
      showUserMessage('Supabase nicht bereit', msg);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    if (!isValidUuid(provider.id) || !isValidUuid(service.id) || isMockCatalogId(provider.id) || isMockCatalogId(service.id)) {
      const msg = catalogError || 'Ungültige Barber-/Service-IDs — bitte Supabase-Daten laden.';
      setSubmitBanner(msg);
      showUserMessage('Ungültige IDs', msg);
      return;
    }

    const formErrors = validateBookingForm({
      customerName,
      phone,
      address,
      appointmentDate,
      appointmentTime,
      note,
    });
    setErrors(formErrors);
    if (hasFormErrors(formErrors)) {
      const msg = 'Bitte markierte Felder prüfen (Datum: TT.MM.JJJJ, Uhrzeit: HH:MM).';
      setSubmitBanner(msg);
      showUserMessage('Formular unvollständig', msg);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setSubmitting(true);
    try {
      const result = await createBooking({
        providerId: provider.id,
        service,
        customerName,
        phone,
        address,
        appointmentDate,
        appointmentTime,
        note,
        customerId: isCustomer ? session?.user.id : undefined,
      });

      if (!result.booking) {
        const msg =
          result.error ?? 'Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.';
        setSubmitBanner(msg);
        showUserMessage('Fehler', msg);
        return;
      }

      if (result.source === 'mock') {
        const msg =
          result.error ??
          'Die Buchung wurde nur temporär im Demo-Modus angezeigt und geht nach einem Neustart verloren.';
        setSubmitBanner(msg);
        showUserMessage('Nicht in Supabase gespeichert', msg);
        return;
      }

      router.replace({
        pathname: '/barber/confirm',
        params: { bookingId: result.booking.id, serviceName: service.name },
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.';
      setSubmitBanner(msg);
      showUserMessage('Fehler', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Termin buchen" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-4"
          keyboardShouldPersistTaps="always"
        >
          {catalogBlocked ? (
            <View className="mb-4 rounded-xl border border-amber-500/60 bg-amber-500/10 px-4 py-3">
              <Text className="text-amber-200 font-semibold">Buchung blockiert</Text>
              <Text className="text-amber-100/80 text-sm mt-1">
                {catalogError ||
                  'Provider/Services kommen nicht aus Supabase. Prüfe .env, Migration 0001/0002 und seed.sql.'}
              </Text>
            </View>
          ) : null}

          {submitBanner ? (
            <View className="mb-4 rounded-xl border border-red-500/60 bg-red-500/10 px-4 py-3">
              <Text className="text-red-200 font-semibold">Hinweis</Text>
              <Text className="text-red-100/90 text-sm mt-1">{submitBanner}</Text>
            </View>
          ) : null}

          <AppCard className="mb-4">
            <Text className="text-white font-semibold text-lg">{service.name}</Text>
            <Text className="text-slate-400 mt-1">{service.durationMinutes} Minuten</Text>
            {totals ? (
              <Text className="text-brand-gold font-bold mt-2 text-lg">
                {formatChf(totals.totalChf)} gesamt
                <Text className="text-slate-400 font-normal text-sm">
                  {' '}
                  (inkl. {formatChf(totals.serviceFeeChf)} Gebühr)
                </Text>
              </Text>
            ) : null}
          </AppCard>

          <AppForm onSubmit={handleSubmit}>
            <AppInput
              label="Dein Name"
              value={customerName}
              onChangeText={setCustomerName}
              error={errors.customerName}
              autofill={AUTOFILL.name}
              autoCapitalize="words"
              placeholder="Max Mustermann"
              returnKeyType="next"
            />
            <AppInput
              label="Telefon (WhatsApp)"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
              autofill={AUTOFILL.tel}
              keyboardType="phone-pad"
              placeholder="+41 79 123 45 67"
              returnKeyType="next"
            />
            <AppInput
              label="Adresse"
              value={address}
              onChangeText={setAddress}
              error={errors.address}
              autofill={AUTOFILL.streetAddress}
              placeholder="Musterstrasse 1, 4051 Basel"
              multiline
              returnKeyType="next"
            />
            <AppInput
              label="Datum"
              value={appointmentDate}
              onChangeText={setAppointmentDate}
              error={errors.appointmentDate}
              autofill={AUTOFILL.off}
              placeholder="20.05.2026"
              keyboardType="numbers-and-punctuation"
              returnKeyType="next"
            />
            <AppInput
              label="Uhrzeit"
              value={appointmentTime}
              onChangeText={setAppointmentTime}
              error={errors.appointmentTime}
              autofill={AUTOFILL.off}
              placeholder="14:30"
              keyboardType="numbers-and-punctuation"
              returnKeyType="next"
            />
            <AppInput
              label="Notiz (optional)"
              value={note}
              onChangeText={setNote}
              autofill={AUTOFILL.off}
              placeholder="Bitte klingeln, usw."
              multiline
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />

            <View className="mb-8">
              <AppButton
                label="Buchung bestätigen"
                onPress={handleSubmit}
                loading={submitting}
                disabled={catalogBlocked}
                submit
              />
            </View>
          </AppForm>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
