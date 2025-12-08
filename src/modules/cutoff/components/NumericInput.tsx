import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing } from '../../../theme';

interface NumericInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter number',
  helperText,
  error,
  min = 1,
  max = 9999,
  step = 1,
}) => {
  const handleTextChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText === '') {
      onChange(null);
    } else {
      const num = parseInt(numericText, 10);
      if (num <= max) {
        onChange(num);
      }
    }
  };

  const handleIncrement = () => {
    const currentValue = value || 0;
    const newValue = Math.min(currentValue + step, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const currentValue = value || 0;
    const newValue = Math.max(currentValue - step, min);
    onChange(newValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputRow}>
        <TouchableOpacity
          style={[styles.stepButton, (!value || value <= min) && styles.stepButtonDisabled]}
          onPress={handleDecrement}
          disabled={!value || value <= min}
        >
          <MaterialIcons
            name="remove"
            size={20}
            color={!value || value <= min ? colors.textMuted : colors.primary}
          />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={value?.toString() || ''}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          textAlign="center"
        />

        <TouchableOpacity
          style={[styles.stepButton, (value && value >= max) && styles.stepButtonDisabled]}
          onPress={handleIncrement}
          disabled={value !== null && value >= max}
        >
          <MaterialIcons
            name="add"
            size={20}
            color={value !== null && value >= max ? colors.textMuted : colors.primary}
          />
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  stepButtonDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  inputError: {
    borderColor: colors.error,
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
});

export default NumericInput;
