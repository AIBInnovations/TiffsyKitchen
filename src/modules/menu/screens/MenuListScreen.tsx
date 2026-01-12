/**
 * Menu List Screen
 *
 * Displays all menu items with filtering, search, and CRUD operations
 * Uses real API: /api/kitchen/menu-items
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { menuService } from '../../../services/menu.service';
import { MenuItem, MealType, FoodType } from '../../../types/api.types';
import { colors, spacing } from '../../../theme';

interface MenuListScreenProps {
  onMenuPress: () => void;
  onAddItem: () => void;
  onEditItem: (item: MenuItem) => void;
}

type FilterTab = 'ALL' | 'LUNCH' | 'DINNER';
type FoodTypeFilter = 'ALL' | 'VEG' | 'NON_VEG' | 'VEGAN';

export const MenuListScreen: React.FC<MenuListScreenProps> = ({
  onMenuPress,
  onAddItem,
  onEditItem,
}) => {
  const insets = useSafeAreaInsets();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mealTypeFilter, setMealTypeFilter] = useState<FilterTab>('ALL');
  const [foodTypeFilter, setFoodTypeFilter] = useState<FoodTypeFilter>('ALL');
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch menu items from API
   */
  const fetchMenuItems = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params: any = {};
      if (mealTypeFilter !== 'ALL') {
        params.mealType = mealTypeFilter as MealType;
      }
      if (foodTypeFilter !== 'ALL') {
        params.foodType = foodTypeFilter as FoodType;
      }

      const response = await menuService.getMenuItems(params);
      setMenuItems(response.items || []);
    } catch (err: any) {
      console.error('Error fetching menu items:', err);
      setError(err.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [mealTypeFilter, foodTypeFilter]);

  /**
   * Filter items by search query
   */
  const filteredItems = useMemo(() => {
    if (!searchQuery) return menuItems;

    const query = searchQuery.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    );
  }, [menuItems, searchQuery]);

  /**
   * Toggle item availability
   */
  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const updatedItem = await menuService.toggleAvailability(item._id, !item.isAvailable);

      // Update local state
      setMenuItems((prev) =>
        prev.map((i) => (i._id === updatedItem._id ? updatedItem : i))
      );
    } catch (err: any) {
      console.error('Error toggling availability:', err);
      Alert.alert('Error', 'Failed to update availability');
    }
  };

  /**
   * Delete menu item
   */
  const handleDeleteItem = (item: MenuItem) => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await menuService.deleteMenuItem(item._id);
              setMenuItems((prev) => prev.filter((i) => i._id !== item._id));
              Alert.alert('Success', 'Menu item deleted');
            } catch (err: any) {
              console.error('Error deleting item:', err);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  /**
   * Get food type icon
   */
  const getFoodTypeIcon = (foodType: FoodType) => {
    switch (foodType) {
      case 'VEG':
        return '🟢';
      case 'NON_VEG':
        return '🔴';
      case 'VEGAN':
        return '🌿';
      default:
        return '⚪';
    }
  };

  /**
   * Get spice level indicator
   */
  const getSpiceLevelIndicator = (spiceLevel: string) => {
    switch (spiceLevel) {
      case 'LOW':
        return '🌶️';
      case 'MEDIUM':
        return '🌶️🌶️';
      case 'HIGH':
        return '🌶️🌶️🌶️';
      default:
        return '';
    }
  };

  /**
   * Render menu item card
   */
  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuCard}>
      {/* Image */}
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.menuImage}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.menuContent}>
        {/* Header */}
        <View style={styles.menuHeader}>
          <View style={styles.menuTitleRow}>
            <Text style={styles.menuName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.foodTypeIcon}>{getFoodTypeIcon(item.foodType)}</Text>
          </View>
          <View style={styles.menuPrice}>
            <Text style={styles.priceText}>₹{item.price}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.menuDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {item.mealTypes.map((mealType, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{mealType}</Text>
            </View>
          ))}
          {item.isJainFriendly && (
            <View style={[styles.tag, styles.jainTag]}>
              <Text style={styles.tagText}>JAIN</Text>
            </View>
          )}
          <Text style={styles.spiceLevel}>{getSpiceLevelIndicator(item.spiceLevel)}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {/* Availability Toggle */}
          <View style={styles.availabilityContainer}>
            <Text style={styles.availabilityLabel}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
            <Switch
              value={item.isAvailable}
              onValueChange={() => handleToggleAvailability(item)}
              trackColor={{ false: '#d1d5db', true: colors.primary + '80' }}
              thumbColor={item.isAvailable ? colors.primary : '#f3f4f6'}
            />
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEditItem(item)}
          >
            <MaterialIcons name="edit" size={20} color={colors.primary} />
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteItem(item)}
          >
            <MaterialIcons name="delete" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={[styles.header, {paddingTop: insets.top + 8}]}>
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
            <MaterialIcons name="menu" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Menu Management</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading menu items...</Text>
        </View>
      </View>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
            <MaterialIcons name="menu" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Menu Management</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Unable to Load Menu</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchMenuItems()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <MaterialIcons name="menu" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddItem}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search menu items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Meal Type Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, mealTypeFilter === 'ALL' && styles.filterChipActive]}
          onPress={() => setMealTypeFilter('ALL')}
        >
          <Text style={[styles.filterChipText, mealTypeFilter === 'ALL' && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, mealTypeFilter === 'LUNCH' && styles.filterChipActive]}
          onPress={() => setMealTypeFilter('LUNCH')}
        >
          <Text style={[styles.filterChipText, mealTypeFilter === 'LUNCH' && styles.filterChipTextActive]}>
            Lunch
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, mealTypeFilter === 'DINNER' && styles.filterChipActive]}
          onPress={() => setMealTypeFilter('DINNER')}
        >
          <Text style={[styles.filterChipText, mealTypeFilter === 'DINNER' && styles.filterChipTextActive]}>
            Dinner
          </Text>
        </TouchableOpacity>
      </View>

      {/* Food Type Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, foodTypeFilter === 'ALL' && styles.filterChipActive]}
          onPress={() => setFoodTypeFilter('ALL')}
        >
          <Text style={[styles.filterChipText, foodTypeFilter === 'ALL' && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, foodTypeFilter === 'VEG' && styles.filterChipActive]}
          onPress={() => setFoodTypeFilter('VEG')}
        >
          <Text style={[styles.filterChipText, foodTypeFilter === 'VEG' && styles.filterChipTextActive]}>
            🟢 Veg
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, foodTypeFilter === 'NON_VEG' && styles.filterChipActive]}
          onPress={() => setFoodTypeFilter('NON_VEG')}
        >
          <Text style={[styles.filterChipText, foodTypeFilter === 'NON_VEG' && styles.filterChipTextActive]}>
            🔴 Non-Veg
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, foodTypeFilter === 'VEGAN' && styles.filterChipActive]}
          onPress={() => setFoodTypeFilter('VEGAN')}
        >
          <Text style={[styles.filterChipText, foodTypeFilter === 'VEGAN' && styles.filterChipTextActive]}>
            🌿 Vegan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Menu List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item._id}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMenuItems(true)}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="restaurant-menu" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No menu items found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search' : 'Add your first menu item'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: '#1f2937',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: spacing.md,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f3f4f6',
  },
  menuContent: {
    padding: spacing.md,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  menuTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: spacing.xs,
  },
  foodTypeIcon: {
    fontSize: 16,
  },
  menuPrice: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803d',
  },
  menuDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  jainTag: {
    backgroundColor: '#fef3c7',
  },
  tagText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '600',
  },
  spiceLevel: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: spacing.sm,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  availabilityLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginRight: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: spacing.md,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: spacing.sm,
  },
});
