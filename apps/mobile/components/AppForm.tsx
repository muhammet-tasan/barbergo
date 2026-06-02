import { Platform, View, type ViewProps } from 'react-native';
import type { ReactNode } from 'react';

type AppFormProps = ViewProps & {
  children: ReactNode;
  onSubmit: () => void;
};

/**
 * On web wraps fields in a real <form> so browsers can save/autofill credentials and addresses.
 */
export function AppForm({ children, onSubmit, className, style, ...rest }: AppFormProps) {
  if (Platform.OS === 'web') {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className={className}
        style={{ width: '100%', margin: 0 }}
      >
        {children}
      </form>
    );
  }

  return (
    <View className={className} style={style} {...rest}>
      {children}
    </View>
  );
}
