import { useLocalSearchParams } from 'expo-router';

import { StaffBookingDetailScreen } from '@/components/StaffBookingDetailScreen';

export default function BarberBookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <StaffBookingDetailScreen bookingId={id} listBackPath="/barber/dashboard/bookings" />;
}
