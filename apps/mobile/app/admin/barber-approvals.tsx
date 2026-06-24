import { Redirect } from 'expo-router';

/** Alias — Barber-Freigaben liegen unter `/admin/pending-barbers`. */
export default function AdminBarberApprovalsRedirect() {
  return <Redirect href="/admin/pending-barbers" />;
}
