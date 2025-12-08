import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { UsersFilter, UserRole, UserStatus, SortOption } from '../../types/user';
import { Chip } from '../common/Chip';
import { colors, spacing } from '../../theme';

interface FilterSheetProps {
  visible: boolean;
  filter: UsersFilter;
  onClose: () => void;
  onApply: (filter: Partial<UsersFilter>) => void;
  onReset: () => void;
}

const userRoles: { value: UserRole; label: string }[] = [
  { value: 'customer', label: 'Customer' },
  { value: 'driver', label: 'Driver' },
  { value: 'kitchen_staff', label: 'Kitchen Staff' },
  { value: 'kitchen_admin', label: 'Admin' },
];

const userStatuses: { value: UserStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'UNVERIFIED', label: 'Unverified' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'orders_high', label: 'Most Orders' },
  { value: 'orders_low', label: 'Least Orders' },
];

export const FilterSheet: React.FC<FilterSheetProps> = ({
  visible,
  filter,
  onClose,
  onApply,
  onReset,
}) => {
  const [localFilter, setLocalFilter] = useState<UsersFilter>(filter);

  useEffect(() => {
    setLocalFilter(filter);
  }, [filter, visible]);

  const toggleRole = (role: UserRole) => {
    setLocalFilter((prev) => {
      const roles = prev.userRoles.includes(role)
        ? prev.userRoles.filter((r) => r !== role)
        : [...prev.userRoles, role];
      return { ...prev, userRoles: roles };
    });
  };

  const toggleStatus = (status: UserStatus) => {
    setLocalFilter((prev) => {
      const statuses = prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status];
      return { ...prev, statuses };
    });
  };

  const setSortBy = (sortBy: SortOption) => {
    setLocalFilter((prev) => ({ ...prev, sortBy }));
  };

  const handleApply = () => {
    onApply(localFilter);
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  const hasActiveFilters =
    localFilter.userRoles.length > 0 ||
    localFilter.statuses.length > 0 ||
    localFilter.sortBy !== 'name_asc';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter & Sort</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* User Type Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>User Type</Text>
              <View style={styles.chipContainer}>
                {userRoles.map((role) => (
                  <Chip
                    key={role.value}
                    label={role.label}
                    variant="outlined"
                    size="medium"
                    selected={localFilter.userRoles.includes(role.value)}
                    onPress={() => toggleRole(role.value)}
                    style={styles.chip}
                  />
                ))}
              </View>
            </View>

            {/* Status Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.chipContainer}>
                {userStatuses.map((status) => (
                  <Chip
                    key={status.value}
                    label={status.label}
                    variant="outlined"
                    size="medium"
                    selected={localFilter.statuses.includes(status.value)}
                    onPress={() => toggleStatus(status.value)}
                    style={styles.chip}
                  />
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.sortContainer}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      localFilter.sortBy === option.value && styles.sortOptionActive,
                    ]}
                    onPress={() => setSortBy(option.value)}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        localFilter.sortBy === option.value && styles.sortOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {localFilter.sortBy === option.value && (
                      <MaterialIcons name="check" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleReset}
              disabled={!hasActiveFilters}
            >
              <Text style={[styles.buttonText, styles.resetButtonText, !hasActiveFilters && styles.disabledText]}>
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={[styles.buttonText, styles.applyButtonText]}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: spacing.borderRadiusXl,
    borderTopRightRadius: spacing.borderRadiusXl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  sortContainer: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sortOptionActive: {
    backgroundColor: colors.primaryLight,
  },
  sortOptionText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  sortOptionTextActive: {
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: colors.background,
    marginRight: spacing.sm,
  },
  applyButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resetButtonText: {
    color: colors.textSecondary,
  },
  applyButtonText: {
    color: colors.white,
  },
  disabledText: {
    color: colors.textMuted,
  },
});

FilterSheet.displayName = 'FilterSheet';
