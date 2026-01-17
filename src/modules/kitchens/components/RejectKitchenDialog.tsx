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
import { colors } from '../../../theme/colors';
import type { Kitchen } from '../../../types/api.types';
import { kitchenApprovalService } from '../../../services/kitchen-approval.service';

interface RejectKitchenDialogProps {
  kitchen: Kitchen;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REJECTION_TEMPLATES = [
  'Incomplete documentation',
  'Failed background verification',
  'Duplicate kitchen registration',
  'Location not serviceable',
  'Does not meet food safety standards',
];

export const RejectKitchenDialog: React.FC<RejectKitchenDialogProps> = ({
  kitchen,
  visible,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    if (reason.trim().length < 10) {
      Alert.alert('Invalid Input', 'Rejection reason must be at least 10 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      await kitchenApprovalService.rejectKitchen(kitchen._id, reason.trim());
      Alert.alert('Success', 'Kitchen rejected');
      setReason('');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error rejecting kitchen:', error);
      Alert.alert('Error', error.message || 'Failed to reject kitchen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplatePress = (template: string) => {
    setReason(template);
  };

  const handleCloseModal = () => {
    if (reason.trim() && reason.trim().length > 0) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved text. Are you sure you want to close?',
        [
          { text: 'Continue Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setReason('');
              onClose();
            },
          },
        ]
      );
    } else {
      setReason('');
      onClose();
    }
  };

  const isValidReason = reason.trim().length >= 10 && reason.trim().length <= 500;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCloseModal}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.gray700} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <MaterialIcons name="cancel" size={64} color={colors.error} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Reject Kitchen Registration</Text>

            {/* Kitchen Name */}
            <Text style={styles.kitchenName}>{kitchen.name}</Text>

            {/* Quick Templates */}
            <Text style={styles.sectionTitle}>Quick Rejection Templates</Text>
            <View style={styles.templatesContainer}>
              {REJECTION_TEMPLATES.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.templateButton}
                  onPress={() => handleTemplatePress(template)}
                >
                  <Text style={styles.templateButtonText}>{template}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Reason Input */}
            <Text style={styles.label}>
              Rejection Reason <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                !isValidReason && reason.trim().length > 0 && styles.textInputError,
              ]}
              placeholder="Please provide a detailed reason for rejection..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />

            {/* Character Counter */}
            <View style={styles.counterContainer}>
              <Text
                style={[
                  styles.counterText,
                  reason.length < 10 && styles.counterTextError,
                  reason.length > 500 && styles.counterTextError,
                ]}
              >
                {reason.length} / 500 characters (min 10)
              </Text>
            </View>

            {/* Helper Text */}
            <Text style={styles.helperText}>
              This reason will be visible to the kitchen owner.
            </Text>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCloseModal}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.rejectButton,
                (!isValidReason || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleReject}
              disabled={!isValidReason || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <MaterialIcons name="block" size={20} color={colors.white} />
                  <Text style={styles.rejectButtonText}>Reject Kitchen</Text>
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
    justifyContent: 'flex-end',
  },
  dialog: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  closeButton: {
    padding: 8,
  },
  iconContainer: {
    alignItems: 'center',
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
    color: colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 12,
  },
  templatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  templateButton: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  templateButtonText: {
    fontSize: 13,
    color: colors.gray700,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.gray900,
    minHeight: 120,
    marginBottom: 8,
  },
  textInputError: {
    borderColor: colors.error,
  },
  counterContainer: {
    marginBottom: 8,
  },
  counterText: {
    fontSize: 12,
    color: colors.gray600,
    textAlign: 'right',
  },
  counterTextError: {
    color: colors.error,
  },
  helperText: {
    fontSize: 12,
    color: colors.gray600,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
