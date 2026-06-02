import { Platform, Text, TextInput, View, type TextInputProps } from 'react-native';

import type { AutofillPreset } from '@/constants/form-autofill';

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
  /** HTML name/id for web autofill; use AUTOFILL presets when possible. */
  autofill?: AutofillPreset;
};

export function AppInput({
  label,
  error,
  className,
  autofill,
  autoComplete,
  textContentType,
  nativeID,
  ...props
}: AppInputProps) {
  const fieldName = autofill?.name ?? nativeID;
  const resolvedAutoComplete = autoComplete ?? autofill?.autoComplete;
  const resolvedTextContentType = textContentType ?? autofill?.textContentType;

  const webFieldProps =
    Platform.OS === 'web' && fieldName
      ? ({ id: fieldName, name: fieldName } as TextInputProps)
      : {};

  return (
    <View className="mb-4">
      {Platform.OS === 'web' && fieldName ? (
        <label
          htmlFor={fieldName}
          style={{
            display: 'block',
            fontSize: 14,
            color: '#CBD5E1',
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      ) : (
        <Text className="text-sm text-slate-300 mb-1.5">{label}</Text>
      )}
      <TextInput
        nativeID={fieldName}
        placeholderTextColor="#64748B"
        importantForAutofill="yes"
        autoComplete={resolvedAutoComplete}
        textContentType={resolvedTextContentType}
        className={`rounded-xl bg-slate-800 border px-4 py-3 text-white text-base ${
          error ? 'border-red-500' : 'border-slate-600'
        } ${className ?? ''}`}
        {...webFieldProps}
        {...props}
      />
      {error ? <Text className="text-red-400 text-sm mt-1">{error}</Text> : null}
    </View>
  );
}
