import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing } from '../../../theme';

interface RejectOrderModalProps {
  visible: boolean;
  orderNumber: string;
  onClose: () => void;
  onReject: (reason: string) => Promise<void>;
}

const COMMON_REASONS = [
  'Item out of stock',
  'Kitchen capacity full',
  'Delivery zone not serviceable',
  'Unable to prepare in time',
  'Special ingredients unavailable',
  'Equipment malfunction',
];

export const RejectOrderModal: React.FC<RejectOrderModalProps> = ({
  visible,
  orderNumber,
  onClose,
  onReject,
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    const reason = selectedReason || customReason.trim();

    if (!reason) {
      Alert.alert('Reason Required', 'Please select or enter a reason for rejection');
      return;
    }

    if (reason.length < 10) {
      Alert.alert('Invalid Reason', 'Please provide a more detailed reason (at least 10 characters)');
      return;
    }

    Alert.alert(
      'Confirm Rejection',
      'Are you sure you want to reject this order? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await onReject(reason);
              onClose();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reject order');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <MaterialIcons name="cancel" size={24} color={colors.error} />
              <Text style={styles.title}>Reject Order</Text>
            </View>

            <Text style={styles.orderNumber}>{orderNumber}</Text>

            <View style={styles.warningBox}>
              <MaterialIcons name="warning" size={20} color={colors.warning} />
              <Text style={styles.warningText}>
                Rejecting this order will notify the customer and trigger a refund if payment was made.
              </Text>
            </View>

            <Text style={styles.label}>Select a reason:</Text>
            <View style={styles.reasonsContainer}>
              {COMMON_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonChip,
                    selectedReason === reason && styles.reasonChipSelected,
                  ]}
                  onPress={() => {
                    setSelectedReason(selectedReason === reason ? null : reason);
                    setCustomReason('');
                  }}
                >
                  <Text
                    style={[
                      styles.reasonChipText,
                      selectedReason === reason && styles.reasonChipTextSelected,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Or enter a custom reason:</Text>
            <TextInput
              style={styles.input}
              value={customReason}
              onChangeText={(text) => {
                setCustomReason(text);
                if (text.trim()) {
                  setSelectedReason(null);
                }
              }}
              placeholder="Enter detailed reason for rejection..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
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
                style={[styles.button, styles.rejectButton]}
                onPress={handleReject}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.rejectButtonText}>Reject Order</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    maxHeight: '80%',
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
    marginBottom: spacing.md,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    marginBottom: spacing.lg,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  reasonChip: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  reasonChipSelected: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  reasonChipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  reasonChipTextSelected: {
    color: colors.error,
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
    marginBottom: spacing.lg,
    minHeight: 100,
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
  rejectButton: {
    backgroundColor: colors.error,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
