import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { BookingFormSummaryCard } from '@/components/BookingSummaryCard';
import { AppForm } from '@/components/AppForm';
import { AppInput } from '@/components/AppInput';
import { SectionHeader } from '@/components/SectionHeader';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { AUTOFILL } from '@/constants/form-autofill';
import { useProvider } from '@/hooks/use-provider';
import { useServices } from '@/hooks/use-services';
import { useAuth } from '@/contexts/auth-context';
import { createBooking, getServiceById } from '@/services/bookings';
import { resolveCatalogDisplayError } from '@/utils/catalog-error-display';
import { isMockCatalogId, isValidUuid } from '@/utils/uuid';
import {
  hasFormErrors,
  validateBookingForm,
  type BookingFormErrors,
} from '@/utils/validation';

export default function BookingFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { serviceId, providerId } = useLocalSearchParams<{
    serviceId: string;
    providerId?: string;
  }>();
  const { isCustomer, session } = useAuth();
  const { provider, loading: providerLoading, error: providerError } = useProvider(providerId);
  const providerIdForServices =
    provider && isValidUuid(provider.id) ? provider.id : undefined;
  const { services, loading: servicesLoading, error: servicesError } =
    useServices(providerIdForServices);
  const catalogError = resolveCatalogDisplayError(provider, providerError, servicesError);
  const catalogBlocked =
    !!catalogError ||
    (provider ? isMockCatalogId(provider.id) : false) ||
    (serviceId ? isMockCatalogId(serviceId) : false);
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

  const formFields = {
    customerName,
    phone,
    address,
    appointmentDate,
    appointmentTime,
    note,
  };
  const loading = providerLoading || servicesLoading;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Termin buchen" />
        <View className="flex-1 items-center justify-center bg-brand-dark">
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!service || !provider) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Termin buchen" />
        <View className="flex-1 px-6 justify-center bg-brand-dark">
          <Text className="text-brand-text text-center mb-6">
            Service nicht gefunden. Bitte wähle einen Service aus.
          </Text>
          <AppButton
            label="Service auswählen"
            onPress={() =>
              router.push({
                pathname: '/barber/services',
                params: providerId ? { providerId } : undefined,
              })
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitBanner(null);

    if (catalogBlocked) {
      setSubmitBanner('Buchung derzeit nicht möglich. Bitte versuche es später erneut.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    const formErrors = validateBookingForm(formFields);
    setErrors(formErrors);
    if (hasFormErrors(formErrors)) {
      setSubmitBanner('Bitte prüfe die markierten Felder.');
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
        setSubmitBanner(
          result.error ?? 'Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.'
        );
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        return;
      }

      router.replace({
        pathname: '/barber/confirm',
        params: { bookingId: result.booking.id, serviceName: service.name },
      });
    } catch {
      setSubmitBanner('Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } finally {
      setSubmitting(false);
    }
  };

  const bottomPad = Math.max(insets.bottom, 16) + 96;

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Termin buchen" />
      <KeyboardAvoidingView
        className="flex-1 bg-brand-dark"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 bg-brand-dark"
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: bottomPad }}
        >
          {catalogBlocked ? (
            <View className="mb-4 rounded-xl border border-warning/60 bg-warning/10 px-4 py-3">
              <Text className="text-warning font-semibold">Buchung nicht verfügbar</Text>
              <Text className="text-warning/80 text-sm mt-1">
                Barber und Services konnten nicht geladen werden.
              </Text>
            </View>
          ) : null}

          {submitBanner ? (
            <View className="mb-4 rounded-xl border border-error/60 bg-error/10 px-4 py-3">
              <Text className="text-error text-sm">{submitBanner}</Text>
            </View>
          ) : null}

          <SectionHeader title="Deine Auswahl" />
          <BookingFormSummaryCard
            className="mb-6"
            barberName={provider.name}
            serviceName={service.name}
            durationMinutes={service.durationMinutes}
            priceChf={service.priceChf}
          />

          <SectionHeader title="Deine Daten" />
          <AppCard className="mb-4 px-1">
            <AppForm onSubmit={handleSubmit}>
              <AppInput
                label="Dein Name"
                value={customerName}
                onChangeText={(v) => {
                  setCustomerName(v);
                  if (errors.customerName) setErrors((e) => ({ ...e, customerName: undefined }));
                }}
                error={errors.customerName}
                autofill={AUTOFILL.name}
                autoCapitalize="words"
                placeholder="Max Mustermann"
                returnKeyType="next"
              />
              <AppInput
                label="Telefon (WhatsApp)"
                value={phone}
                onChangeText={(v) => {
                  setPhone(v);
                  if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }));
                }}
                error={errors.phone}
                autofill={AUTOFILL.tel}
                keyboardType="phone-pad"
                placeholder="+41 79 123 45 67"
                returnKeyType="next"
              />
              <AppInput
                label="Adresse"
                value={address}
                onChangeText={(v) => {
                  setAddress(v);
                  if (errors.address) setErrors((e) => ({ ...e, address: undefined }));
                }}
                error={errors.address}
                autofill={AUTOFILL.streetAddress}
                placeholder="Musterstrasse 1, 4051 Basel"
                multiline
                returnKeyType="next"
              />
              <AppInput
                label="Datum"
                value={appointmentDate}
                onChangeText={(v) => {
                  setAppointmentDate(v);
                  if (errors.appointmentDate) setErrors((e) => ({ ...e, appointmentDate: undefined }));
                }}
                error={errors.appointmentDate}
                autofill={AUTOFILL.off}
                placeholder="20.05.2026"
                keyboardType="numbers-and-punctuation"
                returnKeyType="next"
              />
              <AppInput
                label="Uhrzeit"
                value={appointmentTime}
                onChangeText={(v) => {
                  setAppointmentTime(v);
                  if (errors.appointmentTime) setErrors((e) => ({ ...e, appointmentTime: undefined }));
                }}
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
            </AppForm>
          </AppCard>
        </ScrollView>

        <View
          className="absolute left-0 right-0 border-t border-brand-border bg-brand-dark px-4 pt-3"
          style={{ bottom: 0, paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <AppButton
            label="Buchung bestätigen"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting || catalogBlocked}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
