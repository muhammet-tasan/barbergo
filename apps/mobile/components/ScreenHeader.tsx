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

const SIDE_SLOT_WIDTH = 'w-[72px]';

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
    <View className="flex-row items-center px-4 py-3 border-b border-slate-700 min-h-[52px]">
      <View className={`${SIDE_SLOT_WIDTH} items-start justify-center`}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            className="p-1 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Zurück"
          >
            <Ionicons name="chevron-back" size={28} color={colors.accent} />
          </Pressable>
        ) : null}
      </View>

      <Text
        className="flex-1 text-lg font-semibold text-white text-center"
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>

      <View className={`${SIDE_SLOT_WIDTH} items-end justify-center`}>
        {showAuthAction ? <HeaderAuthAction /> : null}
      </View>
    </View>
  );
}
