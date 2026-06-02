import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { formatChf } from '@/constants/pricing';
import type { Service } from '@/types/domain';
import { colors } from '@/constants/theme';

type ServiceCardProps = {
  service: Service;
  selected?: boolean;
  onPress: () => void;
};

export function ServiceCard({ service, selected = false, onPress }: ServiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-2xl border p-4 mb-3 active:opacity-90 ${
        selected
          ? 'bg-brand-gold/15 border-brand-gold'
          : 'bg-brand-surface border-brand-border'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-brand-text">{service.name}</Text>
          <Text className="text-sm text-brand-muted mt-1">{service.durationMinutes} min</Text>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold text-brand-gold">{formatChf(service.priceChf)}</Text>
          {selected ? (
            <View className="mt-1">
              <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
