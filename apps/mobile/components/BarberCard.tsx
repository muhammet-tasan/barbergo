import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ProfileAvatar } from '@/components/ProfileAvatar';
import { colors } from '@/constants/theme';
import type { Provider } from '@/types/domain';

type BarberCardProps = {
  provider: Provider;
  onSelect: () => void;
  onViewProfile: () => void;
};

const SKILLS = ['Fade', 'Bart', 'Finish'];

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center mt-2">
      <Ionicons name={icon} size={15} color={colors.textMuted} />
      <Text className="text-xs text-brand-muted ml-1.5 w-[88px]">{label}</Text>
      <Text className="text-sm text-brand-text flex-1">{value}</Text>
    </View>
  );
}

function SkillChip({ label }: { label: string }) {
  return (
    <View className="rounded-md bg-brand-dark/40 px-2 py-0.5">
      <Text className="text-[11px] text-brand-muted">{label}</Text>
    </View>
  );
}

export function BarberCard({ provider, onSelect, onViewProfile }: BarberCardProps) {
  return (
    <Pressable
      onPress={onSelect}
      className="rounded-2xl border border-brand-border bg-brand-surface p-4 mb-3 active:opacity-90"
      accessibilityRole="button"
      accessibilityLabel={`${provider.name} — Services anzeigen`}
    >
      <View className="flex-row items-start">
        <View className="mr-3">
          <ProfileAvatar imageUrl={provider.imageUrl} name={provider.name} size={56} variant="card" />
        </View>
        <View className="flex-1 pr-2">
          <Text className="text-lg font-semibold text-brand-text">{provider.name}</Text>
          <Text className="text-sm text-brand-muted mt-2 leading-5" numberOfLines={2}>
            {provider.description}
          </Text>

          <InfoRow icon="location-outline" label="Einsatzgebiet" value={provider.serviceArea} />
          <InfoRow icon="home-outline" label="Serviceart" value="Hausbesuch · mobil" />

          <View className="flex-row items-center mt-2">
            <Ionicons name="cut-outline" size={15} color={colors.textMuted} />
            <Text className="text-xs text-brand-muted ml-1.5 w-[88px]">Spezialität</Text>
            <View className="flex-row flex-wrap gap-1.5 flex-1">
              {SKILLS.map((skill) => (
                <SkillChip key={skill} label={skill} />
              ))}
            </View>
          </View>

          <Pressable
            onPress={onViewProfile}
            className="mt-3 self-start min-h-[40px] justify-center active:opacity-70"
            accessibilityRole="link"
            accessibilityLabel={`Profil von ${provider.name} ansehen`}
          >
            <Text className="text-brand-gold text-sm font-medium">Profil ansehen</Text>
          </Pressable>
        </View>
        <View className="pt-1">
          <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}
