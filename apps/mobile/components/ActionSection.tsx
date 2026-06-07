import { View } from 'react-native';

import { SectionHeader } from '@/components/SectionHeader';
import { layoutClasses } from '@/constants/layout';

type ActionSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  /** Adds top spacing before this action group (default: true). */
  spaced?: boolean;
};

export function ActionSection({ title, children, className, spaced = true }: ActionSectionProps) {
  return (
    <View className={className}>
      <SectionHeader title={title} spaced={spaced} />
      <View className={layoutClasses.buttonGroup}>{children}</View>
    </View>
  );
}
