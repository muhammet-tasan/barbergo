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
        <ScreenHeader title="Book appointment" />
        <View className="flex-1 px-6 justify-center">
          <Text className="text-white text-center mb-6">Service not found. Go back and pick a service.</Text>
          <AppButton label="Select service" onPress={() => router.replace('/barber/services')} />
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
      Alert.alert('Error', 'Could not save booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Book appointment" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
          <AppCard className="mb-4">
            <Text className="text-white font-semibold text-lg">{service.name}</Text>
            <Text className="text-slate-400 mt-1">{service.durationMinutes} minutes</Text>
            {totals ? (
              <Text className="text-brand-gold font-bold mt-2 text-lg">
                {formatChf(totals.totalChf)} total
                <Text className="text-slate-400 font-normal text-sm">
                  {' '}
                  (incl. {formatChf(totals.serviceFeeChf)} fee)
                </Text>
              </Text>
            ) : null}
          </AppCard>

          <AppInput
            label="Your name"
            value={customerName}
            onChangeText={setCustomerName}
            error={errors.customerName}
            autoCapitalize="words"
            placeholder="Max Mustermann"
          />
          <AppInput
            label="Phone (WhatsApp)"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            keyboardType="phone-pad"
            placeholder="+41 79 123 45 67"
          />
          <AppInput
            label="Home address"
            value={address}
            onChangeText={setAddress}
            error={errors.address}
            placeholder="Musterstrasse 1, 4051 Basel"
            multiline
          />
          <AppInput
            label="Date"
            value={appointmentDate}
            onChangeText={setAppointmentDate}
            error={errors.appointmentDate}
            placeholder="2026-05-20"
            keyboardType="numbers-and-punctuation"
          />
          <AppInput
            label="Time"
            value={appointmentTime}
            onChangeText={setAppointmentTime}
            error={errors.appointmentTime}
            placeholder="14:30"
            keyboardType="numbers-and-punctuation"
          />
          <AppInput
            label="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Ring at the door, etc."
            multiline
          />

          <View className="mb-8">
            <AppButton
              label="Confirm booking"
              onPress={handleSubmit}
              loading={submitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
