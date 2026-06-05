import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/theme';

type ProfileFactRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

export function ProfileFactRow({ icon, label, value }: ProfileFactRowProps) {
  return (
    <View className="flex-row items-start py-2.5 border-b border-brand-border/60 last:border-b-0">
      <Ionicons name={icon} size={18} color={colors.accent} style={{ marginTop: 2 }} />
      <View className="flex-1 ml-3">
        <Text className="text-xs text-brand-muted uppercase tracking-wide">{label}</Text>
        <Text className="text-brand-text mt-0.5 leading-5">{value}</Text>
      </View>
    </View>
  );
}
