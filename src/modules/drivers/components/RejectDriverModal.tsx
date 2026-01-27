import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAlert } from '../../../hooks/useAlert';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import type { RejectDriverModalProps } from '../../../types/driver.types';
import { adminDriversService } from '../../../services/admin-drivers.service';

const COMMON_REASONS = [
  'License image is unclear or unverifiable',
  'Vehicle documents are expired',
  'Information provided doesn\'t match documents',
  'Incomplete documentation',
  'License number is invalid',
  'Vehicle registration certificate has expired',
];

export const RejectDriverModal: React.FC<RejectDriverModalProps> = ({
  visible,
  driver,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError, showWarning } = useAlert();

  const handleReject = async () => {
    if (!driver) return;

    if (!reason.trim() || reason.trim().length < 10) {
      showWarning(
        'Invalid Reason',
        'Please provide a rejection reason with at least 10 characters.'
      );
      return;
    }

    try {
      setIsLoading(true);
      await adminDriversService.rejectDriver(driver._id, reason.trim());

      showSuccess(
        'Driver Rejected',
        `${driver.name}'s registration has been rejected.`,
        () => {
          setReason('');
          onSuccess();
          onClose();
        }
      );
    } catch (error: any) {
      showError(
        'Error',
        error.message || 'Failed to reject driver. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const selectCommonReason = (selectedReason: string) => {
    setReason(selectedReason);
  };

  if (!driver) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
              <MaterialIcons name="cancel" size={32} color={colors.error} />
            </View>
            <Text style={styles.title}>Reject Driver Registration</Text>
            <Text style={styles.subtitle}>
              Provide a clear reason for rejection. The driver will see this message.
            </Text>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Driver Name:</Text>
              <Text style={styles.infoValue}>{driver.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{driver.phone}</Text>
            </View>

            <Text style={styles.label}>Rejection Reason *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter the reason for rejection (min 10 characters)..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isLoading}
            />
            <Text style={styles.charCount}>
              {reason.length} characters {reason.length < 10 ? '(minimum 10 required)' : ''}
            </Text>

            <Text style={styles.commonReasonsTitle}>Common Reasons:</Text>
            <View style={styles.reasonsContainer}>
              {COMMON_REASONS.map((commonReason, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.reasonChip,
                    reason === commonReason && styles.reasonChipSelected,
                  ]}
                  onPress={() => selectCommonReason(commonReason)}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.reasonChipText,
                      reason === commonReason && styles.reasonChipTextSelected,
                    ]}
                  >
                    {commonReason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.rejectButton,
                (isLoading || reason.length < 10) && styles.rejectButtonDisabled,
              ]}
              onPress={handleReject}
              disabled={isLoading || reason.length < 10}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <MaterialIcons name="cancel" size={18} color={colors.white} />
                  <Text style={styles.rejectButtonText}>Submit Rejection</Text>
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
    maxWidth: 600,
    maxHeight: '90%',
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
    maxHeight: 400,
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
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginTop: 16,
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.gray900,
    minHeight: 100,
    backgroundColor: colors.white,
  },
  charCount: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 4,
    textAlign: 'right',
  },
  commonReasonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginTop: 16,
    marginBottom: 8,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reasonChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  reasonChipSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  reasonChipText: {
    fontSize: 12,
    color: colors.gray700,
  },
  reasonChipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
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
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rejectButtonDisabled: {
    opacity: 0.6,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
