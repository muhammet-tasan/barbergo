import { useRouter } from 'expo-router';

import { StaffBookingListScreen } from '@/components/StaffBookingListScreen';

export default function AdminBookingsScreen() {
  const router = useRouter();
  return (
    <StaffBookingListScreen
      title="Alle Buchungen"
      detailPathPrefix="/admin"
      onBack={() => router.push('/admin')}
    />
  );
}
