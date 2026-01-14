import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing } from '../../../theme';
import { deliveryService } from '../../../services/delivery.service';
import { Batch, BatchStatus, MealWindow } from '../../../types/api.types';

interface BatchManagementTabProps {
  kitchenId?: string;
}

// Helper function to check if dispatch is allowed based on time
const canDispatchMealWindow = (mealWindow: MealWindow): boolean => {
  const now = new Date();
  const currentHour = now.getHours();

  if (mealWindow === 'LUNCH') {
    return currentHour >= 13; // After 1 PM
  } else {
    return currentHour >= 22; // After 10 PM
  }
};

const getTimeUntilDispatch = (mealWindow: MealWindow): string => {
  const now = new Date();
  const currentHour = now.getHours();

  if (mealWindow === 'LUNCH') {
    const hoursLeft = 13 - currentHour;
    return hoursLeft > 0 ? `${hoursLeft} hour(s)` : 'Now';
  } else {
    const hoursLeft = 22 - currentHour;
    return hoursLeft > 0 ? `${hoursLeft} hour(s)` : 'Now';
  }
};

// Status badge colors
const getStatusColor = (status: BatchStatus): { bg: string; text: string } => {
  switch (status) {
    case 'COLLECTING':
      return { bg: '#dbeafe', text: '#2563eb' };
    case 'READY_FOR_DISPATCH':
      return { bg: '#fef3c7', text: '#d97706' };
    case 'DISPATCHED':
      return { bg: '#fce7f3', text: '#db2777' };
    case 'IN_PROGRESS':
      return { bg: '#e0e7ff', text: '#6366f1' };
    case 'COMPLETED':
      return { bg: '#dcfce7', text: '#16a34a' };
    case 'PARTIAL_COMPLETE':
      return { bg: '#fed7aa', text: '#ea580c' };
    case 'CANCELLED':
      return { bg: '#fee2e2', text: '#dc2626' };
    default:
      return { bg: '#f3f4f6', text: '#6b7280' };
  }
};

export const BatchManagementTab: React.FC<BatchManagementTabProps> = ({ kitchenId }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBatching, setIsBatching] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [selectedMealWindow, setSelectedMealWindow] = useState<MealWindow>('LUNCH');
  const [filterStatus, setFilterStatus] = useState<BatchStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadBatches();
  }, [kitchenId, filterStatus]);

  const loadBatches = async () => {
    setIsLoading(true);
    try {
      // Note: You'll need to add the getBatches method to delivery.service.ts
      // For now, this will be empty until backend is connected
      setBatches([]);
    } catch (error) {
      console.error('Error loading batches:', error);
      Alert.alert('Error', 'Failed to load batches');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleAutoBatch = async () => {
    if (!kitchenId) {
      Alert.alert('Error', 'Kitchen ID is required for batching');
      return;
    }

    Alert.alert(
      'Auto-Batch Orders',
      `Create batches for ${selectedMealWindow} orders?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Batch Orders',
          onPress: async () => {
            setIsBatching(true);
            try {
              const result = await deliveryService.autoBatchOrders({
                mealWindow: selectedMealWindow,
                kitchenId,
              });

              Alert.alert(
                'Success',
                `Created ${result.data.batchesCreated} batch(es) with ${result.data.ordersProcessed} order(s)`
              );

              await loadBatches();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to create batches');
            } finally {
              setIsBatching(false);
            }
          },
        },
      ]
    );
  };

  const handleDispatch = async () => {
    if (!canDispatchMealWindow(selectedMealWindow)) {
      Alert.alert(
        'Cannot Dispatch Yet',
        `${selectedMealWindow} meal window ends in ${getTimeUntilDispatch(selectedMealWindow)}. Dispatch is only allowed after the meal window ends.`
      );
      return;
    }

    Alert.alert(
      'Dispatch Batches',
      `Dispatch all ${selectedMealWindow} batches to drivers?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dispatch',
          onPress: async () => {
            setIsDispatching(true);
            try {
              const result = await deliveryService.dispatchBatches({
                mealWindow: selectedMealWindow,
              });

              Alert.alert(
                'Success',
                `Dispatched ${result.data.batchesDispatched} batch(es) to drivers`
              );

              await loadBatches();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to dispatch batches');
            } finally {
              setIsDispatching(false);
            }
          },
        },
      ]
    );
  };

  const filteredBatches = batches.filter(
    (batch) => filterStatus === 'ALL' || batch.status === filterStatus
  );

  const renderBatchCard = (batch: Batch) => {
    const statusColor = getStatusColor(batch.status);

    return (
      <View key={batch._id} style={styles.batchCard}>
        <View style={styles.batchHeader}>
          <View style={styles.batchInfo}>
            <Text style={styles.batchId}>Batch #{batch._id.slice(-6)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>
                {batch.status.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>
          <Text style={styles.batchMealWindow}>{batch.mealWindow}</Text>
        </View>

        <View style={styles.batchDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="shopping-bag" size={16} color={colors.textMuted} />
            <Text style={styles.detailText}>{batch.orders.length} orders</Text>
          </View>

          {batch.driverId && (
            <View style={styles.detailRow}>
              <MaterialIcons name="person" size={16} color={colors.textMuted} />
              <Text style={styles.detailText}>Driver assigned</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <MaterialIcons name="schedule" size={16} color={colors.textMuted} />
            <Text style={styles.detailText}>
              {new Date(batch.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            loadBatches();
          }}
        />
      }
    >
      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <Text style={styles.sectionTitle}>Batch Operations</Text>

        {/* Meal Window Selector */}
        <View style={styles.mealWindowSelector}>
          <TouchableOpacity
            style={[
              styles.mealWindowButton,
              selectedMealWindow === 'LUNCH' && styles.mealWindowButtonActive,
            ]}
            onPress={() => setSelectedMealWindow('LUNCH')}
          >
            <MaterialIcons
              name="wb-sunny"
              size={18}
              color={selectedMealWindow === 'LUNCH' ? colors.white : colors.textSecondary}
            />
            <Text
              style={[
                styles.mealWindowText,
                selectedMealWindow === 'LUNCH' && styles.mealWindowTextActive,
              ]}
            >
              Lunch
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mealWindowButton,
              selectedMealWindow === 'DINNER' && styles.mealWindowButtonActive,
            ]}
            onPress={() => setSelectedMealWindow('DINNER')}
          >
            <MaterialIcons
              name="nights-stay"
              size={18}
              color={selectedMealWindow === 'DINNER' ? colors.white : colors.textSecondary}
            />
            <Text
              style={[
                styles.mealWindowText,
                selectedMealWindow === 'DINNER' && styles.mealWindowTextActive,
              ]}
            >
              Dinner
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.batchButton]}
            onPress={handleAutoBatch}
            disabled={isBatching}
          >
            {isBatching ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <MaterialIcons name="auto-fix-high" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Batch Orders</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.dispatchButton,
              !canDispatchMealWindow(selectedMealWindow) && styles.actionButtonDisabled,
            ]}
            onPress={handleDispatch}
            disabled={isDispatching || !canDispatchMealWindow(selectedMealWindow)}
          >
            {isDispatching ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <MaterialIcons name="local-shipping" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>
                  {canDispatchMealWindow(selectedMealWindow)
                    ? 'Dispatch to Drivers'
                    : `Wait ${getTimeUntilDispatch(selectedMealWindow)}`}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Dispatch Info */}
        {!canDispatchMealWindow(selectedMealWindow) && (
          <View style={styles.infoBox}>
            <MaterialIcons name="info-outline" size={16} color={colors.info} />
            <Text style={styles.infoText}>
              {selectedMealWindow === 'LUNCH'
                ? 'Dispatch available after 1:00 PM'
                : 'Dispatch available after 10:00 PM'}
            </Text>
          </View>
        )}
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <Text style={styles.filterLabel}>Filter:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'ALL' && styles.filterChipActive]}
            onPress={() => setFilterStatus('ALL')}
          >
            <Text
              style={[
                styles.filterChipText,
                filterStatus === 'ALL' && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {(['COLLECTING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED'] as BatchStatus[]).map(
            (status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
                onPress={() => setFilterStatus(status)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === status && styles.filterChipTextActive,
                  ]}
                >
                  {status.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>

      {/* Batches List */}
      <View style={styles.batchesList}>
        <Text style={styles.sectionTitle}>
          Batches ({filteredBatches.length})
        </Text>

        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredBatches.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="inbox" size={64} color={colors.textMuted} />
            <Text style={styles.emptyStateText}>No batches found</Text>
            <Text style={styles.emptyStateSubtext}>
              Create batches by clicking "Batch Orders"
            </Text>
          </View>
        ) : (
          filteredBatches.map(renderBatchCard)
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  controlPanel: {
    backgroundColor: colors.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: spacing.borderRadiusLg,
    margin: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  mealWindowSelector: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  mealWindowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  mealWindowButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealWindowText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  mealWindowTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  actionButtons: {
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    gap: spacing.xs,
  },
  batchButton: {
    backgroundColor: colors.primary,
  },
  dispatchButton: {
    backgroundColor: '#6366f1',
  },
  actionButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoLight,
    padding: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  infoText: {
    fontSize: 12,
    color: colors.info,
    flex: 1,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.background,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  batchesList: {
    padding: spacing.md,
  },
  batchCard: {
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
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  batchInfo: {
    flex: 1,
  },
  batchId: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  batchMealWindow: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  batchDetails: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

export default BatchManagementTab;
