import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

/** Form/detail spacing — separate from HomeHero. */
const FORM_SECTION = {
  marginTopAfterCard: 32,
  marginTopSpaced: 32,
  marginBottom: 12,
} as const;

type SectionHeaderProps = {
  title: string;
  className?: string;
  /** Top spacing after unrelated content blocks (e.g. hero, banner). */
  spaced?: boolean;
  /** Top spacing when directly following a card — 32px gap. */
  followsCard?: boolean;
};

export function SectionHeader({
  title,
  className,
  spaced = false,
  followsCard = false,
}: SectionHeaderProps) {
  const marginTop = followsCard
    ? FORM_SECTION.marginTopAfterCard
    : spaced
      ? FORM_SECTION.marginTopSpaced
      : 0;

  return (
    <View
      className={className}
      style={[styles.container, marginTop > 0 ? { marginTop } : null]}
    >
      <Text style={styles.label}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: FORM_SECTION.marginBottom,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.68,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
});
