import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { ZoneFilters } from '../models/types';
import { ZoneStatus } from '../../../types/api.types';
import zoneService from '../../../services/zone.service';

interface ZoneFiltersProps {
  filters: ZoneFilters;
  onFiltersChange: (filters: ZoneFilters) => void;
  onRefresh: () => void;
}

export const ZoneFiltersComponent: React.FC<ZoneFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
}) => {
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [searchText, setSearchText] = useState(filters.search || '');

  useEffect(() => {
    loadCities();
  }, []);

  // Debounce search input - wait 600ms after user stops typing to make API call
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText !== filters.search) {
        console.log('🔍 Debounced search - Making API call with:', searchText);
        onFiltersChange({ ...filters, search: searchText });
      }
    }, 600);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchText]);

  const loadCities = async () => {
    setLoadingCities(true);
    try {
      const citiesList = await zoneService.getCities('ALL');
      setCities(citiesList);
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleSearchClear = () => {
    setSearchText('');
    onFiltersChange({ ...filters, search: '' });
  };

  const handleStatusChange = (status: ZoneStatus | 'ALL') => {
    onFiltersChange({ ...filters, status });
  };

  const handleCityChange = (city: string) => {
    onFiltersChange({ ...filters, city: city === 'All Cities' ? undefined : city });
    setCityModalVisible(false);
  };

  const clearFilters = () => {
    onFiltersChange({
      city: undefined,
      status: 'ALL',
      orderingEnabled: undefined,
      search: '',
    });
  };

  const hasActiveFilters =
    filters.city ||
    filters.status !== 'ALL' ||
    filters.orderingEnabled !== undefined ||
    filters.search;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pincode, zone, or city..."
          value={searchText}
          onChangeText={handleSearchChange}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchText ? (
          <TouchableOpacity
            onPress={handleSearchClear}
            style={styles.clearSearchButton}
            activeOpacity={0.7}
          >
            <Icon name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
        {searchText && searchText !== filters.search && (
          <View style={styles.searchingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </View>

      {/* Filter Chips Row */}
      <View style={styles.filtersRow}>
        {/* Status Filter */}
        <View style={styles.statusChipsContainer}>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => {
            const isSelected = filters.status === status;
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                onPress={() => handleStatusChange(status)}
                activeOpacity={0.7}>
                <Icon
                  name={
                    status === 'ALL' ? 'format-list-bulleted' :
                    status === 'ACTIVE' ? 'check-circle' :
                    'close-circle'
                  }
                  size={16}
                  color={isSelected ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}>
                  {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* City Filter */}
        <TouchableOpacity
          style={[styles.filterChip, styles.cityChip, filters.city && styles.filterChipActive]}
          onPress={() => setCityModalVisible(true)}
          activeOpacity={0.7}>
          <Icon
            name="map-marker"
            size={16}
            color={filters.city ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.filterChipText,
              filters.city && styles.filterChipTextActive,
            ]}
            numberOfLines={1}>
            {filters.city || 'All Cities'}
          </Text>
          <Icon
            name="chevron-down"
            size={16}
            color={filters.city ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} activeOpacity={0.7}>
          <Icon name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
            activeOpacity={0.7}>
            <Icon name="filter-remove" size={18} color={colors.error} />
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* City Selection Modal */}
      <Modal
        visible={cityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCityModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCityModalVisible(false)}>
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}>
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select City</Text>
              <TouchableOpacity
                onPress={() => setCityModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.7}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {loadingCities ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={['All Cities', ...cities]}
                keyExtractor={(item) => typeof item === 'string' ? item : JSON.stringify(item)}
                renderItem={({ item }) => {
                  // Handle both string and object formats
                  const cityName = typeof item === 'string' ? item : (item as any).city || 'Unknown';
                  const isSelected = (cityName === 'All Cities' && !filters.city) || cityName === filters.city;
                  return (
                    <TouchableOpacity
                      style={[styles.cityItem, isSelected && styles.cityItemSelected]}
                      onPress={() => handleCityChange(cityName)}
                      activeOpacity={0.7}>
                      <Text style={[styles.cityItemText, isSelected && styles.cityItemTextSelected]}>
                        {cityName}
                      </Text>
                      {isSelected ? (
                        <Icon name="check-circle" size={22} color={colors.primary} />
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },

  // Search Bar Design (matching Kitchen Management)
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchContainerFocused: {
    // No special focus styling for simpler design
  },
  searchIconContainer: {
    marginRight: 0,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  clearSearchButton: {
    padding: 8,
    marginLeft: 4,
  },
  searchingIndicator: {
    marginLeft: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  statusChipsContainer: {
    flexDirection: 'row',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusFull,
    backgroundColor: colors.cardBg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.sm,
    gap: 4,
  },
  cityChip: {
    maxWidth: 140,
    marginBottom: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  refreshButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: spacing.borderRadiusFull,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  refreshText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.error,
    gap: 6,
  },
  clearFiltersText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  cityItemSelected: {
    backgroundColor: '#fef3f2',
  },
  cityItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  cityItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 20,
  },
});
