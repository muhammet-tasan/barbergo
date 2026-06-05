import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import type { BookingStatus } from '@/types/domain';

type StatusAction = {
  status: BookingStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const STATUS_ACTIONS: Partial<Record<BookingStatus, StatusAction[]>> = {
  pending: [
    { status: 'confirmed', label: 'Als bestätigt markieren', icon: 'checkmark-circle-outline' },
    { status: 'completed', label: 'Als abgeschlossen markieren', icon: 'checkmark-done-circle-outline' },
  ],
  confirmed: [
    { status: 'completed', label: 'Als abgeschlossen markieren', icon: 'checkmark-done-circle-outline' },
    { status: 'pending', label: 'Zurück auf offen', icon: 'time-outline' },
  ],
  completed: [
    { status: 'confirmed', label: 'Zurück auf bestätigt', icon: 'checkmark-circle-outline' },
  ],
  cancelled: [{ status: 'pending', label: 'Wieder öffnen', icon: 'refresh-outline' }],
};

type StatusTransitionActionsProps = {
  currentStatus: BookingStatus;
  loading?: boolean;
  onTransition: (status: BookingStatus) => void;
};

export function StatusTransitionActions({
  currentStatus,
  loading = false,
  onTransition,
}: StatusTransitionActionsProps) {
  const actions = STATUS_ACTIONS[currentStatus] ?? [];

  if (actions.length === 0) return null;

  return (
    <View className="gap-2">
      {actions.map((action) => (
        <AppButton
          key={action.status}
          label={action.label}
          variant="outline"
          loading={loading}
          onPress={() => onTransition(action.status)}
        />
      ))}
    </View>
  );
}
