import { Image } from 'expo-image';
import { View } from 'react-native';

import { serviceImages } from '@/constants/images';

type ServiceImageKey = keyof typeof serviceImages | 'default';

const SERVICE_IMAGE_MAP: Record<ServiceImageKey, (typeof serviceImages)[keyof typeof serviceImages]> = {
  haircut: serviceImages.haircut,
  beard: serviceImages.beard,
  combo: serviceImages.combo,
  kids: serviceImages.kids,
  default: serviceImages.haircut,
};

function resolveServiceImageKey(serviceName: string): ServiceImageKey {
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

export function ServiceIcon({ serviceName, size = 44 }: ServiceIconProps) {
  const key = resolveServiceImageKey(serviceName);
  const source = SERVICE_IMAGE_MAP[key];

  return (
    <View className="w-11 h-11 rounded-xl bg-brand-dark/80 border border-brand-border/60 items-center justify-center mr-3 overflow-hidden">
      <Image
        source={source}
        style={{ width: size, height: size }}
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
