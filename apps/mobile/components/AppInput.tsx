import { useState } from 'react';
import { Platform, Text, TextInput, View, type TextInputProps } from 'react-native';

import type { AutofillPreset } from '@/constants/form-autofill';
import { colors } from '@/constants/theme';

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
  /** HTML name/id for web autofill; use AUTOFILL presets when possible. */
  autofill?: AutofillPreset;
};

const labelClass = 'text-[13px] font-medium text-brand-muted mb-2';
const inputBaseClass =
  'rounded-[13px] bg-brand-dark border px-4 text-[15px] text-brand-text leading-5';
const inputSingleClass = 'min-h-[52px] py-3';
const inputMultilineClass = 'min-h-[88px] max-h-[120px] py-3';

export function AppInput({
  label,
  error,
  className,
  autofill,
  autoComplete,
  textContentType,
  nativeID,
  multiline,
  onFocus,
  onBlur,
  ...props
}: AppInputProps) {
  const [focused, setFocused] = useState(false);
  const fieldName = autofill?.name ?? nativeID;
  const resolvedAutoComplete = autoComplete ?? autofill?.autoComplete;
  const resolvedTextContentType = textContentType ?? autofill?.textContentType;

  const borderClass = error
    ? 'border-error'
    : focused
      ? 'border-brand-gold/55'
      : 'border-brand-border/80';

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
            fontSize: 13,
            fontWeight: 500,
            color: colors.textMuted,
            marginBottom: 8,
          }}
        >
          {label}
        </label>
      ) : (
        <Text className={labelClass}>{label}</Text>
      )}
      <TextInput
        nativeID={fieldName}
        placeholderTextColor="#7C8EA3"
        importantForAutofill="yes"
        autoComplete={resolvedAutoComplete}
        textContentType={resolvedTextContentType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={`${inputBaseClass} ${multiline ? inputMultilineClass : inputSingleClass} ${borderClass} ${
          className ?? ''
        }`}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...webFieldProps}
        {...props}
      />
      {error ? <Text className="text-error text-[13px] mt-1.5">{error}</Text> : null}
    </View>
  );
}
