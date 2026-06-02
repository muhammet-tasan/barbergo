import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

type AppCardProps = ViewProps & {
  children: ReactNode;
};

export function AppCard({ children, className, ...props }: AppCardProps) {
  return (
    <View
      className={`rounded-2xl bg-brand-surface border border-brand-border p-4 ${className ?? ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
