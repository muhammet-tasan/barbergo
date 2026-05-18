import { Text, TextInput, View, type TextInputProps } from 'react-native';

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function AppInput({ label, error, className, ...props }: AppInputProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm text-slate-300 mb-1.5">{label}</Text>
      <TextInput
        placeholderTextColor="#64748B"
        className={`rounded-xl bg-slate-800 border px-4 py-3 text-white text-base ${
          error ? 'border-red-500' : 'border-slate-600'
        } ${className ?? ''}`}
        {...props}
      />
      {error ? <Text className="text-red-400 text-sm mt-1">{error}</Text> : null}
    </View>
  );
}
