import { ActivityIndicator, Platform, Pressable, Text } from 'react-native';

import { colors } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  /** Web: render as <button type="submit"> inside AppForm */
  submit?: boolean;
};

const containerStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-gold',
  secondary: 'bg-brand-surface border border-brand-border',
  ghost: 'bg-transparent border border-brand-border',
  danger: 'bg-error/15 border border-error',
  outline: 'bg-transparent border border-brand-gold/50',
};

const labelStyles: Record<ButtonVariant, string> = {
  primary: 'text-brand-dark',
  secondary: 'text-brand-text',
  ghost: 'text-brand-gold',
  danger: 'text-error',
  outline: 'text-brand-gold',
};

const webButtonClass = (variant: ButtonVariant, isDisabled: boolean) =>
  `rounded-2xl px-6 py-4 w-full flex items-center justify-center border-0 cursor-pointer ${
    containerStyles[variant]
  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  submit = false,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  if (Platform.OS === 'web' && submit) {
    return (
      <button
        type="submit"
        disabled={isDisabled}
        className={webButtonClass(variant, isDisabled)}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? colors.background : colors.accent} />
        ) : (
          <span className={`text-base font-semibold ${labelStyles[variant]}`}>{label}</span>
        )}
      </button>
    );
  }

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      className={`rounded-2xl px-6 py-4 min-h-[48px] items-center justify-center ${
        containerStyles[variant]
      } ${isDisabled ? 'opacity-50' : 'active:opacity-80'}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.background : colors.accent} />
      ) : (
        <Text className={`text-base font-semibold ${labelStyles[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
