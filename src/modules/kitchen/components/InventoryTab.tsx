import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  InventoryItem,
  ConsumptionEntry,
  StockStatus,
  stockStatusColors,
} from '../models/types';
import { colors, spacing } from '../../../theme';

interface InventoryTabProps {
  inventoryItems: InventoryItem[];
  consumptionEntries: ConsumptionEntry[];
}

type StockFilter = 'All' | StockStatus;

// Card wrapper component
const Card: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({
  title,
  children,
  action,
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      {action}
    </View>
    {children}
  </View>
);

// Filter Pills
const FilterPills: React.FC<{
  selected: StockFilter;
  onChange: (filter: StockFilter) => void;
  counts: Record<StockFilter, number>;
}> = ({ selected, onChange, counts }) => {
  const filters: StockFilter[] = ['All', 'Critical', 'Low', 'OK'];

  return (
    <View style={styles.filterRow}>
      {filters.map((filter) => {
        const isSelected = selected === filter;
        const count = counts[filter];
        return (
          <TouchableOpacity
            key={filter}
            style={[styles.filterPill, isSelected && styles.filterPillSelected]}
            onPress={() => onChange(filter)}
          >
            <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
              {filter} ({count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Inventory Item Row
const InventoryItemRow: React.FC<{ item: InventoryItem }> = ({ item }) => {
  const statusStyle = stockStatusColors[item.status];

  return (
    <View style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemUpdated}>Updated: {item.lastUpdated}</Text>
      </View>
      <View style={styles.itemStock}>
        <Text style={styles.itemStockValue}>
          {item.currentStock} {item.unit}
        </Text>
        <Text style={styles.itemDays}>~{item.daysRemaining} days</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
        <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
      </View>
    </View>
  );
};

// Consumption Row
const ConsumptionRow: React.FC<{ entry: ConsumptionEntry }> = ({ entry }) => {
  const isNegative = entry.variancePercent < 0;
  const isHigh = Math.abs(entry.variancePercent) > 15;
  const varianceColor = isHigh
    ? isNegative
      ? colors.success
      : colors.error
    : colors.textSecondary;

  return (
    <View style={styles.consumptionRow}>
      <Text style={styles.consumptionName} numberOfLines={1}>
        {entry.ingredientName}
      </Text>
      <Text style={styles.consumptionValue}>
        {entry.plannedUsage} {entry.unit}
      </Text>
      <Text style={styles.consumptionValue}>
        {entry.actualUsage} {entry.unit}
      </Text>
      <View style={styles.varianceContainer}>
        <Text style={[styles.varianceText, { color: varianceColor }]}>
          {entry.variancePercent > 0 ? '+' : ''}
          {entry.variancePercent.toFixed(1)}%
        </Text>
        {isHigh && (
          <View style={[styles.varianceBar, { backgroundColor: varianceColor }]}>
            <View
              style={[
                styles.varianceBarFill,
                {
                  width: `${Math.min(Math.abs(entry.variancePercent), 100)}%`,
                  backgroundColor: varianceColor,
                },
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export const InventoryTab: React.FC<InventoryTabProps> = ({
  inventoryItems,
  consumptionEntries,
}) => {
  const [stockFilter, setStockFilter] = useState<StockFilter>('All');
  const [sortBy, setSortBy] = useState<'name' | 'severity'>('severity');

  // Calculate counts
  const counts = useMemo(() => {
    const result: Record<StockFilter, number> = {
      All: inventoryItems.length,
      OK: inventoryItems.filter((i) => i.status === 'OK').length,
      Low: inventoryItems.filter((i) => i.status === 'Low').length,
      Critical: inventoryItems.filter((i) => i.status === 'Critical').length,
    };
    return result;
  }, [inventoryItems]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = [...inventoryItems];

    // Filter
    if (stockFilter !== 'All') {
      items = items.filter((item) => item.status === stockFilter);
    }

    // Sort
    if (sortBy === 'severity') {
      const severityOrder: Record<StockStatus, number> = { Critical: 0, Low: 1, OK: 2 };
      items.sort((a, b) => severityOrder[a.status] - severityOrder[b.status]);
    } else {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return items;
  }, [inventoryItems, stockFilter, sortBy]);

  return (
    <View style={styles.container}>
      {/* Low Stock Alerts */}
      <Card
        title="Low Stock Alerts"
        action={
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortBy(sortBy === 'name' ? 'severity' : 'name')}
          >
            <MaterialIcons name="sort" size={16} color={colors.textMuted} />
            <Text style={styles.sortButtonText}>
              {sortBy === 'name' ? 'Name' : 'Severity'}
            </Text>
          </TouchableOpacity>
        }
      >
        <FilterPills selected={stockFilter} onChange={setStockFilter} counts={counts} />
        <ScrollView style={styles.itemList} nestedScrollEnabled>
          {filteredItems.map((item) => (
            <InventoryItemRow key={item.id} item={item} />
          ))}
          {filteredItems.length === 0 && (
            <Text style={styles.emptyText}>No items match the filter</Text>
          )}
        </ScrollView>
      </Card>

      {/* Daily Consumption Summary */}
      <Card title="Daily Consumption Summary">
        <View style={styles.consumptionHeader}>
          <Text style={[styles.consumptionHeaderText, { flex: 2 }]}>Ingredient</Text>
          <Text style={styles.consumptionHeaderText}>Planned</Text>
          <Text style={styles.consumptionHeaderText}>Actual</Text>
          <Text style={styles.consumptionHeaderText}>Variance</Text>
        </View>
        {consumptionEntries.map((entry) => (
          <ConsumptionRow key={entry.ingredientId} entry={entry} />
        ))}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusLg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  filterPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.background,
    marginRight: spacing.xs,
  },
  filterPillSelected: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterTextSelected: {
    color: colors.white,
  },
  itemList: {
    maxHeight: 250,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  itemUpdated: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemStock: {
    alignItems: 'flex-end',
    marginRight: spacing.md,
  },
  itemStockValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemDays: {
    fontSize: 10,
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  consumptionHeader: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: spacing.sm,
  },
  consumptionHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    flex: 1,
    textAlign: 'center',
  },
  consumptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  consumptionName: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 2,
  },
  consumptionValue: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  varianceContainer: {
    flex: 1,
    alignItems: 'center',
  },
  varianceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  varianceBar: {
    height: 3,
    width: '100%',
    backgroundColor: colors.divider,
    borderRadius: 2,
    marginTop: 2,
    overflow: 'hidden',
  },
  varianceBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default InventoryTab;
