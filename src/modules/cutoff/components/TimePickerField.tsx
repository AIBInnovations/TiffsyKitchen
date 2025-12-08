import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { TimeValue, parseTimeString, formatTimeToDisplay, formatTimeToString } from '../models/types';
import { colors, spacing } from '../../../theme';

interface TimePickerFieldProps {
  label: string;
  value: string; // "HH:MM" format
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
}

// Generate hour options (1-12)
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
// Generate minute options (00, 15, 30, 45)
const MINUTES = [0, 15, 30, 45];
const PERIODS = ['AM', 'PM'] as const;

export const TimePickerField: React.FC<TimePickerFieldProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const currentTime = parseTimeString(value);

  // Convert 24h to 12h format for picker
  const hour12 = currentTime.hours % 12 || 12;
  const period: 'AM' | 'PM' = currentTime.hours >= 12 ? 'PM' : 'AM';

  const [selectedHour, setSelectedHour] = useState(hour12);
  const [selectedMinute, setSelectedMinute] = useState(
    MINUTES.includes(currentTime.minutes) ? currentTime.minutes : 0
  );
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(period);

  const displayValue = formatTimeToDisplay(currentTime);

  const handleOpenPicker = () => {
    // Reset picker state to current value
    const time = parseTimeString(value);
    setSelectedHour(time.hours % 12 || 12);
    setSelectedMinute(MINUTES.includes(time.minutes) ? time.minutes : 0);
    setSelectedPeriod(time.hours >= 12 ? 'PM' : 'AM');
    setShowPicker(true);
  };

  const handleConfirm = () => {
    // Convert 12h back to 24h
    let hours24 = selectedHour;
    if (selectedPeriod === 'AM') {
      hours24 = selectedHour === 12 ? 0 : selectedHour;
    } else {
      hours24 = selectedHour === 12 ? 12 : selectedHour + 12;
    }

    const newTime: TimeValue = { hours: hours24, minutes: selectedMinute };
    onChange(formatTimeToString(newTime));
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={[styles.inputContainer, error && styles.inputError]}
        onPress={handleOpenPicker}
      >
        <MaterialIcons name="schedule" size={20} color={colors.textSecondary} />
        <Text style={styles.inputText}>{displayValue}</Text>
        <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}

      {/* Time Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              {/* Hour Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hour</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {HOURS.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.pickerItem,
                        selectedHour === hour && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedHour === hour && styles.pickerItemTextSelected,
                        ]}
                      >
                        {hour.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Minute Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minute</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {MINUTES.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.pickerItem,
                        selectedMinute === minute && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMinute === minute && styles.pickerItemTextSelected,
                        ]}
                      >
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Period Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>AM/PM</Text>
                <View style={styles.periodContainer}>
                  {PERIODS.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.periodItem,
                        selectedPeriod === p && styles.periodItemSelected,
                      ]}
                      onPress={() => setSelectedPeriod(p)}
                    >
                      <Text
                        style={[
                          styles.periodItemText,
                          selectedPeriod === p && styles.periodItemTextSelected,
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Selected Time:</Text>
              <Text style={styles.previewValue}>
                {selectedHour.toString().padStart(2, '0')}:
                {selectedMinute.toString().padStart(2, '0')} {selectedPeriod}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusLg,
    width: '90%',
    maxWidth: 360,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  pickerScroll: {
    height: 160,
    width: '100%',
  },
  pickerItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderRadius: spacing.borderRadiusSm,
    marginVertical: 2,
  },
  pickerItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  pickerItemText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  pickerItemTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  periodContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  periodItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderRadius: spacing.borderRadiusSm,
    marginVertical: 4,
  },
  periodItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  periodItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  periodItemTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: spacing.borderRadiusMd,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  previewLabel: {
    fontSize: 13,
    color: colors.success,
    marginRight: spacing.sm,
  },
  previewValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});

export default TimePickerField;
