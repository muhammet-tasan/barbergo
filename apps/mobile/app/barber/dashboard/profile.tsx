import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { AppCard } from '@/components/AppCard';
import { ProfileEditor } from '@/components/ProfileEditor';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionHeader } from '@/components/SectionHeader';
import { useAuth } from '@/contexts/auth-context';
import { updateOwnProfile } from '@/services/profiles';

const APPROVAL_LABELS = {
  pending: 'In Prüfung',
  approved: 'Freigegeben',
  rejected: 'Abgelehnt',
} as const;

export default function BarberProfileScreen() {
  const router = useRouter();
  const { isBarber, profile, session, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  useEffect(() => {
    setDisplayName(profile?.displayName ?? '');
    setPhone(profile?.phone ?? '');
    setAddress(profile?.address ?? '');
  }, [profile]);

  if (!isBarber) return <Redirect href="/login" />;

  const handleSave = async () => {
    if (!session?.user.id) return;
    setSaving(true);
    setError(undefined);
    setSuccess(undefined);
    const result = await updateOwnProfile({
      userId: session.user.id,
      displayName,
      phone,
      address,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    await refreshProfile();
    setSuccess('Profil gespeichert.');
  };

  const approvalLabel =
    APPROVAL_LABELS[profile?.approvalStatus ?? 'approved'] ?? profile?.approvalStatus;

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader
        title="Barber-Profil"
        onBack={() => router.push('/barber/dashboard' as Href)}
      />
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
        <SectionHeader title="Kontakt" />
        <AppCard>
          <ProfileEditor
            displayName={displayName}
            phone={phone}
            address={address}
            onChangeDisplayName={setDisplayName}
            onChangePhone={setPhone}
            onChangeAddress={setAddress}
            onSave={handleSave}
            saving={saving}
            error={error}
            success={success}
            readOnlyFields={[
              { label: 'Rolle', value: 'Barber' },
              { label: 'Freigabe', value: approvalLabel },
              { label: 'E-Mail', value: session?.user.email ?? '—' },
            ]}
          />
        </AppCard>
        <Text className="text-brand-muted text-xs mt-4 leading-5">
          Verfügbarkeiten und blockierte Zeiten werden im Barber-Kalender berücksichtigt.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
