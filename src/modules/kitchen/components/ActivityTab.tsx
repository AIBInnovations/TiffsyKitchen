import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ActivityLogEntry, ActivityCategory } from '../models/types';
import { colors, spacing } from '../../../theme';

interface ActivityTabProps {
  activityLog: ActivityLogEntry[];
}

// Category filter options
const CATEGORY_FILTERS: { key: ActivityCategory; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'list' },
  { key: 'status', label: 'Status', icon: 'power-settings-new' },
  { key: 'capacity', label: 'Capacity', icon: 'trending-up' },
  { key: 'cutoff', label: 'Cut-off', icon: 'schedule' },
  { key: 'staff', label: 'Staff', icon: 'people' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
];

// Category colors
const categoryColors: Record<Exclude<ActivityCategory, 'all'>, string> = {
  status: '#3b82f6',
  capacity: '#8b5cf6',
  cutoff: '#f97316',
  staff: '#06b6d4',
  settings: '#6b7280',
};

// Card wrapper component
const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

// Filter Pills
const FilterPills: React.FC<{
  selected: ActivityCategory;
  onChange: (filter: ActivityCategory) => void;
}> = ({ selected, onChange }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.filterScroll}
    contentContainerStyle={styles.filterContainer}
  >
    {CATEGORY_FILTERS.map((filter) => {
      const isSelected = selected === filter.key;
      return (
        <TouchableOpacity
          key={filter.key}
          style={[styles.filterPill, isSelected && styles.filterPillSelected]}
          onPress={() => onChange(filter.key)}
        >
          <MaterialIcons
            name={filter.icon}
            size={14}
            color={isSelected ? colors.white : colors.textSecondary}
          />
          <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

// Activity Log Entry Row
const ActivityRow: React.FC<{ entry: ActivityLogEntry; isLast: boolean }> = ({ entry, isLast }) => {
  const categoryColor = categoryColors[entry.category];

  return (
    <View style={styles.activityRow}>
      {/* Timeline line */}
      <View style={styles.timelineContainer}>
        <View style={[styles.timelineDot, { backgroundColor: categoryColor }]}>
          <MaterialIcons name={entry.icon} size={12} color={colors.white} />
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      {/* Content */}
      <View style={styles.activityContent}>
        <Text style={styles.activityDescription}>{entry.description}</Text>
        <View style={styles.activityMeta}>
          <Text style={styles.activityActor}>{entry.actor}</Text>
          <Text style={styles.activityTime}>{entry.timestamp}</Text>
        </View>
      </View>
    </View>
  );
};

// Empty State
const EmptyState: React.FC<{ filter: ActivityCategory }> = ({ filter }) => (
  <View style={styles.emptyState}>
    <MaterialIcons name="history" size={48} color={colors.textMuted} />
    <Text style={styles.emptyText}>
      {filter === 'all'
        ? 'No activity recorded yet'
        : `No ${filter} changes recorded`}
    </Text>
  </View>
);

export const ActivityTab: React.FC<ActivityTabProps> = ({ activityLog }) => {
  const [categoryFilter, setCategoryFilter] = useState<ActivityCategory>('all');

  // Filter log entries
  const filteredLog = useMemo(() => {
    if (categoryFilter === 'all') {
      return activityLog;
    }
    return activityLog.filter((entry) => entry.category === categoryFilter);
  }, [activityLog, categoryFilter]);

  // Group by date
  const groupedLog = useMemo(() => {
    const groups: Record<string, ActivityLogEntry[]> = {};

    filteredLog.forEach((entry) => {
      // Extract date from timestamp (assumes format like "2025-12-08 10:45 AM")
      const date = entry.timestamp.split(' ')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });

    return Object.entries(groups).map(([date, entries]) => ({
      date,
      entries,
    }));
  }, [filteredLog]);

  const formatDateHeader = (dateStr: string): string => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';

    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <View style={styles.container}>
      <Card title="Recent Activity">
        <FilterPills selected={categoryFilter} onChange={setCategoryFilter} />

        <ScrollView style={styles.logContainer} nestedScrollEnabled>
          {groupedLog.length === 0 ? (
            <EmptyState filter={categoryFilter} />
          ) : (
            groupedLog.map((group) => (
              <View key={group.date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{formatDateHeader(group.date)}</Text>
                {group.entries.map((entry, index) => (
                  <ActivityRow
                    key={entry.id}
                    entry={entry}
                    isLast={index === group.entries.length - 1}
                  />
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    flex: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusLg,
    padding: spacing.md,
    flex: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  filterScroll: {
    marginBottom: spacing.md,
  },
  filterContainer: {
    paddingRight: spacing.md,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 4,
  },
  filterTextSelected: {
    color: colors.white,
  },
  logContainer: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: spacing.md,
  },
  dateHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  activityRow: {
    flexDirection: 'row',
  },
  timelineContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.divider,
    marginVertical: 4,
  },
  activityContent: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  activityDescription: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  activityMeta: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  activityActor: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
    marginRight: spacing.sm,
  },
  activityTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});

export default ActivityTab;
