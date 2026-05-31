import { Redirect } from 'expo-router';

/** Legacy route — unified login at /login */
export default function AdminLoginRedirect() {
  return <Redirect href="/login" />;
}
