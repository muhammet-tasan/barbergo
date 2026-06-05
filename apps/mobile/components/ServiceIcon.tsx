import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/theme';

type ServiceIconName = keyof typeof SERVICE_ICON_MAP;

const SERVICE_ICON_MAP = {
  haircut: 'cut-outline',
  beard: 'man-outline',
  combo: 'sparkles-outline',
  kids: 'happy-outline',
  default: 'cut-outline',
} as const;

function resolveServiceIconKey(serviceName: string): ServiceIconName {
  const name = serviceName.toLowerCase();
  if (name.includes('kinder')) return 'kids';
  if (name.includes('bart') && (name.includes('+') || name.includes('und') || name.includes('&'))) {
    return 'combo';
  }
  if (name.includes('bart')) return 'beard';
  if (name.includes('haar') || name.includes('schnitt') || name.includes('fade')) return 'haircut';
  return 'default';
}

type ServiceIconProps = {
  serviceName: string;
  size?: number;
};

export function ServiceIcon({ serviceName, size = 28 }: ServiceIconProps) {
  const key = resolveServiceIconKey(serviceName);
  const iconName = SERVICE_ICON_MAP[key];

  return (
    <View className="w-11 h-11 rounded-xl bg-brand-dark/80 border border-brand-border/60 items-center justify-center mr-3">
      <Ionicons name={iconName} size={size} color={colors.accent} />
    </View>
  );
}
