import { ActivityIndicator, Platform, Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

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
  secondary: 'bg-brand-surface border border-slate-600',
  ghost: 'bg-transparent border border-slate-600',
};

const labelStyles: Record<ButtonVariant, string> = {
  primary: 'text-slate-900',
  secondary: 'text-white',
  ghost: 'text-brand-gold',
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
          <ActivityIndicator color={variant === 'primary' ? '#0F172A' : '#D4A574'} />
        ) : (
          <span className={`text-base font-semibold ${labelStyles[variant]}`}>{label}</span>
        )}
      </button>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`rounded-2xl px-6 py-4 items-center justify-center active:opacity-80 ${
        containerStyles[variant]
      } ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#0F172A' : '#D4A574'} />
      ) : (
        <Text className={`text-base font-semibold ${labelStyles[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
