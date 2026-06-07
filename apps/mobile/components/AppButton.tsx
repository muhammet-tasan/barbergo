import type { ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';

import { layoutClasses } from '@/constants/layout';
import { colors } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'main' | 'compact';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  /** Web: render as <button type="submit"> inside AppForm */
  submit?: boolean;
};

function resolveVariant(variant: ButtonVariant): 'primary' | 'secondary' | 'tertiary' | 'danger' {
  if (variant === 'ghost' || variant === 'outline') return variant === 'ghost' ? 'tertiary' : 'secondary';
  return variant;
}

const containerStyles: Record<'primary' | 'secondary' | 'tertiary' | 'danger', string> = {
  primary: 'bg-brand-gold border border-brand-gold',
  secondary: 'bg-brand-dark border border-brand-border',
  tertiary: 'bg-brand-surface/50 border border-brand-border',
  danger: 'bg-error/10 border border-error/60',
};

const labelStyles: Record<'primary' | 'secondary' | 'tertiary' | 'danger', string> = {
  primary: 'text-brand-dark',
  secondary: 'text-brand-text',
  tertiary: 'text-brand-text/90',
  danger: 'text-error',
};

const sizeStyles: Record<ButtonSize, string> = {
  main: 'min-h-[56px] px-6 py-3.5',
  compact: 'min-h-[36px] px-4 py-2',
};

const labelSizeStyles: Record<ButtonSize, string> = {
  main: 'text-base font-semibold',
  compact: 'text-sm font-semibold',
};

const webButtonClass = (
  resolved: 'primary' | 'secondary' | 'tertiary' | 'danger',
  buttonSize: ButtonSize,
  fullWidth: boolean,
  isDisabled: boolean
) =>
  `rounded-2xl flex items-center justify-center border-0 cursor-pointer ${sizeStyles[buttonSize]} ${
    fullWidth ? 'w-full' : ''
  } ${containerStyles[resolved]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;

export function ButtonGroup({
  children,
  className,
  spaced = true,
}: {
  children: ReactNode;
  className?: string;
  spaced?: boolean;
}) {
  return (
    <View
      className={`${spaced ? layoutClasses.sectionSpaced : ''} ${layoutClasses.buttonGroup} ${className ?? ''}`}
    >
      {children}
    </View>
  );
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'main',
  disabled = false,
  loading = false,
  fullWidth = true,
  submit = false,
}: AppButtonProps) {
  const resolved = resolveVariant(variant);
  const isDisabled = disabled || loading;
  const spinnerColor = resolved === 'primary' ? colors.background : colors.text;
  const widthClass = fullWidth ? 'w-full' : '';

  if (Platform.OS === 'web' && submit) {
    return (
      <button
        type="submit"
        disabled={isDisabled}
        className={webButtonClass(resolved, size, fullWidth, isDisabled)}
      >
        {loading ? (
          <ActivityIndicator color={spinnerColor} />
        ) : (
          <span className={`${labelSizeStyles[size]} ${labelStyles[resolved]}`}>{label}</span>
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
      className={`${widthClass} rounded-2xl items-center justify-center ${sizeStyles[size]} ${
        containerStyles[resolved]
      } ${isDisabled ? 'opacity-50' : 'active:opacity-80'}`}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text className={`${labelSizeStyles[size]} ${labelStyles[resolved]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
