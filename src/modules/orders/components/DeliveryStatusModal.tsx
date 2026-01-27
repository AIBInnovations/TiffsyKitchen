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
import { useAlert } from '../../../hooks/useAlert';

interface DeliveryStatusModalProps {
  visible: boolean;
  orderNumber: string;
  onClose: () => void;
  onUpdate: (data: {
    status: 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
    notes?: string;
    proofOfDelivery?: {
      type: 'OTP' | 'SIGNATURE' | 'PHOTO';
      value: string;
    };
  }) => Promise<void>;
  initialStatus?: 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
}

type DeliveryStatus = 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
};

const STATUS_ICONS: Record<DeliveryStatus, string> = {
  PICKED_UP: 'local-shipping',
  OUT_FOR_DELIVERY: 'directions-bike',
  DELIVERED: 'home',
};

export const DeliveryStatusModal: React.FC<DeliveryStatusModalProps> = ({
  visible,
  orderNumber,
  onClose,
  onUpdate,
  initialStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus | null>(initialStatus || null);
  const [notes, setNotes] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { showWarning, showError } = useAlert();

  // Update selectedStatus when initialStatus changes
  React.useEffect(() => {
    if (visible && initialStatus) {
      setSelectedStatus(initialStatus);
    }
  }, [visible, initialStatus]);

  const handleUpdate = async () => {
    if (!selectedStatus) {
      showWarning('Status Required', 'Please select a delivery status');
      return;
    }

    // OTP required for delivered status
    if (selectedStatus === 'DELIVERED' && !otp.trim()) {
      showWarning('OTP Required', 'Please enter the delivery OTP');
      return;
    }

    // 🔍 LOG: Building delivery status update payload
    const deliveryPayload = {
      status: selectedStatus,
      notes: notes.trim() || undefined,
      proofOfDelivery: selectedStatus === 'DELIVERED' ? {
        type: 'OTP' as const,
        value: otp.trim(),
      } : undefined,
    };

    console.log('====================================');
    console.log('📦 DELIVERY STATUS MODAL: Submitting Update');
    console.log('====================================');
    console.log('Selected Status:', selectedStatus);
    console.log('Status Type:', typeof selectedStatus);
    console.log('Status Length:', selectedStatus.length);
    console.log('Status Value (raw):', `"${selectedStatus}"`);
    console.log('Has Notes?', !!notes.trim());
    if (notes.trim()) {
      console.log('Notes Length:', notes.trim().length);
    }
    console.log('Requires OTP?', selectedStatus === 'DELIVERED');
    if (selectedStatus === 'DELIVERED') {
      console.log('OTP Provided:', otp.trim());
      console.log('OTP Length:', otp.trim().length);
    }
    console.log('====================================');
    console.log('📤 DELIVERY PAYLOAD (Complete):');
    console.log(JSON.stringify(deliveryPayload, null, 2));
    console.log('====================================');

    setLoading(true);
    try {
      await onUpdate(deliveryPayload);
      setSelectedStatus(null);
      setNotes('');
      setOtp('');
      onClose();
    } catch (error: any) {
      console.log('❌ DELIVERY STATUS UPDATE FAILED');
      console.log('Error:', error);
      console.log('====================================');
      showError('Error', error.message || 'Failed to update delivery status');
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
            <MaterialIcons name="local-shipping" size={24} color={colors.primary} />
            <Text style={styles.title}>Update Delivery Status</Text>
          </View>

          <Text style={styles.orderNumber}>{orderNumber}</Text>

          <Text style={styles.label}>Select delivery status:</Text>
          <View style={styles.statusesContainer}>
            {(['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'] as DeliveryStatus[]).map((status) => (
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
            ))}
          </View>

          {selectedStatus === 'DELIVERED' && (
            <>
              <Text style={styles.label}>Delivery OTP:</Text>
              <TextInput
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter 4-digit OTP"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
            </>
          )}

          <Text style={styles.label}>Notes (optional):</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes about this delivery update..."
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
  input: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: spacing.md,
  },
  textArea: {
    minHeight: 80,
    marginBottom: spacing.lg,
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
