import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { adminDriversService } from '../../../services/admin-drivers.service';

interface AuditLog {
  _id: string;
  action: string;
  performedBy: {
    _id: string;
    name: string;
    role: string;
  };
  details: {
    reason?: string;
    driverName?: string;
    previousStatus?: string;
    newStatus?: string;
    changes?: any;
  };
  createdAt: string;
}

interface DriverActivityLogProps {
  driverId: string;
}

const ACTION_ICONS: Record<string, { icon: string; color: string }> = {
  APPROVE_DRIVER: { icon: 'check-circle', color: colors.success },
  REJECT_DRIVER: { icon: 'cancel', color: colors.error },
  ACTIVATE: { icon: 'play-circle-filled', color: colors.success },
  DEACTIVATE: { icon: 'pause-circle-filled', color: colors.textMuted },
  SUSPEND: { icon: 'block', color: colors.error },
  DELETE: { icon: 'delete-forever', color: colors.error },
  UPDATE: { icon: 'edit', color: colors.info },
  CREATE: { icon: 'add-circle', color: colors.primary },
};

const ACTION_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Approve', value: 'APPROVE_DRIVER' },
  { label: 'Reject', value: 'REJECT_DRIVER' },
  { label: 'Activate', value: 'ACTIVATE' },
  { label: 'Deactivate', value: 'DEACTIVATE' },
  { label: 'Suspend', value: 'SUSPEND' },
  { label: 'Delete', value: 'DELETE' },
  { label: 'Update', value: 'UPDATE' },
];

export const DriverActivityLog: React.FC<DriverActivityLogProps> = ({ driverId }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs(1, true);
  }, [driverId, selectedAction]);

  const fetchLogs = async (page: number, reset: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminDriversService.getAuditLogs({
        userId: driverId,
        action: selectedAction || undefined,
        page,
        limit: 10,
      });

      const newLogs = response.data?.logs || [];
      setLogs(reset ? newLogs : [...logs, ...newLogs]);
      setCurrentPage(page);
      setHasMore(newLogs.length === 10);
    } catch (error: any) {
      console.error('Failed to fetch activity logs:', error);
      if (error.message?.toLowerCase().includes('unauthorized') || error.status === 401) {
        setError('unauthorized');
      } else {
        setError('general');
      }
      if (reset) {
        setLogs([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchLogs(currentPage + 1, false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ', ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatActionText = (log: AuditLog): string => {
    const action = log.action.replace(/_/g, ' ');
    const performedBy = log.performedBy?.name || 'System';

    return `${action} by ${performedBy}`;
  };

  const renderLogItem = ({ item }: { item: AuditLog }) => {
    const actionConfig = ACTION_ICONS[item.action] || {
      icon: 'circle',
      color: colors.textMuted,
    };

    return (
      <View style={styles.logItem}>
        <View style={styles.logIconContainer}>
          <MaterialIcons
            name={actionConfig.icon as any}
            size={24}
            color={actionConfig.color}
          />
        </View>

        <View style={styles.logContent}>
          <View style={styles.logHeader}>
            <Text style={styles.logDate}>{formatDate(item.createdAt)}</Text>
          </View>

          <Text style={styles.logAction}>{formatActionText(item)}</Text>

          {item.details?.reason && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsLabel}>Reason:</Text>
              <Text style={styles.detailsText}>{item.details.reason}</Text>
            </View>
          )}

          {item.details?.previousStatus && item.details?.newStatus && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsLabel}>Status changed:</Text>
              <Text style={styles.detailsText}>
                {item.details.previousStatus} → {item.details.newStatus}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading && logs.length === 0) return null;

    if (error === 'unauthorized') {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="lock" size={64} color={colors.warning} />
          <Text style={styles.emptyTitle}>Audit Logs Unavailable</Text>
          <Text style={styles.emptySubtitle}>
            Activity logs are not accessible. This feature may require additional permissions or is not yet configured on the server.
          </Text>
        </View>
      );
    }

    if (error === 'general') {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <Text style={styles.emptyTitle}>Failed to Load Activity</Text>
          <Text style={styles.emptySubtitle}>
            Unable to load activity logs. Please try again later.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchLogs(1, true)}
          >
            <MaterialIcons name="refresh" size={20} color={colors.white} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="history" size={64} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No Activity Found</Text>
        <Text style={styles.emptySubtitle}>
          {selectedAction
            ? 'No activities match the selected filter'
            : 'No activity logged for this driver yet'}
        </Text>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersLabel}>Filter by action:</Text>
        <View style={styles.filterChips}>
          {ACTION_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                selectedAction === filter.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedAction(filter.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedAction === filter.value && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Activity List */}
      <View style={styles.listContent}>
        {isLoading && logs.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : logs.length === 0 ? (
          renderEmpty()
        ) : (
          <>
            {logs.map((item) => renderLogItem({ item }))}
            {hasMore && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.loadMoreText}>Load More</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  logItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  logIconContainer: {
    width: 40,
    alignItems: 'center',
    paddingTop: 4,
  },
  logContent: {
    flex: 1,
    paddingLeft: 12,
  },
  logHeader: {
    marginBottom: 4,
  },
  logDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  logAction: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  detailsContainer: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
  },
  detailsLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  detailsText: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
