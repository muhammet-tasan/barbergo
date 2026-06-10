import {
  ActivityIndicator,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { BookingFormSummaryCard } from '@/components/BookingSummaryCard';
import { AppForm } from '@/components/AppForm';
import { AppInput } from '@/components/AppInput';
import { SectionHeader } from '@/components/SectionHeader';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SlotPicker } from '@/components/SlotPicker';
import { colors } from '@/constants/theme';
import { AUTOFILL } from '@/constants/form-autofill';
import { useProvider } from '@/hooks/use-provider';
import { useServices } from '@/hooks/use-services';
import { useAuth } from '@/contexts/auth-context';
import { createSlotBooking, getServiceById } from '@/services/bookings';
import {
  buildSelectableDates,
  fetchAvailableSlots,
  type TimeSlot,
} from '@/services/slots';
import { resolveCatalogDisplayError } from '@/utils/catalog-error-display';
import { isMockCatalogId, isValidUuid } from '@/utils/uuid';
import {
  hasFormErrors,
  PHONE_FORMAT_HINT,
  validateSlotBookingForm,
  type SlotBookingFormErrors,
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
  const sectionOffsets = useRef<Record<string, number>>({});

  const service = useMemo(
    () => (serviceId ? getServiceById(serviceId, services) : undefined),
    [serviceId, services]
  );

  const selectableDates = useMemo(() => buildSelectableDates(14), []);
  const [selectedDate, setSelectedDate] = useState<string | null>(selectableDates[0] ?? null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<SlotBookingFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const rememberSectionOffset = (key: string) => (event: LayoutChangeEvent) => {
    sectionOffsets.current[key] = event.nativeEvent.layout.y;
  };

  const scrollToSection = (key: string) => {
    const y = sectionOffsets.current[key];
    if (y == null) return;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true });
  };

  const scrollToFirstFormError = (formErrors: SlotBookingFormErrors) => {
    if (formErrors.selectedSlotStartAt) {
      scrollToSection('slot');
      return;
    }
    if (formErrors.customerName || formErrors.phone || formErrors.address) {
      scrollToSection('data');
    }
  };

  const loadSlots = useCallback(async () => {
    if (!service || !provider || !selectedDate) return;
    setSlotsLoading(true);
    setSlotsError(undefined);
    const result = await fetchAvailableSlots(provider.id, service, selectedDate);
    setSlots(result.slots);
    setSlotsError(result.error);
    setSelectedSlot(null);
    setSlotsLoading(false);
  }, [provider, service, selectedDate]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

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
    setBookingError(null);

    if (catalogBlocked) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    const formErrors = validateSlotBookingForm({
      customerName,
      phone,
      address,
      note,
      selectedSlotStartAt: selectedSlot?.startAt,
    });
    if (!selectedSlot && !formErrors.selectedSlotStartAt) {
      formErrors.selectedSlotStartAt = 'Bitte wähle einen Termin.';
    }
    setErrors(formErrors);
    if (hasFormErrors(formErrors)) {
      scrollToFirstFormError(formErrors);
      return;
    }

    setSubmitting(true);
    try {
      const result = await createSlotBooking({
        providerId: provider.id,
        service,
        startAt: selectedSlot!.startAt,
        customerName,
        phone,
        address,
        note,
        customerId: isCustomer ? session?.user.id : undefined,
      });

      if (!result.booking) {
        setBookingError(
          result.error ?? 'Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.'
        );
        if (result.error?.includes('nicht mehr verfügbar')) {
          await loadSlots();
        }
        return;
      }

      router.replace({
        pathname: '/barber/confirm',
        params: { bookingId: result.booking.id, serviceName: service.name },
      });
    } catch {
      setBookingError('Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.');
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

          <SectionHeader title="Deine Auswahl" />
          <BookingFormSummaryCard
            barberName={provider.name}
            serviceName={service.name}
            durationMinutes={service.durationMinutes}
            priceChf={service.priceChf}
          />

          <SectionHeader title="Termin wählen" followsCard />
          <AppCard className="mb-4" onLayout={rememberSectionOffset('slot')}>
            <SlotPicker
              dates={selectableDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              loading={slotsLoading}
              error={slotsError}
            />
            {errors.selectedSlotStartAt ? (
              <Text className="text-error text-sm mt-2">{errors.selectedSlotStartAt}</Text>
            ) : null}
          </AppCard>

          <SectionHeader title="Deine Daten" />
          <AppCard className="mb-4" onLayout={rememberSectionOffset('data')}>
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
                label="Telefon"
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
                label="Notiz (optional)"
                value={note}
                onChangeText={setNote}
                autofill={AUTOFILL.off}
                placeholder="Besondere Wünsche, Zugangshinweise …"
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
          {bookingError ? (
            <Text className="text-error text-sm mb-2 text-center">{bookingError}</Text>
          ) : null}
          <AppButton
            label="Termin bestätigen"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting || catalogBlocked || !selectedSlot}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
