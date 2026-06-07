import { Text, View } from 'react-native';

type DataSourceBannerProps = {
  usingFallback: boolean;
  error?: string;
};

export function DataSourceBanner({ usingFallback, error }: DataSourceBannerProps) {
  if (!usingFallback) {
    return null;
  }

  return (
    <View className="mb-4 rounded-lg border border-warning/50 bg-warning/10 px-3 py-2">
      <Text className="text-warning text-sm font-medium">Offline-Modus</Text>
      <Text className="text-warning/80 text-xs mt-1">
        {error
          ? 'Server nicht erreichbar. Es werden zwischengespeicherte Daten angezeigt.'
          : 'Zwischengespeicherte Daten — möglicherweise nicht aktuell.'}
      </Text>
    </View>
  );
}
