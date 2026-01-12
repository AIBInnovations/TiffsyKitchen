import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addonService } from '../../../services/addon.service';
import { Addon } from '../../../types/api.types';
import { DietaryBadge } from '../components/DietaryBadge';

interface AddonLibraryScreenProps {
  kitchenId: string;
  onNavigateToDetail: (addonId?: string) => void;
  onBack: () => void;
}

interface AddonWithUsage extends Addon {
  menuItemCount?: number;
}

export const AddonLibraryScreen: React.FC<AddonLibraryScreenProps> = ({
  kitchenId,
  onNavigateToDetail,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addons, setAddons] = useState<AddonWithUsage[]>([]);
  const [filteredAddons, setFilteredAddons] = useState<AddonWithUsage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ totalCount: 0, activeCount: 0 });

  const fetchAddons = useCallback(async () => {
    try {
      const response = await addonService.getAddonLibrary(kitchenId);
      setAddons(response.addons);
      setFilteredAddons(response.addons);
      setStats({
        totalCount: response.totalCount,
        activeCount: response.activeCount,
      });
    } catch (error) {
      console.error('Error fetching addons:', error);
      Alert.alert('Error', 'Failed to load add-ons');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [kitchenId]);

  useEffect(() => {
    fetchAddons();
  }, [fetchAddons]);

  // Apply search filter
  useEffect(() => {
    if (searchQuery) {
      const filtered = addons.filter(addon =>
        addon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addon.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAddons(filtered);
    } else {
      setFilteredAddons(addons);
    }
  }, [searchQuery, addons]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAddons();
  };

  const handleToggleAvailability = async (addonId: string, currentAvailability: boolean) => {
    try {
      await addonService.toggleAvailability(addonId, !currentAvailability);

      // Update local state
      setAddons(prevAddons =>
        prevAddons.map(addon =>
          addon._id === addonId ? { ...addon, isAvailable: !currentAvailability } : addon
        )
      );
    } catch (error) {
      console.error('Error toggling availability:', error);
      Alert.alert('Error', 'Failed to update availability');
    }
  };

  const handleDelete = (addon: AddonWithUsage) => {
    const usageCount = addon.menuItemCount || 0;

    if (usageCount > 0) {
      Alert.alert(
        'Cannot Delete',
        `This add-on is used in ${usageCount} menu item${usageCount > 1 ? 's' : ''}. Remove it from all menu items first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Add-on',
      `Are you sure you want to delete "${addon.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await addonService.deleteAddon(addon._id);
              Alert.alert('Success', 'Add-on deleted');
              fetchAddons();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete add-on');
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Add-ons Library</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCount}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, styles.activeValue]}>{stats.activeCount}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => onNavigateToDetail(undefined)}
      >
        <Text style={styles.createButtonText}>+ Create New Add-on</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search add-ons..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
  );

  const renderAddonCard = ({ item }: { item: AddonWithUsage }) => (
    <TouchableOpacity
      style={styles.addonCard}
      onPress={() => onNavigateToDetail(item._id)}
      activeOpacity={0.7}
    >
      <View style={styles.addonContent}>
        <View style={styles.addonHeader}>
          <Text style={styles.addonName}>{item.name}</Text>
          <DietaryBadge dietaryType={item.dietaryType} size="small" />
        </View>

        {item.description && (
          <Text style={styles.addonDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.addonFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.addonPrice}>₹{item.price}</Text>
            {item.menuItemCount !== undefined && item.menuItemCount > 0 && (
              <Text style={styles.usageText}>
                Used in {item.menuItemCount} item{item.menuItemCount > 1 ? 's' : ''}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            <View style={styles.availabilityToggle}>
              <Text style={styles.availabilityLabel}>Available</Text>
              <Switch
                value={item.isAvailable}
                onValueChange={() => handleToggleAvailability(item._id, item.isAvailable)}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={item.isAvailable ? '#16a34a' : '#f3f4f6'}
              />
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {item.status === 'INACTIVE' && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveText}>Inactive</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No add-ons found</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => onNavigateToDetail(undefined)}
      >
        <Text style={styles.createButtonText}>Create First Add-on</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f97316" />
      {/* Top Header with Back Button */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>Add-ons Library</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderSearchBar()}
          </>
        }
        data={filteredAddons}
        renderItem={renderAddonCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  topHeader: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  activeValue: {
    color: '#16a34a',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    color: '#111827',
  },
  listContent: {
    padding: 16,
  },
  addonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addonContent: {
    padding: 12,
  },
  addonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addonName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  addonDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  addonFooter: {
    gap: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addonPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  usageText: {
    fontSize: 12,
    color: '#6366f1',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  inactiveBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  inactiveText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
});
