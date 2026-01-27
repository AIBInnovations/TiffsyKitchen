import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAlert } from '../../../hooks/useAlert';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import type { ApproveDriverModalProps } from '../../../types/driver.types';
import { adminDriversService } from '../../../services/admin-drivers.service';

export const ApproveDriverModal: React.FC<ApproveDriverModalProps> = ({
  visible,
  driver,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useAlert();

  const handleApprove = async () => {
    if (!driver) return;

    try {
      setIsLoading(true);
      await adminDriversService.approveDriver(driver._id);

      showSuccess(
        'Success',
        `${driver.name} has been approved as a driver.`,
        () => {
          onSuccess();
          onClose();
        }
      );
    } catch (error: any) {
      showError(
        'Error',
        error.message || 'Failed to approve driver. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!driver) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
              <MaterialIcons name="check-circle" size={32} color={colors.success} />
            </View>
            <Text style={styles.title}>Approve Driver</Text>
            <Text style={styles.subtitle}>
              Are you sure you want to approve this driver registration?
            </Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Driver Name:</Text>
              <Text style={styles.infoValue}>{driver.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{driver.phone}</Text>
            </View>
            {driver.driverDetails?.vehicleName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vehicle:</Text>
                <Text style={styles.infoValue}>
                  {driver.driverDetails.vehicleName} ({driver.driverDetails.vehicleNumber})
                </Text>
              </View>
            )}

            <View style={styles.warningBox}>
              <MaterialIcons name="info-outline" size={20} color={colors.primary} />
              <Text style={styles.warningText}>
                Once approved, the driver will gain full access to the delivery system.
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                isLoading && styles.confirmButtonDisabled,
              ]}
              onPress={handleApprove}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <MaterialIcons name="check-circle" size={18} color={colors.white} />
                  <Text style={styles.confirmButtonText}>Approve Driver</Text>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray600,
    textAlign: 'center',
  },
  body: {
    padding: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.gray900,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.gray700,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
