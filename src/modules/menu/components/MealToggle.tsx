import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MealType } from '../models/types';
import { colors, spacing } from '../../../theme';

interface MealToggleProps {
  selectedMeal: MealType;
  onMealChange: (meal: MealType) => void;
}

export const MealToggle: React.FC<MealToggleProps> = ({
  selectedMeal,
  onMealChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          selectedMeal === 'LUNCH' && styles.toggleButtonActive,
        ]}
        onPress={() => onMealChange('LUNCH')}
      >
        <MaterialIcons
          name="wb-sunny"
          size={18}
          color={selectedMeal === 'LUNCH' ? colors.white : colors.textSecondary}
        />
        <Text
          style={[
            styles.toggleText,
            selectedMeal === 'LUNCH' && styles.toggleTextActive,
          ]}
        >
          Lunch
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.toggleButton,
          selectedMeal === 'DINNER' && styles.toggleButtonActive,
        ]}
        onPress={() => onMealChange('DINNER')}
      >
        <MaterialIcons
          name="nights-stay"
          size={18}
          color={selectedMeal === 'DINNER' ? colors.white : colors.textSecondary}
        />
        <Text
          style={[
            styles.toggleText,
            selectedMeal === 'DINNER' && styles.toggleTextActive,
          ]}
        >
          Dinner
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    padding: 4,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadiusSm,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  toggleTextActive: {
    color: colors.white,
  },
});

export default MealToggle;
