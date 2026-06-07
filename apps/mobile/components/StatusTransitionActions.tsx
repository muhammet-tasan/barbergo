import { View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import type { BookingStatus } from '@/types/domain';

type StatusAction = {
  status: BookingStatus;
  label: string;
  emphasis: 'primary' | 'secondary';
};

const STATUS_ACTIONS: Partial<Record<BookingStatus, StatusAction[]>> = {
  pending: [
    { status: 'confirmed', label: 'Als bestätigt markieren', emphasis: 'primary' },
    { status: 'completed', label: 'Als abgeschlossen markieren', emphasis: 'secondary' },
  ],
  confirmed: [
    { status: 'completed', label: 'Als abgeschlossen markieren', emphasis: 'primary' },
    { status: 'pending', label: 'Zurück auf offen', emphasis: 'secondary' },
  ],
  completed: [
    { status: 'confirmed', label: 'Zurück auf bestätigt', emphasis: 'secondary' },
  ],
  cancelled: [{ status: 'pending', label: 'Wieder öffnen', emphasis: 'secondary' }],
};

type StatusTransitionActionsProps = {
  currentStatus: BookingStatus;
  loading?: boolean;
  onTransition: (status: BookingStatus) => void;
  /** Shown for pending/confirmed — opens confirmation before cancelling. */
  onCancel?: () => void;
};

export function StatusTransitionActions({
  currentStatus,
  loading = false,
  onTransition,
  onCancel,
}: StatusTransitionActionsProps) {
  const actions = STATUS_ACTIONS[currentStatus] ?? [];

  if (actions.length === 0 && !onCancel) return null;

  return (
    <View className="gap-3">
      {actions.map((action) => (
        <AppButton
          key={action.status}
          label={action.label}
          variant={action.emphasis}
          loading={loading}
          onPress={() => onTransition(action.status)}
        />
      ))}
      {onCancel ? (
        <AppButton
          label="Buchung stornieren"
          variant="danger"
          disabled={loading}
          onPress={onCancel}
        />
      ) : null}
    </View>
  );
}
