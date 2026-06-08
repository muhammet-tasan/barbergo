import { type Href, useRouter } from 'expo-router';

import { StaffBookingListScreen } from '@/components/StaffBookingListScreen';

export default function BarberBookingsScreen() {
  const router = useRouter();
  return (
    <StaffBookingListScreen
      title="Meine Buchungen"
      detailPathPrefix="/barber/dashboard"
      onBack={() => router.push('/barber/dashboard' as Href)}
    />
  );
}
