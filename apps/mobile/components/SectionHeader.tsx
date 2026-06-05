import { Text, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  className?: string;
};

export function SectionHeader({ title, className }: SectionHeaderProps) {
  return (
    <View className={`mb-3 ${className ?? ''}`}>
      <Text className="text-sm font-semibold uppercase tracking-wider text-brand-muted">
        {title}
      </Text>
    </View>
  );
}
