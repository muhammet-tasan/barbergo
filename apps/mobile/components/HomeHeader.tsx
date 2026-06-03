import { View } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';
import { HeaderAuthAction } from '@/components/HeaderAuthAction';

/** Full-width home top bar — logo + auth, no cramped title slot. */
export function HomeHeader() {
  return (
    <View className="border-b border-brand-border/70 bg-brand-dark px-5 pt-2 pb-4">
      <View className="flex-row items-center gap-3">
        <View className="flex-1 min-w-0 justify-center">
          <BrandLogo variant="hero" fullWidth height={72} />
        </View>
        <View className="shrink-0 pt-1">
          <HeaderAuthAction />
        </View>
      </View>
    </View>
  );
}
