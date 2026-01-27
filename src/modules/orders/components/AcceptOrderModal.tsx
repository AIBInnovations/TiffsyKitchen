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

interface AcceptOrderModalProps {
  visible: boolean;
  orderNumber: string;
  onClose: () => void;
  onAccept: (estimatedPrepTime: number) => Promise<void>;
}

export const AcceptOrderModal: React.FC<AcceptOrderModalProps> = ({
  visible,
  orderNumber,
  onClose,
  onAccept,
}) => {
  const [estimatedPrepTime, setEstimatedPrepTime] = useState('30');
  const [loading, setLoading] = useState(false);
  const { showWarning, showError } = useAlert();

  const handleAccept = async () => {
    const prepTime = parseInt(estimatedPrepTime, 10);

    if (isNaN(prepTime) || prepTime <= 0) {
      showWarning('Invalid Input', 'Please enter a valid preparation time in minutes');
      return;
    }

    if (prepTime > 180) {
      showWarning('Invalid Input', 'Preparation time cannot exceed 180 minutes (3 hours)');
      return;
    }

    setLoading(true);
    try {
      await onAccept(prepTime);
      onClose();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to accept order');
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
            <MaterialIcons name="check-circle" size={24} color={colors.success} />
            <Text style={styles.title}>Accept Order</Text>
          </View>

          <Text style={styles.orderNumber}>{orderNumber}</Text>

          <Text style={styles.label}>Estimated Preparation Time (minutes)</Text>
          <TextInput
            style={styles.input}
            value={estimatedPrepTime}
            onChangeText={setEstimatedPrepTime}
            keyboardType="number-pad"
            placeholder="30"
            placeholderTextColor={colors.textMuted}
          />

          <View style={styles.quickSelect}>
            <Text style={styles.quickSelectLabel}>Quick select:</Text>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setEstimatedPrepTime('15')}
            >
              <Text style={styles.quickButtonText}>15 min</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setEstimatedPrepTime('30')}
            >
              <Text style={styles.quickButtonText}>30 min</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setEstimatedPrepTime('45')}
            >
              <Text style={styles.quickButtonText}>45 min</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setEstimatedPrepTime('60')}
            >
              <Text style={styles.quickButtonText}>60 min</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={handleAccept}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.acceptButtonText}>Accept Order</Text>
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
  input: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: spacing.md,
  },
  quickSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  quickSelectLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  quickButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadiusSm,
    marginRight: spacing.xs,
  },
  quickButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
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
  acceptButton: {
    backgroundColor: colors.success,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
