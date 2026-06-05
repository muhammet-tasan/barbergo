import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { brandImages } from '@/constants/images';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center py-10 px-4">
      <Image
        source={brandImages.logoMark}
        style={{ width: 96, height: 96, opacity: 0.55 }}
        contentFit="contain"
        accessibilityLabel=""
      />
      <Text className="text-brand-text font-semibold text-lg mt-6 text-center">{title}</Text>
      {description ? (
        <Text className="text-brand-muted text-center mt-2 leading-5">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-6 w-full max-w-sm">
          <AppButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
