import { Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppForm } from '@/components/AppForm';
import { AppInput } from '@/components/AppInput';
import { AUTOFILL } from '@/constants/form-autofill';

type ProfileEditorProps = {
  displayName: string;
  phone: string;
  onChangeDisplayName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onSave: () => void;
  saving?: boolean;
  error?: string;
  success?: string;
  readOnlyFields?: { label: string; value: string }[];
};

export function ProfileEditor({
  displayName,
  phone,
  onChangeDisplayName,
  onChangePhone,
  onSave,
  saving = false,
  error,
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
        autofill={AUTOFILL.name}
        autoCapitalize="words"
      />
      <AppInput
        label="Telefon"
        value={phone}
        onChangeText={onChangePhone}
        autofill={AUTOFILL.tel}
        keyboardType="phone-pad"
      />
      {error ? <Text className="text-error text-sm mb-3">{error}</Text> : null}
      {success ? <Text className="text-success text-sm mb-3">{success}</Text> : null}
      <AppButton label="Speichern" onPress={onSave} loading={saving} submit />
    </AppForm>
  );
}
