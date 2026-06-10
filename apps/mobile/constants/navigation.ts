import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors } from '@/constants/theme';

/** Fast, smooth stack transitions (Expo Router / native stack). */
export const stackScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right',
  animationDuration: 220,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};

export const stackFadeOptions: NativeStackNavigationOptions = {
  ...stackScreenOptions,
  animation: 'fade',
  animationDuration: 180,
};
