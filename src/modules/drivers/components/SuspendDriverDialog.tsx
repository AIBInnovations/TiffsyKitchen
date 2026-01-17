import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { adminDriversService } from '../../../services/admin-drivers.service';
import type { Driver } from '../../../types/driver.types';

interface SuspendDriverDialogProps {
  visible: boolean;
  driver: Driver;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_REASONS = [
  'Multiple customer complaints',
  'Unprofessional behavior',
  'Failed to complete deliveries',
  'Document verification required',
];

export const SuspendDriverDialog: React.FC<SuspendDriverDialogProps> = ({
  visible,
  driver,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectReason = (selectedReason: string) => {
    setReason(selectedReason);
    setError('');
  };

  const validateReason = (): boolean => {
    if (!reason.trim()) {
      setError('Suspension reason is required');
      return false;
    }
    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters');
      return false;
    }
    return true;
  };

  const handleSuspend = async () => {
    if (!validateReason()) {
      return;
    }

    setIsLoading(true);
    try {
      await adminDriversService.suspendDriver(driver._id, reason.trim());
      Alert.alert('Success', `${driver.name} has been suspended successfully`);
      onSuccess();
      handleClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to suspend driver');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Suspend Driver - {driver.name}</Text>
            <TouchableOpacity onPress={handleClose} disabled={isLoading}>
              <MaterialIcons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Reason Input */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Reason for suspension <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textarea, error && styles.textareaError]}
                value={reason}
                onChangeText={(text) => {
                  setReason(text);
                  setError('');
                }}
                placeholder="Enter reason for suspension..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isLoading}
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
              <Text style={styles.hint}>Minimum 10 characters required</Text>
            </View>

            {/* Common Reasons */}
            <View style={styles.section}>
              <Text style={styles.label}>Common reasons:</Text>
              <View style={styles.chipContainer}>
                {COMMON_REASONS.map((commonReason, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.chip,
                      reason === commonReason && styles.chipSelected,
                    ]}
                    onPress={() => handleSelectReason(commonReason)}
                    disabled={isLoading}
                  >
                    <MaterialIcons
                      name="fiber-manual-record"
                      size={8}
                      color={reason === commonReason ? colors.white : colors.textSecondary}
                      style={styles.chipIcon}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        reason === commonReason && styles.chipTextSelected,
                      ]}
                    >
                      {commonReason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Warning */}
            <View style={styles.warningContainer}>
              <MaterialIcons name="warning" size={20} color={colors.warning} />
              <Text style={styles.warningText}>
                Driver will be immediately blocked from login
              </Text>
            </View>
          </ScrollView>

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
              style={[styles.button, styles.suspendButton, isLoading && styles.buttonDisabled]}
              onPress={handleSuspend}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.suspendButtonText}>Suspend Driver</Text>
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
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    minHeight: 100,
  },
  textareaError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  hint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  suspendButton: {
    backgroundColor: colors.error,
  },
  suspendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
