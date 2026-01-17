import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { SafeAreaScreen } from '../../../components/common/SafeAreaScreen';
import { deliveryService } from '../../../services/delivery.service';

interface AvailableBatch {
  _id: string;
  batchNumber: string;
  kitchenId: {
    _id: string;
    name: string;
    address: string;
  };
  zoneId: {
    _id: string;
    name: string;
    code: string;
  };
  mealWindow: 'LUNCH' | 'DINNER';
  orderCount: number;
  estimatedEarnings?: number;
  pickupAddress: string;
  windowEndTime: string;
}

interface MyDelivery {
  _id: string;
  batchNumber?: string;
  status: string;
  kitchenName?: string;
  zoneName?: string;
  orderCount?: number;
  deliveredCount?: number;
  failedCount?: number;
  createdAt: string;
  completedAt?: string;
}

type TabType = 'AVAILABLE' | 'MY_DELIVERIES';

interface DriverDeliveriesScreenProps {
  navigation?: any;
}

export const DriverDeliveriesScreen: React.FC<DriverDeliveriesScreenProps> = ({ navigation }) => {
  console.log('🚚 DriverDeliveriesScreen loaded - This is the DRIVER screen, not admin!');

  const [activeTab, setActiveTab] = useState<TabType>('AVAILABLE');
  const [availableBatches, setAvailableBatches] = useState<AvailableBatch[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<MyDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadData = async () => {
    if (!isRefreshing) {
      setIsLoading(true);
    }
    try {
      if (activeTab === 'AVAILABLE') {
        await loadAvailableBatches();
      } else {
        await loadMyDeliveries();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadAvailableBatches = async () => {
    try {
      const response = await deliveryService.getAvailableBatches();
      setAvailableBatches(response.data.batches || []);
    } catch (error: any) {
      console.error('Failed to load available batches:', error);
      // Don't show error for 404 - means no batches available yet
      if (!error.message?.includes('404')) {
        setAvailableBatches([]);
      }
    }
  };

  const loadMyDeliveries = async () => {
    try {
      const deliveries = await deliveryService.getDriverDeliveries();
      setMyDeliveries(deliveries || []);
    } catch (error: any) {
      console.error('Failed to load my deliveries:', error);
      Alert.alert('Error', 'Failed to load your deliveries');
    }
  };

  const handleAcceptBatch = async (batch: AvailableBatch) => {
    Alert.alert(
      'Accept Delivery Batch',
      `Accept batch with ${batch.orderCount} orders from ${batch.kitchenId.name}?\n\nPickup: ${batch.pickupAddress}\nZone: ${batch.zoneId.name}${batch.estimatedEarnings ? `\nEarnings: ₹${batch.estimatedEarnings}` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: async () => {
            setIsAccepting(batch._id);
            try {
              const response = await deliveryService.acceptBatch(batch._id);
              Alert.alert(
                'Batch Accepted!',
                `You have been assigned ${response.data.orders?.length || batch.orderCount} orders. Please proceed to pick them up from the kitchen.`,
                [
                  {
                    text: 'View Details',
                    onPress: () => {
                      setActiveTab('MY_DELIVERIES');
                      loadMyDeliveries();
                    },
                  },
                ]
              );
              loadAvailableBatches();
            } catch (error: any) {
              Alert.alert('Failed to Accept', error.message || 'Could not accept this batch. It may have been assigned to another driver.');
            } finally {
              setIsAccepting(null);
            }
          },
        },
      ]
    );
  };

  const handleViewDeliveryDetails = (delivery: MyDelivery) => {
    // Navigate to delivery details screen (to be implemented)
    Alert.alert('View Details', `Delivery ID: ${delivery._id}\nStatus: ${delivery.status}`);
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData();
  }, [activeTab]);

  const renderAvailableBatchCard = ({ item }: { item: AvailableBatch }) => {
    const isAcceptingThis = isAccepting === item._id;
    const mealWindowColor = item.mealWindow === 'LUNCH' ? '#f59e0b' : '#6366f1';
    const mealWindowIcon = item.mealWindow === 'LUNCH' ? 'wb-sunny' : 'nights-stay';

    return (
      <View style={styles.card}>
        {/* Batch Header */}
        <View style={styles.cardHeader}>
          <View style={styles.batchInfo}>
            <Text style={styles.batchNumber}>{item.batchNumber}</Text>
            <View style={[styles.mealBadge, { backgroundColor: mealWindowColor }]}>
              <MaterialIcons name={mealWindowIcon} size={14} color="#fff" />
              <Text style={styles.mealBadgeText}>{item.mealWindow}</Text>
            </View>
          </View>
        </View>

        {/* Kitchen & Zone Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <MaterialIcons name="restaurant" size={18} color={colors.textSecondary} />
            <Text style={styles.infoText}>{item.kitchenId.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={18} color={colors.textSecondary} />
            <Text style={styles.infoText}>{item.zoneId.name} ({item.zoneId.code})</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="shopping-bag" size={18} color={colors.primary} />
            <Text style={[styles.infoText, { fontWeight: '600', color: colors.primary }]}>
              {item.orderCount} {item.orderCount === 1 ? 'Order' : 'Orders'}
            </Text>
          </View>
          {item.estimatedEarnings && (
            <View style={styles.infoRow}>
              <MaterialIcons name="payments" size={18} color={colors.success} />
              <Text style={[styles.infoText, { fontWeight: '600', color: colors.success }]}>
                Earn ₹{item.estimatedEarnings}
              </Text>
            </View>
          )}
        </View>

        {/* Pickup Address */}
        <View style={styles.pickupSection}>
          <Text style={styles.pickupLabel}>Pickup Location:</Text>
          <Text style={styles.pickupAddress}>{item.pickupAddress}</Text>
        </View>

        {/* Accept Button */}
        <TouchableOpacity
          style={[styles.acceptButton, isAcceptingThis && styles.acceptButtonDisabled]}
          onPress={() => handleAcceptBatch(item)}
          disabled={isAcceptingThis}
        >
          {isAcceptingThis ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="check-circle" size={20} color="#fff" />
              <Text style={styles.acceptButtonText}>Accept This Batch</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderMyDeliveryCard = ({ item }: { item: MyDelivery }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    const isActive = item.status === 'DISPATCHED' || item.status === 'IN_PROGRESS';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleViewDeliveryDetails(item)}
        activeOpacity={0.7}
      >
        {/* Delivery Header */}
        <View style={styles.cardHeader}>
          <View style={styles.deliveryInfo}>
            {item.batchNumber && (
              <Text style={styles.batchNumber}>{item.batchNumber}</Text>
            )}
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <MaterialIcons name={statusIcon} size={14} color="#fff" />
              <Text style={styles.statusBadgeText}>{formatStatus(item.status)}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.infoSection}>
          {item.kitchenName && (
            <View style={styles.infoRow}>
              <MaterialIcons name="restaurant" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>{item.kitchenName}</Text>
            </View>
          )}
          {item.zoneName && (
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>{item.zoneName}</Text>
            </View>
          )}
          {item.orderCount !== undefined && (
            <View style={styles.infoRow}>
              <MaterialIcons name="shopping-bag" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                {item.orderCount} {item.orderCount === 1 ? 'Order' : 'Orders'}
              </Text>
            </View>
          )}
        </View>

        {/* Progress (if active) */}
        {isActive && item.deliveredCount !== undefined && (
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Progress:</Text>
            <View style={styles.progressStats}>
              <Text style={[styles.progressText, { color: colors.success }]}>
                ✓ {item.deliveredCount} Delivered
              </Text>
              {item.failedCount !== undefined && item.failedCount > 0 && (
                <Text style={[styles.progressText, { color: colors.error }]}>
                  ✗ {item.failedCount} Failed
                </Text>
              )}
              <Text style={styles.progressText}>
                {(item.orderCount || 0) - (item.deliveredCount || 0) - (item.failedCount || 0)} Pending
              </Text>
            </View>
          </View>
        )}

        {/* Date */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>
            {item.completedAt
              ? `Completed: ${formatDate(item.completedAt)}`
              : `Started: ${formatDate(item.createdAt)}`}
          </Text>
        </View>

        {/* View Details Arrow */}
        <View style={styles.viewDetailsSection}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    const isAvailableTab = activeTab === 'AVAILABLE';
    return (
      <View style={styles.emptyState}>
        <MaterialIcons
          name={isAvailableTab ? 'inbox' : 'assignment'}
          size={80}
          color={colors.textMuted}
        />
        <Text style={styles.emptyTitle}>
          {isAvailableTab ? 'No Batches Available' : 'No Active Deliveries'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {isAvailableTab
            ? 'New delivery batches will appear here when they are ready. Pull down to refresh.'
            : 'Accept a batch from the Available tab to start delivering.'}
        </Text>
      </View>
    );
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'DISPATCHED': '#f59e0b',
      'IN_PROGRESS': '#6366f1',
      'COMPLETED': '#10b981',
      'PARTIAL_COMPLETE': '#f97316',
      'CANCELLED': '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status: string): string => {
    const icons: Record<string, string> = {
      'DISPATCHED': 'local-shipping',
      'IN_PROGRESS': 'directions-run',
      'COMPLETED': 'check-circle',
      'PARTIAL_COMPLETE': 'warning',
      'CANCELLED': 'cancel',
    };
    return icons[status] || 'info';
  };

  const formatStatus = (status: string): string => {
    return status.replace(/_/g, ' ');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
  };

  const availableCount = availableBatches.length;
  const activeCount = myDeliveries.filter(d => d.status === 'DISPATCHED' || d.status === 'IN_PROGRESS').length;

  return (
    <SafeAreaScreen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Deliveries</Text>
            <Text style={styles.headerSubtitle}>Driver Portal</Text>
          </View>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <MaterialIcons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'AVAILABLE' && styles.tabActive]}
            onPress={() => setActiveTab('AVAILABLE')}
          >
            <MaterialIcons
              name="local-shipping"
              size={22}
              color={activeTab === 'AVAILABLE' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'AVAILABLE' && styles.tabTextActive]}>
              Available
            </Text>
            {availableCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{availableCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'MY_DELIVERIES' && styles.tabActive]}
            onPress={() => setActiveTab('MY_DELIVERIES')}
          >
            <MaterialIcons
              name="assignment"
              size={22}
              color={activeTab === 'MY_DELIVERIES' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'MY_DELIVERIES' && styles.tabTextActive]}>
              My Deliveries
            </Text>
            {activeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <FlatList
            data={activeTab === 'AVAILABLE' ? availableBatches : myDeliveries}
            renderItem={activeTab === 'AVAILABLE' ? renderAvailableBatchCard : renderMyDeliveryCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  refreshButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 12,
  },
  batchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  batchNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  mealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  mealBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  infoSection: {
    gap: 10,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  pickupSection: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  pickupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  pickupAddress: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  acceptButtonDisabled: {
    opacity: 0.6,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  progressSection: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressStats: {
    flexDirection: 'row',
    gap: 16,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dateSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  viewDetailsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
