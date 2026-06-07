import { Pressable, Text, View } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import type { Provider } from '@/types/domain';

type ProviderMiniHeaderProps = {
  provider: Provider;
  onViewProfile?: () => void;
  className?: string;
};

export function ProviderMiniHeader({ provider, onViewProfile, className }: ProviderMiniHeaderProps) {
  return (
    <AppCard className={className}>
      <View className="flex-row items-center">
        <ProfileAvatar imageUrl={provider.imageUrl} name={provider.name} size={44} variant="card" />
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-brand-text">{provider.name}</Text>
          <Text className="text-sm text-brand-muted mt-0.5">{provider.serviceArea}</Text>
        </View>
        {onViewProfile ? (
          <Pressable
            onPress={onViewProfile}
            className="min-h-[40px] justify-center px-1 active:opacity-70"
            accessibilityRole="link"
            accessibilityLabel="Profil ansehen"
          >
            <Text className="text-brand-gold text-sm font-medium">Profil ansehen</Text>
          </Pressable>
        ) : null}
      </View>
    </AppCard>
  );
}
