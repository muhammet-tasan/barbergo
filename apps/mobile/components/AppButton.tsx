import { ActivityIndicator, Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
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

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

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
