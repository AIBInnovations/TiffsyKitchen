import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAlert } from '../../../hooks/useAlert';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { adminDriversService } from '../../../services/admin-drivers.service';
import type { Driver } from '../../../types/driver.types';

interface EditVehicleModalProps {
  visible: boolean;
  driver: Driver;
  onClose: () => void;
  onSuccess: () => void;
}

const VEHICLE_TYPES = [
  { label: 'Bike', value: 'BIKE' },
  { label: 'Scooter', value: 'SCOOTER' },
  { label: 'Bicycle', value: 'BICYCLE' },
  { label: 'Other', value: 'OTHER' },
];

export const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
  visible,
  driver,
  onClose,
  onSuccess,
}) => {
  const [vehicleName, setVehicleName] = useState(driver.driverDetails?.vehicleName || '');
  const [vehicleNumber, setVehicleNumber] = useState(driver.driverDetails?.vehicleNumber || '');
  const [vehicleType, setVehicleType] = useState(driver.driverDetails?.vehicleType || 'BIKE');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    vehicleName?: string;
    vehicleNumber?: string;
  }>({});
  const { showSuccess, showError, showInfo } = useAlert();

  const validateForm = (): boolean => {
    const newErrors: { vehicleName?: string; vehicleNumber?: string } = {};

    // Validate vehicle name
    if (vehicleName.trim() && vehicleName.trim().length < 2) {
      newErrors.vehicleName = 'Vehicle name must be at least 2 characters';
    }

    // Validate vehicle number format (e.g., MH12AB1234)
    if (vehicleNumber.trim()) {
      const vehicleNumberRegex = /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}$/;
      const upperVehicleNumber = vehicleNumber.trim().toUpperCase();
      if (!vehicleNumberRegex.test(upperVehicleNumber)) {
        newErrors.vehicleNumber =
          'Invalid format. Example: MH12AB1234 (State code + digits + letters + 4 digits)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const updates: {
        vehicleName?: string;
        vehicleNumber?: string;
        vehicleType?: string;
      } = {};

      if (vehicleName.trim() !== (driver.driverDetails?.vehicleName || '')) {
        updates.vehicleName = vehicleName.trim();
      }
      if (vehicleNumber.trim().toUpperCase() !== (driver.driverDetails?.vehicleNumber || '')) {
        updates.vehicleNumber = vehicleNumber.trim().toUpperCase();
      }
      if (vehicleType !== (driver.driverDetails?.vehicleType || 'BIKE')) {
        updates.vehicleType = vehicleType;
      }

      if (Object.keys(updates).length === 0) {
        showInfo('No Changes', 'No changes were made to the vehicle details.');
        onClose();
        return;
      }

      await adminDriversService.updateVehicle(updates);
      showSuccess('Success', 'Vehicle details updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to update vehicle details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setVehicleName(driver.driverDetails?.vehicleName || '');
    setVehicleNumber(driver.driverDetails?.vehicleNumber || '');
    setVehicleType(driver.driverDetails?.vehicleType || 'BIKE');
    setErrors({});
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Vehicle Details</Text>
            <TouchableOpacity onPress={handleClose} disabled={isLoading}>
              <MaterialIcons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.form}>
            {/* Vehicle Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Name</Text>
              <TextInput
                style={[styles.input, errors.vehicleName && styles.inputError]}
                value={vehicleName}
                onChangeText={(text) => {
                  setVehicleName(text);
                  if (errors.vehicleName)
                    setErrors({ ...errors, vehicleName: undefined });
                }}
                placeholder="e.g., Honda Activa"
                placeholderTextColor={colors.textMuted}
                editable={!isLoading}
              />
              {errors.vehicleName && (
                <Text style={styles.errorText}>{errors.vehicleName}</Text>
              )}
            </View>

            {/* Vehicle Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Number</Text>
              <TextInput
                style={[styles.input, errors.vehicleNumber && styles.inputError]}
                value={vehicleNumber}
                onChangeText={(text) => {
                  setVehicleNumber(text.toUpperCase());
                  if (errors.vehicleNumber)
                    setErrors({ ...errors, vehicleNumber: undefined });
                }}
                placeholder="e.g., MH12AB1234"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                editable={!isLoading}
              />
              {errors.vehicleNumber && (
                <Text style={styles.errorText}>{errors.vehicleNumber}</Text>
              )}
              <Text style={styles.hint}>
                Format: State code (2 letters) + District (1-2 digits) + Series (0-3 letters) + Number (4 digits)
              </Text>
            </View>

            {/* Vehicle Type Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Type</Text>
              <View style={styles.typeSelector}>
                {VEHICLE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      vehicleType === type.value && styles.typeButtonActive,
                    ]}
                    onPress={() => setVehicleType(type.value)}
                    disabled={isLoading}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        vehicleType === type.value && styles.typeButtonTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
              style={[styles.button, styles.saveButton, isLoading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
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
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  inputError: {
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
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  typeButtonTextActive: {
    color: colors.white,
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
    minWidth: 100,
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
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
