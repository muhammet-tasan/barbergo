import { Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppForm } from '@/components/AppForm';
import { AppInput } from '@/components/AppInput';
import { AUTOFILL } from '@/constants/form-autofill';

type ProfileEditorProps = {
  displayName: string;
  phone: string;
  address: string;
  onChangeDisplayName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onSave: () => void;
  saving?: boolean;
  displayNameError?: string;
  phoneError?: string;
  formError?: string;
  success?: string;
  readOnlyFields?: { label: string; value: string }[];
};

export function ProfileEditor({
  displayName,
  phone,
  address,
  onChangeDisplayName,
  onChangePhone,
  onChangeAddress,
  onSave,
  saving = false,
  displayNameError,
  phoneError,
  formError,
  success,
  readOnlyFields = [],
}: ProfileEditorProps) {
  return (
    <AppForm onSubmit={onSave}>
      {readOnlyFields.map((field) => (
        <View key={field.label} className="mb-4">
          <Text className="text-brand-muted text-sm mb-1">{field.label}</Text>
          <Text className="text-brand-text">{field.value}</Text>
        </View>
      ))}
      <AppInput
        label="Anzeigename"
        value={displayName}
        onChangeText={onChangeDisplayName}
        error={displayNameError}
        autofill={AUTOFILL.name}
        autoCapitalize="words"
      />
      <AppInput
        label="Telefon"
        value={phone}
        onChangeText={onChangePhone}
        error={phoneError}
        autofill={AUTOFILL.tel}
        keyboardType="phone-pad"
      />
      <AppInput
        label="Adresse / Standort"
        value={address}
        onChangeText={onChangeAddress}
        autofill={AUTOFILL.streetAddress}
        placeholder="Optional"
        multiline
      />
      {formError ? (
        <View className="mb-4 rounded-lg border border-error/50 bg-error/10 px-3 py-2">
          <Text className="text-error text-sm">{formError}</Text>
        </View>
      ) : null}
      {success ? <Text className="text-success text-sm mb-3">{success}</Text> : null}
      <AppButton label="Speichern" onPress={onSave} loading={saving} submit />
    </AppForm>
  );
}
