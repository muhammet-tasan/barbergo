import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/theme';
import type { Provider } from '@/types/domain';

type ProviderCardProps = {
  provider: Provider;
  onPress: () => void;
};

export function ProviderCard({ provider, onPress }: ProviderCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl border border-brand-border bg-brand-surface p-4 mb-3 active:opacity-90"
      accessibilityRole="button"
      accessibilityLabel={`Barber ${provider.name} auswählen`}
    >
      <View className="flex-row items-start">
        <View className="w-14 h-14 rounded-full bg-brand-dark border border-brand-gold items-center justify-center mr-3">
          <Ionicons name="cut" size={26} color={colors.accent} />
        </View>
        <View className="flex-1 pr-2">
          <Text className="text-lg font-semibold text-brand-text">{provider.name}</Text>
          <Text className="text-sm text-brand-gold mt-0.5">{provider.serviceArea}</Text>
          <Text className="text-sm text-brand-muted mt-2 leading-5" numberOfLines={2}>
            {provider.description}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}
