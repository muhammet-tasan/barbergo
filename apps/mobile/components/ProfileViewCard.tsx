import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton, ButtonGroup } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AUTOFILL } from '@/constants/form-autofill';
import { colors } from '@/constants/theme';
import { PHONE_FORMAT_HINT, validatePhoneNumber } from '@/utils/validation';

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-4">
      <Text className="text-brand-muted text-sm mb-1">{label}</Text>
      <Text className="text-brand-text text-base">{value || '—'}</Text>
    </View>
  );
}

type ProfileViewCardProps = {
  roleLabel: string;
  email: string;
  displayName: string;
  phone: string;
  address: string;
  editing: boolean;
  saving: boolean;
  error?: string;
  phoneError?: string;
  success?: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onChangeDisplayName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onSave: () => void;
  phoneRequired?: boolean;
};

export function ProfileViewCard({
  roleLabel,
  email,
  displayName,
  phone,
  address,
  editing,
  saving,
  error,
  phoneError,
  success,
  onStartEdit,
  onCancelEdit,
  onChangeDisplayName,
  onChangePhone,
  onChangeAddress,
  onSave,
  phoneRequired = false,
}: ProfileViewCardProps) {
  return (
    <View>
      <View className="flex-row items-center justify-end mb-2">
        {!editing ? (
          <Pressable
            onPress={onStartEdit}
            className="flex-row items-center gap-1.5 px-2 py-1 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Profil bearbeiten"
          >
            <Ionicons name="pencil" size={20} color={colors.accent} />
            <Text className="text-brand-gold text-sm font-medium">Bearbeiten</Text>
          </Pressable>
        ) : null}
      </View>

      <ReadOnlyField label="Rolle" value={roleLabel} />
      <ReadOnlyField label="E-Mail" value={email} />

      {editing ? (
        <>
          <AppInput
            label="Anzeigename"
            value={displayName}
            onChangeText={onChangeDisplayName}
            autofill={AUTOFILL.name}
            autoCapitalize="words"
          />
          <AppInput
            label={phoneRequired ? 'Telefon' : 'Telefon (optional)'}
            value={phone}
            onChangeText={onChangePhone}
            error={phoneError}
            autofill={AUTOFILL.tel}
            keyboardType="phone-pad"
            placeholder={PHONE_FORMAT_HINT}
          />
          <AppInput
            label="Adresse / Standort"
            value={address}
            onChangeText={onChangeAddress}
            autofill={AUTOFILL.streetAddress}
            placeholder="Optional"
            multiline
          />
          {error ? <Text className="text-error text-sm mb-3">{error}</Text> : null}
          <ButtonGroup className="gap-6 mt-6" spaced={false}>
            <AppButton label="Speichern" onPress={onSave} loading={saving} />
            <AppButton label="Abbrechen" variant="secondary" onPress={onCancelEdit} />
          </ButtonGroup>
        </>
      ) : (
        <>
          <ReadOnlyField label="Anzeigename" value={displayName} />
          <ReadOnlyField label="Telefon" value={phone} />
          <ReadOnlyField label="Adresse / Standort" value={address} />
        </>
      )}

      {success ? <Text className="text-success text-sm mt-4">{success}</Text> : null}
    </View>
  );
}

export function validateProfilePhone(phone: string, required = false): string | undefined {
  if (!required && !phone.trim()) return undefined;
  return validatePhoneNumber(phone);
}
