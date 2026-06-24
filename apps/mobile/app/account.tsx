import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { AppCard } from '@/components/AppCard';
import { ProfileEditor } from '@/components/ProfileEditor';
import { ProfilePhotoPlaceholder } from '@/components/ProfilePhotoPlaceholder';
import { ProfileViewCard, validateProfilePhone } from '@/components/ProfileViewCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { updateOwnProfile } from '@/services/profiles';
import { navigateBack } from '@/utils/navigation';

function readMetaString(
  session: { user: { user_metadata?: Record<string, unknown> } } | null,
  key: string
): string {
  const value = session?.user.user_metadata?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

const APPROVAL_LABELS = {
  pending: 'In Prüfung',
  approved: 'Freigegeben',
  rejected: 'Abgelehnt',
} as const;

export default function AccountScreen() {
  const router = useRouter();
  const {
    session,
    profile,
    loading,
    refreshProfile,
    isAdmin,
    isCustomer,
    isBarber,
    isAuthenticated,
  } = useAuth();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [displayNameError, setDisplayNameError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
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

  if (!loading && !isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const roleLabel = isAdmin ? 'Admin' : isBarber ? 'Barber' : isCustomer ? 'Kunde' : 'Gast';

  const resetForm = () => {
    applyProfileToForm();
    setDisplayNameError(undefined);
    setPhoneError(undefined);
    setFormError(undefined);
  };

  const handleSave = async () => {
    if (!session?.user.id) return;
    setDisplayNameError(undefined);
    setPhoneError(undefined);
    setFormError(undefined);
    setSuccess(undefined);

    let hasError = false;
    if (!displayName.trim()) {
      setDisplayNameError('Name ist erforderlich');
      hasError = true;
    }
    if (phone.trim()) {
      const phoneValidation = validateProfilePhone(phone, false);
      if (phoneValidation) {
        setPhoneError(phoneValidation);
        hasError = true;
      }
    }
    if (hasError) return;

    setSaving(true);
    const result = await updateOwnProfile({
      userId: session.user.id,
      displayName,
      phone,
      address,
      ...(isAdmin ? { roleHint: 'admin' as const } : {}),
    });
    setSaving(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    await refreshProfile();
    applyProfileToForm();
    setEditing(false);
    setSuccess('Profil gespeichert.');
  };

  const initialLoading = loading && !session;
  const approvalLabel =
    APPROVAL_LABELS[profile?.approvalStatus ?? 'approved'] ?? profile?.approvalStatus;

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader
        title="Mein Profil"
        subtitle="Kontaktdaten bearbeiten"
        onBack={() => navigateBack(router, '/')}
      />
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
        {initialLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <>
            <AppCard>
              <ProfilePhotoPlaceholder />

              {isBarber ? (
                <ProfileEditor
                  displayName={displayName}
                  phone={phone}
                  address={address}
                  onChangeDisplayName={setDisplayName}
                  onChangePhone={setPhone}
                  onChangeAddress={setAddress}
                  onSave={handleSave}
                  saving={saving}
                  displayNameError={displayNameError}
                  phoneError={phoneError}
                  formError={formError}
                  success={success}
                  readOnlyFields={[
                    { label: 'Rolle', value: roleLabel },
                    { label: 'Freigabe', value: approvalLabel },
                    { label: 'E-Mail', value: session?.user.email ?? '—' },
                  ]}
                />
              ) : (
                <ProfileViewCard
                  roleLabel={roleLabel}
                  email={session?.user.email ?? '—'}
                  displayName={displayName}
                  phone={phone}
                  address={address}
                  editing={editing}
                  saving={saving}
                  displayNameError={displayNameError}
                  phoneError={phoneError}
                  formError={formError}
                  success={success}
                  phoneRequired={false}
                  onStartEdit={() => {
                    setSuccess(undefined);
                    setDisplayNameError(undefined);
                    setPhoneError(undefined);
                    setFormError(undefined);
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
              )}
            </AppCard>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
