import { Text, View } from 'react-native';

import { brandCopy } from '@/constants/brand-copy';

type BrandIntroProps = {
  align?: 'start' | 'center';
  showArea?: boolean;
};

/** Unified home marketing copy — consistent type scale and spacing. */
export function BrandIntro({ align = 'start', showArea = true }: BrandIntroProps) {
  const alignClass = align === 'center' ? 'items-center' : 'items-start';
  const textAlign = align === 'center' ? 'text-center' : 'text-left';

  return (
    <View className={`${alignClass} gap-2`}>
      <Text
        className={`text-sm font-semibold uppercase tracking-[0.18em] text-brand-gold ${textAlign}`}
      >
        {brandCopy.tagline}
      </Text>
      <Text className={`text-base font-normal leading-6 text-brand-text/90 ${textAlign}`}>
        {brandCopy.subtitle}
      </Text>
      {showArea ? (
        <View className="mt-1 rounded-full border border-brand-border bg-brand-surface/80 px-3 py-1">
          <Text className="text-xs font-medium tracking-wide text-brand-muted">{brandCopy.serviceArea}</Text>
        </View>
      ) : null}
    </View>
  );
}
