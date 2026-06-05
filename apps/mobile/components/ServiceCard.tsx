import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ServiceIcon } from '@/components/ServiceIcon';
import { formatChf } from '@/constants/pricing';
import type { Service } from '@/types/domain';
import { colors } from '@/constants/theme';

type ServiceCardProps = {
  service: Service;
  onPress: () => void;
};

export function ServiceCard({ service, onPress }: ServiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl border border-brand-border bg-brand-surface p-4 mb-3 min-h-[72px] active:opacity-90 active:border-brand-gold/50"
      accessibilityRole="button"
      accessibilityLabel={`${service.name} buchen`}
    >
      <View className="flex-row items-center">
        <ServiceIcon serviceName={service.name} />
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-brand-text">{service.name}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="time-outline" size={13} color={colors.textMuted} />
            <Text className="text-xs text-brand-muted ml-1">{service.durationMinutes} Min.</Text>
          </View>
        </View>
        <View className="items-end mr-2">
          <Text className="text-lg font-bold text-brand-gold">{formatChf(service.priceChf)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}
