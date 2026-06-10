import { Text, View, type TextProps } from 'react-native';

import { colors } from '@/constants/theme';

type FadeOutTextProps = TextProps & {
  children: string;
};

const FADE_WIDTH = 44;

/**
 * Single-line text that fades into the background instead of ellipsis (…).
 */
export function FadeOutText({ children, className, style, ...props }: FadeOutTextProps) {
  const showFade = children.length > 16;

  return (
    <View className="flex-1 min-w-0 relative overflow-hidden">
      <Text
        className={className}
        style={style}
        numberOfLines={1}
        ellipsizeMode="clip"
        selectable={false}
        {...props}
      >
        {children}
      </Text>
      {showFade ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: FADE_WIDTH,
            flexDirection: 'row',
          }}
        >
          {[0, 0.2, 0.45, 0.7, 1].map((alpha) => (
            <View
              key={alpha}
              style={{
                flex: 1,
                backgroundColor: colors.background,
                opacity: alpha,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
