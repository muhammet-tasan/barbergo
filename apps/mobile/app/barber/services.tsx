import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { AppButton } from '@/components/AppButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ServiceCard } from '@/components/ServiceCard';
import { services as allServices } from '@/data/mockData';

export default function ServiceSelectionScreen() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = [...allServices].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <SafeAreaView className="flex-1 bg-brand-dark" edges={['top']}>
      <ScreenHeader title="Service auswählen" />
      <ScrollView className="flex-1 px-4 pt-4" contentContainerClassName="pb-8">
        <Text className="text-slate-400 mb-4">Alle Preise in CHF. +CHF 1 Servicegebühr beim Buchen.</Text>

        {sorted.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            selected={selectedId === service.id}
            onPress={() => setSelectedId(service.id)}
          />
        ))}

        <View className="mt-4">
          <AppButton
            label="Weiter zur Buchung"
            disabled={!selectedId}
            onPress={() =>
              router.push({
                pathname: '/barber/book',
                params: { serviceId: selectedId! },
              })
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
