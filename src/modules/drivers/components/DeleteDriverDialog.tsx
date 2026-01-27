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
import { adminDriversService } from '../../../services/admin-drivers.service';
import type { Driver } from '../../../types/driver.types';

interface DeleteDriverDialogProps {
  visible: boolean;
  driver: Driver;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteDriverDialog: React.FC<DeleteDriverDialogProps> = ({
  visible,
  driver,
  onClose,
  onSuccess,
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError, showWarning } = useAlert();

  const handleDelete = async () => {
    if (!confirmed) {
      showWarning('Confirmation Required', 'Please confirm that you understand this action cannot be undone.');
      return;
    }

    setIsLoading(true);
    try {
      await adminDriversService.deleteDriver(driver._id);
      showSuccess('Success', `${driver.name} has been deleted successfully`);
      onSuccess();
      handleClose();
    } catch (error: any) {
      // Check if error message contains information about pending deliveries
      if (error.message?.includes('pending deliveries') || error.message?.includes('active deliveries')) {
        showError(
          'Cannot Delete Driver',
          error.message || 'Cannot delete driver with pending deliveries. Please reassign active deliveries first.'
        );
      } else {
        showError('Error', error.message || 'Failed to delete driver');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="delete-forever" size={32} color={colors.error} />
            <Text style={styles.headerTitle}>Delete Driver - {driver.name}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Warning */}
            <View style={styles.warningContainer}>
              <MaterialIcons name="warning" size={24} color={colors.error} />
              <Text style={styles.warningTitle}>This is a permanent action</Text>
            </View>

            <Text style={styles.warningText}>
              The driver will be soft-deleted and permanently blocked from the system.
            </Text>

            {/* Safety Note */}
            <View style={styles.noteContainer}>
              <MaterialIcons name="info" size={20} color={colors.info} />
              <Text style={styles.noteText}>
                Cannot delete if driver has active deliveries. Active deliveries must be reassigned first.
              </Text>
            </View>

            {/* Driver Info */}
            <View style={styles.driverInfo}>
              <Text style={styles.infoLabel}>Driver:</Text>
              <Text style={styles.infoValue}>{driver.name}</Text>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{driver.phone}</Text>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={styles.infoValue}>{driver.status}</Text>
            </View>

            {/* Confirmation Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setConfirmed(!confirmed)}
              disabled={isLoading}
            >
              <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
                {confirmed && (
                  <MaterialIcons name="check" size={18} color={colors.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                I understand this cannot be undone
              </Text>
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.deleteButton,
                (!confirmed || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleDelete}
              disabled={!confirmed || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <MaterialIcons name="delete" size={18} color={colors.white} />
                  <Text style={styles.deleteButtonText}>Delete Driver</Text>
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
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  warningTitle: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 16,
    lineHeight: 20,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoLight,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  driverInfo: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cancelButton: {
    backgroundColor: colors.background,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
