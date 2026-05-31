import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { HeaderAuthAction } from '@/components/HeaderAuthAction';
import { colors } from '@/constants/theme';

type ScreenHeaderProps = {
  title: string;
  showBack?: boolean;
  showAuthAction?: boolean;
  onBack?: () => void;
};

export function ScreenHeader({
  title,
  showBack = true,
  showAuthAction = true,
  onBack,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View className="flex-row items-center px-4 py-3 border-b border-slate-700">
      {showBack ? (
        <Pressable
          onPress={handleBack}
          className="mr-3 p-1 active:opacity-70"
          accessibilityLabel="Zurück"
        >
          <Ionicons name="chevron-back" size={28} color={colors.accent} />
        </Pressable>
      ) : (
        <View className="w-9 mr-3" />
      )}
      <Text className="flex-1 text-lg font-semibold text-white" numberOfLines={1}>
        {title}
      </Text>
      {showAuthAction ? <HeaderAuthAction /> : <View className="w-16" />}
    </View>
  );
}
