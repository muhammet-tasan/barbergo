import type { ReactNode } from 'react';
import { Platform, View } from 'react-native';

import { layout } from '@/constants/layout';
import { colors } from '@/constants/theme';
import { useWindowWidth } from '@/hooks/use-window-width';

/**
 * Web: centers the whole app in a column with a maximum width so desktop views (headers, lists,
 * forms) never stretch edge to edge. The dark background always fills the full viewport.
 * Native: only provides the dark root background.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const windowWidth = useWindowWidth();

  if (Platform.OS !== 'web') {
    // Native root background: shows below the safe areas and while overscrolling, never white.
    return <View style={{ flex: 1, backgroundColor: colors.background }}>{children}</View>;
  }

  const showEdges = windowWidth > layout.maxContentWidth;

  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.background }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: layout.maxContentWidth,
          backgroundColor: colors.background,
          borderLeftWidth: showEdges ? 1 : 0,
          borderRightWidth: showEdges ? 1 : 0,
          borderColor: colors.border,
        }}
      >
        {children}
      </View>
    </View>
  );
}
