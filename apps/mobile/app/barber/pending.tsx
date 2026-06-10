import { Redirect } from 'expo-router';

/** Pending barbers land on home with neutral review message. */
export default function BarberPendingScreen() {
  return <Redirect href="/" />;
}
