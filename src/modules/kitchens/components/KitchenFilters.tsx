import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { KitchenType, KitchenStatus } from '../../../types/api.types';

export interface KitchenFilters {
  type?: KitchenType | 'ALL';
  status?: KitchenStatus | 'ALL';
  search: string;
}

interface KitchenFiltersComponentProps {
  filters: KitchenFilters;
  onFiltersChange: (filters: KitchenFilters) => void;
  onRefresh: () => void;
}

export const KitchenFiltersComponent: React.FC<KitchenFiltersComponentProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
}) => {
  const [searchText, setSearchText] = useState(filters.search);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    // Debounce search
    setTimeout(() => {
      onFiltersChange({ ...filters, search: text });
    }, 500);
  };

  const handleTypeChange = (type: KitchenType | 'ALL') => {
    onFiltersChange({ ...filters, type });
  };

  const handleStatusChange = (status: KitchenStatus | 'ALL') => {
    onFiltersChange({ ...filters, status });
  };

  const clearFilters = () => {
    setSearchText('');
    onFiltersChange({ type: 'ALL', status: 'ALL', search: '' });
  };

  const hasActiveFilters =
    filters.type !== 'ALL' || filters.status !== 'ALL' || filters.search !== '';

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by kitchen name..."
          placeholderTextColor={colors.textMuted}
          value={searchText}
          onChangeText={handleSearchChange}
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => handleSearchChange('')}>
            <Icon name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        <View style={styles.divider} />
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Icon name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Type Chips */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}>
          <TouchableOpacity
            style={[
              styles.chip,
              filters.type === 'ALL' && styles.chipActive,
            ]}
            onPress={() => handleTypeChange('ALL')}>
            <Text
              style={[
                styles.chipText,
                filters.type === 'ALL' && styles.chipTextActive,
              ]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chip,
              filters.type === 'TIFFSY' && styles.chipActive,
            ]}
            onPress={() => handleTypeChange('TIFFSY')}>
            <Text
              style={[
                styles.chipText,
                filters.type === 'TIFFSY' && styles.chipTextActive,
              ]}>
              Tiffsy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chip,
              filters.type === 'PARTNER' && styles.chipActive,
            ]}
            onPress={() => handleTypeChange('PARTNER')}>
            <Text
              style={[
                styles.chipText,
                filters.type === 'PARTNER' && styles.chipTextActive,
              ]}>
              Partner
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Status Chips */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Status</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}>
          <TouchableOpacity
            style={[
              styles.chip,
              filters.status === 'ALL' && styles.chipActive,
            ]}
            onPress={() => handleStatusChange('ALL')}>
            <Text
              style={[
                styles.chipText,
                filters.status === 'ALL' && styles.chipTextActive,
              ]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chip,
              filters.status === 'ACTIVE' && styles.chipActive,
            ]}
            onPress={() => handleStatusChange('ACTIVE')}>
            <Text
              style={[
                styles.chipText,
                filters.status === 'ACTIVE' && styles.chipTextActive,
              ]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chip,
              filters.status === 'INACTIVE' && styles.chipActive,
            ]}
            onPress={() => handleStatusChange('INACTIVE')}>
            <Text
              style={[
                styles.chipText,
                filters.status === 'INACTIVE' && styles.chipTextActive,
              ]}>
              Inactive
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chip,
              filters.status === 'PENDING_APPROVAL' && styles.chipActive,
            ]}
            onPress={() => handleStatusChange('PENDING_APPROVAL')}>
            <Text
              style={[
                styles.chipText,
                filters.status === 'PENDING_APPROVAL' && styles.chipTextActive,
              ]}>
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chip,
              filters.status === 'SUSPENDED' && styles.chipActive,
            ]}
            onPress={() => handleStatusChange('SUSPENDED')}>
            <Text
              style={[
                styles.chipText,
                filters.status === 'SUSPENDED' && styles.chipTextActive,
              ]}>
              Suspended
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Icon name="filter-off" size={16} color={colors.primary} />
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  section: {
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
