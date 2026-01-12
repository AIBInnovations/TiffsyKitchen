import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image } from 'react-native';
import { MenuItem } from '../../../types/api.types';
import { DietaryBadge } from './DietaryBadge';
import { StatusBadge } from './StatusBadge';

interface MenuItemCardProps {
  item: MenuItem;
  onPress: () => void;
  onToggleAvailability?: (isAvailable: boolean) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onPress,
  onToggleAvailability,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        {item.thumbnailImage && (
          <Image source={{ uri: item.thumbnailImage }} style={styles.image} />
        )}
        <View style={styles.details}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isFeatured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>★</Text>
              </View>
            )}
          </View>

          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.badges}>
            <DietaryBadge dietaryType={item.dietaryType} size="small" />
            <StatusBadge status={item.status} size="small" />
            {item.menuType === 'MEAL_MENU' && item.mealWindow && (
              <View style={styles.mealBadge}>
                <Text style={styles.mealText}>{item.mealWindow}</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <View style={styles.pricing}>
              {item.discountedPrice ? (
                <>
                  <Text style={styles.discountedPrice}>₹{item.discountedPrice}</Text>
                  <Text style={styles.originalPrice}>₹{item.price}</Text>
                </>
              ) : (
                <Text style={styles.price}>₹{item.price}</Text>
              )}
            </View>

            {onToggleAvailability && (
              <View style={styles.availability}>
                <Text style={styles.availabilityLabel}>Available</Text>
                <Switch
                  value={item.isAvailable}
                  onValueChange={onToggleAvailability}
                  trackColor={{ false: '#d1d5db', true: '#86efac' }}
                  thumbColor={item.isAvailable ? '#16a34a' : '#f3f4f6'}
                />
              </View>
            )}
          </View>

          {item.addonIds.length > 0 && (
            <Text style={styles.addonsText}>
              {item.addonIds.length} add-on{item.addonIds.length > 1 ? 's' : ''} available
            </Text>
          )}
        </View>
      </View>

      {item.status === 'DISABLED_BY_ADMIN' && item.disabledReason && (
        <View style={styles.disabledReason}>
          <Text style={styles.disabledReasonText}>Reason: {item.disabledReason}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f3f4f6',
  },
  details: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  featuredBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  featuredText: {
    fontSize: 12,
    color: '#f59e0b',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  mealBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mealText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16a34a',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
  },
  addonsText: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 4,
  },
  disabledReason: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  disabledReasonText: {
    fontSize: 12,
    color: '#dc2626',
  },
});
