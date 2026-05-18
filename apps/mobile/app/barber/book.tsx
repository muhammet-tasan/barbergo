import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppInput } from '@/components/AppInput';
import { ScreenHeader } from '@/components/ScreenHeader';
import { calculateBookingTotal, formatChf } from '@/constants/pricing';
import { defaultProvider, services } from '@/data/mockData';
import { createBooking, getServiceById } from '@/services/bookings';
import {
  hasFormErrors,
  validateBookingForm,
  type BookingFormErrors,
} from '@/utils/validation';

export default function BookingFormScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const service = useMemo(
    () => (serviceId ? getServiceById(serviceId, services) : undefined),
    [serviceId]
  );

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const totals = service ? calculateBookingTotal(service.priceChf) : null;

  if (!service) {
    return (
      <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
        <ScreenHeader title="Termin buchen" />
        <View className="flex-1 px-6 justify-center">
          <Text className="text-white text-center mb-6">Service nicht gefunden. Bitte wähle einen Service aus.</Text>
          <AppButton label="Service auswählen" onPress={() => router.replace('/barber/services')} />
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = () => {
    const formErrors = validateBookingForm({
      customerName,
      phone,
      address,
      appointmentDate,
      appointmentTime,
      note,
    });
    setErrors(formErrors);
    if (hasFormErrors(formErrors)) return;

    setSubmitting(true);
    try {
      const booking = createBooking({
        providerId: defaultProvider.id,
        service,
        customerName,
        phone,
        address,
        appointmentDate,
        appointmentTime,
        note,
      });
      router.replace({
        pathname: '/barber/confirm',
        params: { bookingId: booking.id },
      });
    } catch {
      Alert.alert('Fehler', 'Die Buchung konnte nicht gespeichert werden. Bitte versuche es erneut.');
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
        <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
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

          <AppInput
            label="Dein Name"
            value={customerName}
            onChangeText={setCustomerName}
            error={errors.customerName}
            autoCapitalize="words"
            placeholder="Max Mustermann"
          />
          <AppInput
            label="Telefon (WhatsApp)"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            keyboardType="phone-pad"
            placeholder="+41 79 123 45 67"
          />
          <AppInput
            label="Adresse"
            value={address}
            onChangeText={setAddress}
            error={errors.address}
            placeholder="Musterstrasse 1, 4051 Basel"
            multiline
          />
          <AppInput
            label="Datum"
            value={appointmentDate}
            onChangeText={setAppointmentDate}
            error={errors.appointmentDate}
            placeholder="20.05.2026"
            keyboardType="numbers-and-punctuation"
          />
          <AppInput
            label="Uhrzeit"
            value={appointmentTime}
            onChangeText={setAppointmentTime}
            error={errors.appointmentTime}
            placeholder="14:30"
            keyboardType="numbers-and-punctuation"
          />
          <AppInput
            label="Notiz (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Bitte klingeln, usw."
            multiline
          />

          <View className="mb-8">
            <AppButton
              label="Buchung bestätigen"
              onPress={handleSubmit}
              loading={submitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
