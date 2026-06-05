import { Text, View } from 'react-native';

type ActionSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function ActionSection({ title, children, className }: ActionSectionProps) {
  return (
    <View className={className}>
      <Text className="text-brand-muted text-xs font-semibold uppercase tracking-wider mb-3">
        {title}
      </Text>
      <View className="gap-3">{children}</View>
    </View>
  );
}
