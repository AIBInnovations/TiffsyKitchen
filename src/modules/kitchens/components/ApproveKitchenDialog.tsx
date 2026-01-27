import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAlert } from '../../../hooks/useAlert';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import type { Kitchen } from '../../../types/api.types';
import { kitchenApprovalService } from '../../../services/kitchen-approval.service';

interface ApproveKitchenDialogProps {
  kitchen: Kitchen;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApproveKitchenDialog: React.FC<ApproveKitchenDialogProps> = ({
  kitchen,
  visible,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useAlert();
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      await kitchenApprovalService.approveKitchen(kitchen._id);
      showSuccess('Success', 'Kitchen approved successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error approving kitchen:', error);
      showError('Error', error.message || 'Failed to approve kitchen');
    } finally {
      setIsLoading(false);
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
        <View style={styles.dialog}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialIcons name="check-circle" size={64} color={colors.success} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Approve Kitchen Registration</Text>

          {/* Kitchen Name */}
          <Text style={styles.kitchenName}>{kitchen.name}</Text>

          {/* Message */}
          <Text style={styles.message}>
            Are you sure you want to approve this kitchen? This kitchen will be activated and can start accepting orders immediately.
          </Text>

          {/* Warning for PARTNER kitchens */}
          {kitchen.type === 'PARTNER' && (
            <View style={styles.warningContainer}>
              <MaterialIcons name="warning" size={20} color={colors.warning} />
              <Text style={styles.warningText}>
                Ensure all background checks and document verification are complete.
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.approveButton, isLoading && styles.buttonDisabled]}
              onPress={handleApprove}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <MaterialIcons name="check" size={20} color={colors.white} />
                  <Text style={styles.approveButtonText}>Approve Kitchen</Text>
                </>
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
    padding: 20,
  },
  dialog: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 12,
    textAlign: 'center',
  },
  kitchenName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.warning,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray700,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
