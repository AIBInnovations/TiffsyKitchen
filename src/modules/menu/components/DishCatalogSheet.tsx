import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Dish, DishTag, MealType, dishTagConfig, formatDateDisplay } from '../models/types';
import { colors, spacing } from '../../../theme';

interface DishCatalogSheetProps {
  visible: boolean;
  dishes: Dish[];
  existingDishIds: string[];
  selectedDate: Date;
  mealType: MealType;
  onClose: () => void;
  onAddDishes: (dishIds: string[]) => void;
}

// Filter tags available
const FILTER_TAGS: DishTag[] = ['VEG', 'NON_VEG', 'VEGAN', 'JAIN_FRIENDLY', 'SPICY'];

// Tag Chip Component
const TagChip: React.FC<{ tag: DishTag; small?: boolean }> = ({ tag, small = false }) => {
  const config = dishTagConfig[tag];
  return (
    <View style={[styles.tagChip, { backgroundColor: config.bgColor }, small && styles.tagChipSmall]}>
      <Text style={[styles.tagText, { color: config.color }, small && styles.tagTextSmall]}>
        {config.label}
      </Text>
    </View>
  );
};

// Filter Chip Component
const FilterChip: React.FC<{
  tag: DishTag;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ tag, isSelected, onToggle }) => {
  const config = dishTagConfig[tag];
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isSelected && { backgroundColor: config.bgColor, borderColor: config.color },
      ]}
      onPress={onToggle}
    >
      <MaterialIcons
        name={config.icon}
        size={14}
        color={isSelected ? config.color : colors.textSecondary}
      />
      <Text
        style={[
          styles.filterChipText,
          isSelected && { color: config.color, fontWeight: '600' },
        ]}
      >
        {config.label}
      </Text>
      {isSelected && (
        <MaterialIcons name="close" size={14} color={config.color} style={styles.filterCloseIcon} />
      )}
    </TouchableOpacity>
  );
};

// Dish Item Component
const DishItem: React.FC<{
  dish: Dish;
  isSelected: boolean;
  isInMenu: boolean;
  onToggle: () => void;
}> = ({ dish, isSelected, isInMenu, onToggle }) => {
  return (
    <TouchableOpacity
      style={[
        styles.dishItem,
        isSelected && styles.dishItemSelected,
        isInMenu && styles.dishItemInMenu,
      ]}
      onPress={onToggle}
      disabled={isInMenu}
    >
      {/* Checkbox */}
      <View
        style={[
          styles.checkbox,
          isSelected && styles.checkboxSelected,
          isInMenu && styles.checkboxDisabled,
        ]}
      >
        {isSelected && <MaterialIcons name="check" size={14} color={colors.white} />}
        {isInMenu && <MaterialIcons name="check" size={14} color={colors.textMuted} />}
      </View>

      {/* Thumbnail */}
      <View style={styles.dishThumbnail}>
        {dish.thumbnailUrl ? (
          <Image source={{ uri: dish.thumbnailUrl }} style={styles.dishImage} />
        ) : (
          <View style={styles.dishImagePlaceholder}>
            <MaterialIcons name="restaurant" size={18} color={colors.textMuted} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.dishContent}>
        <Text style={[styles.dishName, isInMenu && styles.dishNameDisabled]} numberOfLines={1}>
          {dish.name}
        </Text>
        {dish.description && (
          <Text style={styles.dishDescription} numberOfLines={1}>
            {dish.description}
          </Text>
        )}
        <View style={styles.dishTags}>
          {dish.tags.slice(0, 3).map((tag) => (
            <TagChip key={tag} tag={tag} small />
          ))}
        </View>
      </View>

      {/* Already in menu indicator */}
      {isInMenu && (
        <View style={styles.inMenuBadge}>
          <Text style={styles.inMenuText}>In menu</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const DishCatalogSheet: React.FC<DishCatalogSheetProps> = ({
  visible,
  dishes,
  existingDishIds,
  selectedDate,
  mealType,
  onClose,
  onAddDishes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<DishTag[]>([]);
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);

  const mealLabel = mealType === 'LUNCH' ? 'Lunch' : 'Dinner';
  const dateDisplay = formatDateDisplay(selectedDate);

  // Filter dishes based on search and tags
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        dish.name.toLowerCase().includes(searchLower) ||
        dish.description?.toLowerCase().includes(searchLower);

      // Tag filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => dish.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [dishes, searchQuery, selectedTags]);

  // Group dishes by category
  const groupedDishes = useMemo(() => {
    const groups: Record<string, Dish[]> = {};

    filteredDishes.forEach((dish) => {
      const category = dish.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(dish);
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredDishes]);

  // Toggle tag filter
  const toggleTag = useCallback((tag: DishTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // Toggle dish selection
  const toggleDish = useCallback((dishId: string) => {
    if (existingDishIds.includes(dishId)) return;

    setSelectedDishIds((prev) =>
      prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]
    );
  }, [existingDishIds]);

  // Handle add dishes
  const handleAdd = useCallback(() => {
    if (selectedDishIds.length > 0) {
      onAddDishes(selectedDishIds);
      setSelectedDishIds([]);
      setSearchQuery('');
      setSelectedTags([]);
    }
  }, [selectedDishIds, onAddDishes]);

  // Handle close
  const handleClose = useCallback(() => {
    setSelectedDishIds([]);
    setSearchQuery('');
    setSelectedTags([]);
    onClose();
  }, [onClose]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
  }, []);

  const hasActiveFilters = searchQuery.length > 0 || selectedTags.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.grabHandle} />
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Add Dishes</Text>
              <Text style={styles.headerSubtitle}>
                {mealLabel} on {dateDisplay}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialIcons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search dishes..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTER_TAGS.map((tag) => (
            <FilterChip
              key={tag}
              tag={tag}
              isSelected={selectedTags.includes(tag)}
              onToggle={() => toggleTag(tag)}
            />
          ))}
          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Clear all</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Results count */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>
            {filteredDishes.length} dish{filteredDishes.length !== 1 ? 'es' : ''} found
          </Text>
          {selectedDishIds.length > 0 && (
            <Text style={styles.selectedText}>
              {selectedDishIds.length} selected
            </Text>
          )}
        </View>

        {/* Dish List */}
        <ScrollView
          style={styles.dishList}
          contentContainerStyle={styles.dishListContent}
          showsVerticalScrollIndicator={false}
        >
          {groupedDishes.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No dishes match your filters</Text>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            groupedDishes.map(([category, categoryDishes]) => (
              <View key={category} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {categoryDishes.map((dish) => (
                  <DishItem
                    key={dish.id}
                    dish={dish}
                    isSelected={selectedDishIds.includes(dish.id)}
                    isInMenu={existingDishIds.includes(dish.id)}
                    onToggle={() => toggleDish(dish.id)}
                  />
                ))}
              </View>
            ))
          )}
        </ScrollView>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.addButton,
              selectedDishIds.length === 0 && styles.addButtonDisabled,
            ]}
            onPress={handleAdd}
            disabled={selectedDishIds.length === 0}
          >
            <MaterialIcons name="add" size={18} color={colors.white} />
            <Text style={styles.addButtonText}>
              Add {selectedDishIds.length > 0 ? `${selectedDishIds.length} ` : ''}
              {selectedDishIds.length === 1 ? 'Dish' : 'Dishes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  grabHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  searchContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.gray800,
    marginLeft: spacing.xs,
    paddingVertical: spacing.xs,
  },
  filterScroll: {
    backgroundColor: colors.white,
    maxHeight: 48,
  },
  filterContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.white,
    marginRight: spacing.xs,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  filterCloseIcon: {
    marginLeft: 4,
  },
  clearFiltersButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearFiltersText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  resultsText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  dishList: {
    flex: 1,
  },
  dishListContent: {
    paddingBottom: spacing.lg,
  },
  categorySection: {
    marginTop: spacing.sm,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dishItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dishItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  dishItemInMenu: {
    opacity: 0.6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxDisabled: {
    backgroundColor: colors.background,
    borderColor: colors.divider,
  },
  dishThumbnail: {
    marginRight: spacing.sm,
  },
  dishImage: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadiusSm,
  },
  dishImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadiusSm,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dishContent: {
    flex: 1,
  },
  dishName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dishNameDisabled: {
    color: colors.textMuted,
  },
  dishDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  dishTags: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  tagChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  tagChipSmall: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tagTextSmall: {
    fontSize: 9,
  },
  inMenuBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inMenuText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  clearButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: spacing.borderRadiusSm,
  },
  clearButtonText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
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
  addButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    backgroundColor: colors.primary,
  },
  addButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.xs,
  },
});

export default DishCatalogSheet;
