import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { AppCard } from '@/components/AppCard';
import { ProfileViewCard, validateProfilePhone } from '@/components/ProfileViewCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionHeader } from '@/components/SectionHeader';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { updateOwnProfile } from '@/services/profiles';

function readMetaString(session: { user: { user_metadata?: Record<string, unknown> } } | null, key: string): string {
  const value = session?.user.user_metadata?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

export default function CustomerProfileScreen() {
  const router = useRouter();
  const { isCustomer, profile, session, loading, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const applyProfileToForm = useCallback(() => {
    setDisplayName(profile?.displayName?.trim() || readMetaString(session, 'display_name') || '');
    setPhone(profile?.phone?.trim() || readMetaString(session, 'phone') || '');
    setAddress(profile?.address?.trim() || '');
  }, [profile, session]);

  useEffect(() => {
    applyProfileToForm();
  }, [applyProfileToForm]);

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
    }, [refreshProfile])
  );

  if (!isCustomer) return <Redirect href="/login" />;

  const resetForm = () => {
    applyProfileToForm();
    setError(undefined);
  };

  const handleSave = async () => {
    if (!session?.user.id) return;
    setError(undefined);
    setSuccess(undefined);

    if (!displayName.trim()) {
      setError('Name ist erforderlich');
      return;
    }
    if (phone.trim()) {
      const phoneValidation = validateProfilePhone(phone, false);
      if (phoneValidation) {
        setError(phoneValidation);
        return;
      }
    }

    setSaving(true);
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
    setEditing(false);
    setSuccess('Profil gespeichert.');
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Mein Profil" onBack={() => router.push('/')} />
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
        <SectionHeader title="Kontakt" />
        {loading && !profile ? (
          <View className="py-12 items-center">
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <AppCard>
            <ProfileViewCard
              roleLabel="Kunde"
              email={session?.user.email ?? '—'}
              displayName={displayName}
              phone={phone}
              address={address}
              editing={editing}
              saving={saving}
              error={error}
              success={success}
              phoneRequired={false}
              onStartEdit={() => {
                setSuccess(undefined);
                setEditing(true);
              }}
              onCancelEdit={() => {
                resetForm();
                setEditing(false);
              }}
              onChangeDisplayName={setDisplayName}
              onChangePhone={setPhone}
              onChangeAddress={setAddress}
              onSave={handleSave}
            />
          </AppCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
