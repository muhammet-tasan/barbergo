import { Pressable, ScrollView, Text } from 'react-native';

import type { BookingStatus } from '@/types/domain';

export type AdminBookingFilter = 'all' | BookingStatus;

const TABS: { key: AdminBookingFilter; label: string }[] = [
  { key: 'pending', label: 'Offen' },
  { key: 'confirmed', label: 'Bestätigt' },
  { key: 'completed', label: 'Abgeschlossen' },
  { key: 'cancelled', label: 'Storniert' },
];

type AdminBookingTabsProps = {
  active: AdminBookingFilter;
  onChange: (filter: AdminBookingFilter) => void;
};

export function AdminBookingTabs({ active, onChange }: AdminBookingTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4 -mx-1"
      contentContainerClassName="gap-2 px-1"
    >
      {TABS.map((tab) => {
        const selected = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className={`rounded-full px-3.5 h-[34px] items-center justify-center border ${
              selected
                ? 'bg-brand-gold/12 border-brand-gold/60'
                : 'bg-brand-surface border-brand-border/80'
            }`}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <Text
              className={`text-xs font-medium ${
                selected ? 'text-brand-gold' : 'text-brand-muted'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
