import { Text, View } from 'react-native';

import { brandCopy } from '@/constants/brand-copy';

type BrandIntroProps = {
  align?: 'start' | 'center';
};

/** Home marketing copy — claim, subline, area badge (once). */
export function BrandIntro({ align = 'start' }: BrandIntroProps) {
  const alignClass = align === 'center' ? 'items-center' : 'items-start';
  const textAlign = align === 'center' ? 'text-center' : 'text-left';

  return (
    <View className={`${alignClass} gap-3`}>
      <Text className={`text-2xl font-bold leading-8 text-brand-text ${textAlign}`}>
        {brandCopy.claim}
      </Text>
      <Text className={`text-base leading-6 text-brand-muted ${textAlign}`}>
        {brandCopy.subtitle}
      </Text>
      <View className="rounded-full border border-brand-border/70 bg-brand-surface/60 px-3 py-1">
        <Text className="text-xs font-medium tracking-wide text-brand-muted">
          {brandCopy.serviceArea}
        </Text>
      </View>
    </View>
  );
}
