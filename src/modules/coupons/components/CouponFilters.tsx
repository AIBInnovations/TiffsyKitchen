import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { CouponFiltersState, STATUS_OPTIONS, DISCOUNT_TYPE_OPTIONS } from '../models/types';

interface CouponFiltersProps {
  filters: CouponFiltersState;
  onFiltersChange: (filters: CouponFiltersState) => void;
  onRefresh: () => void;
}

export const CouponFiltersComponent: React.FC<CouponFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
}) => {
  const [searchText, setSearchText] = useState(filters.search || '');

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText !== filters.search) {
        onFiltersChange({ ...filters, search: searchText });
      }
    }, 600);
    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const handleSearchClear = () => {
    setSearchText('');
    onFiltersChange({ ...filters, search: '' });
  };

  const hasActiveFilters =
    filters.status !== 'ALL' ||
    filters.discountType !== 'ALL' ||
    filters.search;

  const clearFilters = () => {
    setSearchText('');
    onFiltersChange({ status: 'ALL', discountType: 'ALL', search: '' });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by code or name..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchText ? (
          <TouchableOpacity onPress={handleSearchClear} style={styles.clearSearchButton} activeOpacity={0.7}>
            <Icon name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
        {searchText && searchText !== filters.search && (
          <View style={styles.searchingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </View>

      {/* Status Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
        {STATUS_OPTIONS.map((option) => {
          const isSelected = filters.status === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => onFiltersChange({ ...filters, status: option.value })}
              activeOpacity={0.7}
            >
              <View style={[styles.chipDot, { backgroundColor: isSelected ? option.color : colors.textMuted }]} />
              <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Discount Type Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
        <TouchableOpacity
          style={[styles.filterChip, filters.discountType === 'ALL' && styles.filterChipActive]}
          onPress={() => onFiltersChange({ ...filters, discountType: 'ALL' })}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filters.discountType === 'ALL' && styles.filterChipTextActive]}>
            All Types
          </Text>
        </TouchableOpacity>
        {DISCOUNT_TYPE_OPTIONS.map((option) => {
          const isSelected = filters.discountType === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => onFiltersChange({ ...filters, discountType: option.value })}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} activeOpacity={0.7}>
          <Icon name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters} activeOpacity={0.7}>
            <Icon name="filter-remove" size={18} color={colors.error} />
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}
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
  chipsRow: {
    marginBottom: spacing.sm,
  },
  chipsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusFull,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.sm,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.error,
    gap: 6,
  },
  clearFiltersText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
  },
});
