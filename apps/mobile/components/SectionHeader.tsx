import { Text, View } from 'react-native';

import { layoutClasses } from '@/constants/layout';

type SectionHeaderProps = {
  title: string;
  className?: string;
  /** Top spacing after unrelated content blocks (e.g. hero, banner). */
  spaced?: boolean;
  /** Top spacing when directly following a card — tighter booking flow. */
  followsCard?: boolean;
};

/** Muted uppercase label for grouped content blocks. */
export function SectionHeader({
  title,
  className,
  spaced = false,
  followsCard = false,
}: SectionHeaderProps) {
  const topSpacing = followsCard
    ? layoutClasses.sectionAfterCard
    : spaced
      ? layoutClasses.sectionSpaced
      : '';

  return (
    <View className={`${layoutClasses.sectionBottom} ${topSpacing} ${className ?? ''}`}>
      <Text className="text-xs font-medium uppercase tracking-[0.14em] text-brand-muted">
        {title}
      </Text>
    </View>
  );
}
