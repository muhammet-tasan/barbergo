import { Redirect } from 'expo-router';

/** Alias — Kundenverwaltung liegt unter `/admin/profiles`. */
export default function AdminCustomersRedirect() {
  return <Redirect href="/admin/profiles" />;
}
