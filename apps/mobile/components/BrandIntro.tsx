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
    <View className={`${alignClass} gap-2.5 w-full`}>
      <Text className={`text-3xl font-bold leading-9 text-brand-text ${textAlign}`}>
        {brandCopy.claim}
      </Text>
      <Text className={`text-lg leading-7 text-brand-muted ${textAlign}`}>
        {brandCopy.subtitle}
      </Text>
      <View className="rounded-full border border-brand-border/70 bg-brand-surface/60 px-3.5 py-1.5 mt-0.5">
        <Text className="text-sm font-medium tracking-wide text-brand-muted">
          {brandCopy.serviceArea}
        </Text>
      </View>
    </View>
  );
}
