import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing } from '../../../theme';
import { OrderStatus } from '../../../types/api.types';
import { useAlert } from '../../../hooks/useAlert';

interface UpdateStatusModalProps {
  visible: boolean;
  orderNumber: string;
  currentStatus: OrderStatus;
  onClose: () => void;
  onUpdate: (status: OrderStatus, notes?: string) => Promise<void>;
}

const STATUS_FLOW: OrderStatus[] = [
  'PLACED',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'PICKED_UP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: 'Placed',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  PREPARING: 'Preparing',
  READY: 'Ready for Pickup',
  PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

const STATUS_ICONS: Record<OrderStatus, string> = {
  PLACED: 'receipt',
  ACCEPTED: 'check-circle',
  REJECTED: 'cancel',
  PREPARING: 'restaurant',
  READY: 'done-all',
  PICKED_UP: 'local-shipping',
  OUT_FOR_DELIVERY: 'directions-bike',
  DELIVERED: 'home',
  CANCELLED: 'close',
  FAILED: 'error',
};

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  visible,
  orderNumber,
  currentStatus,
  onClose,
  onUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { showWarning, showError } = useAlert();

  // Get next valid statuses based on current status
  const getNextStatuses = (): OrderStatus[] => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex === -1) return [];

    // Can only move forward in the flow
    return STATUS_FLOW.slice(currentIndex + 1);
  };

  const nextStatuses = getNextStatuses();

  const handleUpdate = async () => {
    if (!selectedStatus) {
      showWarning('Status Required', 'Please select a status to update to');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(selectedStatus, notes.trim() || undefined);
      onClose();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <MaterialIcons name="update" size={24} color={colors.primary} />
            <Text style={styles.title}>Update Order Status</Text>
          </View>

          <Text style={styles.orderNumber}>{orderNumber}</Text>

          <View style={styles.currentStatus}>
            <Text style={styles.currentStatusLabel}>Current Status:</Text>
            <View style={styles.statusBadge}>
              <MaterialIcons name={STATUS_ICONS[currentStatus]} size={16} color={colors.white} />
              <Text style={styles.statusBadgeText}>{STATUS_LABELS[currentStatus]}</Text>
            </View>
          </View>

          <Text style={styles.label}>Select new status:</Text>
          <View style={styles.statusesContainer}>
            {nextStatuses.length > 0 ? (
              nextStatuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    selectedStatus === status && styles.statusOptionSelected,
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <MaterialIcons
                    name={STATUS_ICONS[status]}
                    size={20}
                    color={selectedStatus === status ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      selectedStatus === status && styles.statusOptionTextSelected,
                    ]}
                  >
                    {STATUS_LABELS[status]}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noStatusText}>
                No further status updates available for this order.
              </Text>
            )}
          </View>

          <Text style={styles.label}>Notes (optional):</Text>
          <TextInput
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes about this status update..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.updateButton, !selectedStatus && styles.buttonDisabled]}
              onPress={handleUpdate}
              disabled={loading || !selectedStatus}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.updateButtonText}>Update Status</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusLg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  orderNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  currentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  currentStatusLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadiusMd,
    gap: spacing.xs,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statusesContainer: {
    marginBottom: spacing.lg,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 2,
    borderColor: colors.divider,
    marginBottom: spacing.sm,
  },
  statusOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  statusOptionText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginLeft: spacing.md,
    fontWeight: '500',
  },
  statusOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  noStatusText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: spacing.lg,
    minHeight: 80,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  updateButton: {
    backgroundColor: colors.primary,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
