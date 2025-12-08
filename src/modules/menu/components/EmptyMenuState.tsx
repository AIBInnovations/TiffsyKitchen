import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing } from '../../../theme';

interface EmptyMenuStateProps {
  dateDisplay: string;
  mealType: string;
  onAddDishes: () => void;
}

export const EmptyMenuState: React.FC<EmptyMenuStateProps> = ({
  dateDisplay,
  mealType,
  onAddDishes,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="restaurant-menu" size={48} color={colors.textMuted} />
      </View>

      <Text style={styles.title}>No dishes configured</Text>
      <Text style={styles.subtitle}>
        No dishes have been added for {mealType} on {dateDisplay} yet.
      </Text>

      <TouchableOpacity style={styles.addButton} onPress={onAddDishes}>
        <MaterialIcons name="add" size={20} color={colors.white} />
        <Text style={styles.addButtonText}>Add Dishes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.xs,
  },
});

export default EmptyMenuState;
