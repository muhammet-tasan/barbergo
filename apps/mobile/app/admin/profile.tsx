import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { AppCard } from '@/components/AppCard';
import { ProfileEditor } from '@/components/ProfileEditor';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionHeader } from '@/components/SectionHeader';
import { useAuth } from '@/contexts/auth-context';
import { updateOwnProfile } from '@/services/profiles';

export default function AdminProfileScreen() {
  const router = useRouter();
  const { isAdmin, profile, session, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  useEffect(() => {
    setDisplayName(profile?.displayName ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile]);

  if (!isAdmin) return <Redirect href="/" />;

  const handleSave = async () => {
    if (!session?.user.id) return;
    setSaving(true);
    setError(undefined);
    setSuccess(undefined);
    const result = await updateOwnProfile({
      userId: session.user.id,
      displayName,
      phone,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    await refreshProfile();
    setSuccess('Profil gespeichert.');
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Admin-Profil" onBack={() => router.push('/admin')} />
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
        <SectionHeader title="Kontakt" />
        <AppCard>
          <ProfileEditor
            displayName={displayName}
            phone={phone}
            onChangeDisplayName={setDisplayName}
            onChangePhone={setPhone}
            onSave={handleSave}
            saving={saving}
            error={error}
            success={success}
            readOnlyFields={[{ label: 'Rolle', value: 'Admin' }]}
          />
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}
