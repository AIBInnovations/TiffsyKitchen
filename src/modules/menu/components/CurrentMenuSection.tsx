import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MenuDish, Dish, MealType, formatDateDisplay, DishTag } from '../models/types';
import { MenuDishItem } from './MenuDishItem';
import { EmptyMenuState } from './EmptyMenuState';
import { colors, spacing } from '../../../theme';

interface CurrentMenuSectionProps {
  selectedDate: Date;
  selectedMealType: MealType;
  menuDishes: MenuDish[];
  dishCatalog: Dish[];
  onAddDishes: () => void;
  onRemoveDish: (menuDishId: string) => void;
  onToggleFeatured: (menuDishId: string) => void;
  onReorderDishes: (reorderedDishes: MenuDish[]) => void;
}

// Warning component for missing dish types
const MenuWarning: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.warningContainer}>
    <MaterialIcons name="warning" size={16} color={colors.warning} />
    <Text style={styles.warningText}>{message}</Text>
  </View>
);

export const CurrentMenuSection: React.FC<CurrentMenuSectionProps> = ({
  selectedDate,
  selectedMealType,
  menuDishes,
  dishCatalog,
  onAddDishes,
  onRemoveDish,
  onToggleFeatured,
}) => {
  const dateDisplay = formatDateDisplay(selectedDate);
  const mealLabel = selectedMealType === 'LUNCH' ? 'Lunch' : 'Dinner';

  // Get dish details for menu dishes
  const dishesWithDetails = useMemo(() => {
    return menuDishes
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((menuDish) => {
        const dish = dishCatalog.find((d) => d.id === menuDish.dishId);
        return { menuDish, dish };
      })
      .filter((item) => item.dish !== undefined) as { menuDish: MenuDish; dish: Dish }[];
  }, [menuDishes, dishCatalog]);

  // Check for warnings
  const warnings = useMemo(() => {
    const warningMessages: string[] = [];

    if (dishesWithDetails.length > 0) {
      // Check if there's at least one veg or jain-friendly dish
      const hasVegOrJain = dishesWithDetails.some(({ dish }) =>
        dish.tags.some((tag: DishTag) => tag === 'VEG' || tag === 'JAIN_FRIENDLY' || tag === 'VEGAN')
      );

      if (!hasVegOrJain) {
        warningMessages.push('No Veg or Jain-friendly dish in this menu. Consider adding one.');
      }

      // Check if all dishes are non-veg
      const allNonVeg = dishesWithDetails.every(({ dish }) =>
        dish.tags.includes('NON_VEG')
      );

      if (allNonVeg) {
        warningMessages.push('Menu contains only non-veg items.');
      }
    }

    return warningMessages;
  }, [dishesWithDetails]);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons
            name={selectedMealType === 'LUNCH' ? 'wb-sunny' : 'nights-stay'}
            size={20}
            color={colors.primary}
          />
          <Text style={styles.headerTitle}>
            {mealLabel} Menu • {dateDisplay}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{dishesWithDetails.length} dishes</Text>
          </View>
        </View>
      </View>

      {/* Warnings */}
      {warnings.length > 0 && (
        <View style={styles.warningsContainer}>
          {warnings.map((warning, index) => (
            <MenuWarning key={index} message={warning} />
          ))}
        </View>
      )}

      {/* Content */}
      {dishesWithDetails.length === 0 ? (
        <EmptyMenuState
          dateDisplay={dateDisplay}
          mealType={mealLabel}
          onAddDishes={onAddDishes}
        />
      ) : (
        <>
          <ScrollView
            style={styles.dishList}
            contentContainerStyle={styles.dishListContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {dishesWithDetails.map(({ menuDish, dish }) => (
              <MenuDishItem
                key={menuDish.id}
                menuDish={menuDish}
                dish={dish}
                onRemove={onRemoveDish}
                onToggleFeatured={onToggleFeatured}
              />
            ))}
          </ScrollView>

          {/* Add More Button */}
          <TouchableOpacity style={styles.addMoreButton} onPress={onAddDishes}>
            <MaterialIcons name="add" size={20} color={colors.primary} />
            <Text style={styles.addMoreText}>Add More Dishes</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadiusSm,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  warningsContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadiusSm,
    marginBottom: spacing.xs,
  },
  warningText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: spacing.xs,
    flex: 1,
  },
  dishList: {
    flex: 1,
  },
  dishListContent: {
    paddingVertical: spacing.sm,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
});

export default CurrentMenuSection;
