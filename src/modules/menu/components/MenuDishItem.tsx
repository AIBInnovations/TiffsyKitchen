import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Dish, MenuDish, DishTag, dishTagConfig } from '../models/types';
import { colors, spacing } from '../../../theme';

interface MenuDishItemProps {
  menuDish: MenuDish;
  dish: Dish;
  onRemove: (menuDishId: string) => void;
  onToggleFeatured: (menuDishId: string) => void;
  isDragging?: boolean;
}

// Tag Chip Component
const TagChip: React.FC<{ tag: DishTag }> = ({ tag }) => {
  const config = dishTagConfig[tag];
  return (
    <View style={[styles.tagChip, { backgroundColor: config.bgColor }]}>
      <Text style={[styles.tagText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

export const MenuDishItem: React.FC<MenuDishItemProps> = ({
  menuDish,
  dish,
  onRemove,
  onToggleFeatured,
  isDragging = false,
}) => {
  return (
    <View style={[styles.container, isDragging && styles.containerDragging]}>
      {/* Drag Handle */}
      <View style={styles.dragHandle}>
        <MaterialIcons name="drag-indicator" size={20} color={colors.textMuted} />
      </View>

      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {dish.thumbnailUrl ? (
          <Image source={{ uri: dish.thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <MaterialIcons name="restaurant" size={20} color={colors.textMuted} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.dishName} numberOfLines={1}>
            {dish.name}
          </Text>
          {menuDish.isFeatured && (
            <View style={styles.featuredBadge}>
              <MaterialIcons name="star" size={12} color={colors.warning} />
            </View>
          )}
        </View>

        {dish.description && (
          <Text style={styles.description} numberOfLines={1}>
            {dish.description}
          </Text>
        )}

        <View style={styles.tagsRow}>
          {dish.tags.slice(0, 3).map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
          {dish.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{dish.tags.length - 3}</Text>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onToggleFeatured(menuDish.id)}
        >
          <MaterialIcons
            name={menuDish.isFeatured ? 'star' : 'star-outline'}
            size={20}
            color={menuDish.isFeatured ? colors.warning : colors.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onRemove(menuDish.id)}
        >
          <MaterialIcons name="delete-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  containerDragging: {
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderColor: colors.primary,
  },
  dragHandle: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  thumbnailContainer: {
    marginRight: spacing.sm,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: spacing.borderRadiusSm,
  },
  thumbnailPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: spacing.borderRadiusSm,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dishName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  featuredBadge: {
    marginLeft: spacing.xs,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  tagChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: spacing.xs,
  },
});

export default MenuDishItem;
