import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../../../services/orders.service';
import { Order, OrderStatus } from '../../../types/api.types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import OrderCardKitchen from '../components/OrderCardKitchen';
import OrderDetailAdminScreen from './OrderDetailAdminScreen';
import { AcceptOrderModal } from '../components/AcceptOrderModal';
import { RejectOrderModal } from '../components/RejectOrderModal';

const STATUS_FILTERS: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Placed', value: 'PLACED' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Preparing', value: 'PREPARING' },
  { label: 'Ready', value: 'READY' },
];

const MEAL_WINDOW_FILTERS: { label: string; value: 'ALL' | 'LUNCH' | 'DINNER' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Lunch', value: 'LUNCH' },
  { label: 'Dinner', value: 'DINNER' },
];

interface KitchenOrdersScreenProps {
  onMenuPress?: () => void;
  navigation?: any;
}

const KitchenOrdersScreen: React.FC<KitchenOrdersScreenProps> = ({
  onMenuPress,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedMealWindow, setSelectedMealWindow] = useState<'ALL' | 'LUNCH' | 'DINNER'>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [page, setPage] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [pendingAcceptOrderId, setPendingAcceptOrderId] = useState<string | null>(null);
  const [pendingRejectOrderId, setPendingRejectOrderId] = useState<string | null>(null);

  // Fetch kitchen orders
  const {
    data: ordersData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['kitchenOrders', selectedStatus, selectedMealWindow, selectedDate, page],
    queryFn: () =>
      ordersService.getKitchenOrders({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        mealWindow: selectedMealWindow === 'ALL' ? undefined : selectedMealWindow,
        date: selectedDate,
        page,
        limit: 50,
      }),
  });

  // Update order status mutation (Kitchen-specific endpoint)
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      console.log('====================================');
      console.log('🔄 KITCHEN STATUS UPDATE');
      console.log('====================================');
      console.log('Order ID:', orderId);
      console.log('New Status:', status);
      console.log('Using Kitchen Endpoint: /api/orders/:id/status');
      console.log('====================================');

      // Use the kitchen endpoint for status updates
      return ordersService.updateOrderStatus(orderId, { status });
    },
    onMutate: ({ orderId }) => {
      setUpdatingOrderId(orderId);
    },
    onSuccess: (updatedOrder, variables) => {
      const newStatus = updatedOrder?.status || variables.status;
      console.log('✅ Status updated successfully to:', newStatus);

      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });

      Alert.alert('Success', `Order status updated to ${newStatus}`);
      setUpdatingOrderId(null);
    },
    onError: (error: any, { orderId }) => {
      console.log('❌ Status update failed:', error);

      setUpdatingOrderId(null);
      Alert.alert(
        'Update Failed',
        error?.response?.data?.error?.message || 'Failed to update order status',
      );
    },
  });

  // Accept order mutation
  const acceptMutation = useMutation({
    mutationFn: ({ orderId, estimatedPrepTime }: { orderId: string; estimatedPrepTime: number }) =>
      ordersService.acceptOrder(orderId, estimatedPrepTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
      Alert.alert('Success', 'Order accepted successfully');
      setPendingAcceptOrderId(null);
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.response?.data?.error?.message || 'Failed to accept order. Please try again.',
      );
    },
  });

  // Reject order mutation
  const rejectMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      ordersService.rejectOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
      Alert.alert('Success', 'Order rejected successfully');
      setPendingRejectOrderId(null);
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.response?.data?.error?.message || 'Failed to reject order. Please try again.',
      );
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleStatusFilter = (status: OrderStatus | 'ALL') => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handleMealWindowFilter = (mealWindow: 'ALL' | 'LUNCH' | 'DINNER') => {
    setSelectedMealWindow(mealWindow);
    setPage(1);
  };

  const handleOrderPress = (orderId: string) => {
    console.log('🔍 ORDER CARD CLICKED - Opening order details for:', orderId);
    setSelectedOrderId(orderId);
  };

  const handleBackFromOrderDetail = () => {
    setSelectedOrderId(null);
    // Refresh orders list
    refetch();
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    // Handle ACCEPTED and REJECTED specially - they require modals with additional data
    if (newStatus === 'ACCEPTED') {
      setPendingAcceptOrderId(orderId);
      return;
    }

    if (newStatus === 'REJECTED') {
      setPendingRejectOrderId(orderId);
      return;
    }

    // For other status changes (PREPARING, READY), use regular update
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleLoadMore = () => {
    if (
      ordersData &&
      ordersData.pagination.page < ordersData.pagination.pages &&
      !isFetching
    ) {
      setPage((prev) => prev + 1);
    }
  };

  const handleDateChange = (direction: 'prev' | 'next' | 'today') => {
    const currentDate = new Date(selectedDate);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (direction === 'next') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else {
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
      return;
    }
    setSelectedDate(format(currentDate, 'yyyy-MM-dd'));
    setPage(1);
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    return (
      <OrderCardKitchen
        order={item}
        onPress={() => handleOrderPress(item._id)}
        onStatusChange={handleStatusChange}
        isUpdating={updatingOrderId === item._id}
      />
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <Icon name="restaurant" size={64} color="#E5E5EA" />
        <Text style={styles.emptyStateText}>No orders found</Text>
        <Text style={styles.emptyStateSubtext}>
          {selectedStatus === 'ALL'
            ? 'No orders for this date'
            : `No orders with status "${selectedStatus}"`}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetching) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#F56B4C" />
      </View>
    );
  };

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');

  // If an order is selected, show the order detail screen
  if (selectedOrderId) {
    return (
      <OrderDetailAdminScreen
        route={{ params: { orderId: selectedOrderId } }}
        navigation={{ goBack: handleBackFromOrderDetail }}
        isKitchenMode={true}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F56B4C" />

      {/* Header */}
      {onMenuPress && (
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
            <Icon name="menu" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kitchen Orders</Text>
        </View>
      )}

      {/* Date Selector */}
      <View style={styles.dateSelectorContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => handleDateChange('prev')}>
          <Icon name="chevron-left" size={24} color="#F56B4C" />
        </TouchableOpacity>

        <View style={styles.dateDisplay}>
          <Text style={styles.dateText}>
            {format(new Date(selectedDate), 'MMM dd, yyyy')}
          </Text>
          {!isToday && (
            <TouchableOpacity onPress={() => handleDateChange('today')}>
              <Text style={styles.todayButton}>Today</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => handleDateChange('next')}>
          <Icon name="chevron-right" size={24} color="#F56B4C" />
        </TouchableOpacity>
      </View>

      {/* Meal Window Filters */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Meal Window:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}>
          {MEAL_WINDOW_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                selectedMealWindow === filter.value && styles.filterChipActive,
              ]}
              onPress={() => handleMealWindowFilter(filter.value)}>
              <Text
                style={[
                  styles.filterChipText,
                  selectedMealWindow === filter.value && styles.filterChipTextActive,
                ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Status Filters */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Status:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}>
          {STATUS_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                selectedStatus === filter.value && styles.filterChipActive,
              ]}
              onPress={() => handleStatusFilter(filter.value)}>
              <Text
                style={[
                  styles.filterChipText,
                  selectedStatus === filter.value && styles.filterChipTextActive,
                ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <View style={styles.ordersSection}>
        <FlatList
          data={ordersData?.orders || []}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && !isFetching}
              onRefresh={handleRefresh}
            />
          }
          ListEmptyComponent={!isLoading ? renderEmptyState : null}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={[
            styles.listContainer,
            (!ordersData || ordersData.orders.length === 0) &&
            styles.emptyListContainer,
          ]}
        />
      </View>

      {/* Accept Order Modal */}
      {pendingAcceptOrderId && (
        <AcceptOrderModal
          visible={!!pendingAcceptOrderId}
          orderNumber={
            ordersData?.orders.find((o) => o._id === pendingAcceptOrderId)?.orderNumber || ''
          }
          onClose={() => setPendingAcceptOrderId(null)}
          onAccept={async (prepTime) => {
            await acceptMutation.mutateAsync({
              orderId: pendingAcceptOrderId,
              estimatedPrepTime: prepTime,
            });
          }}
        />
      )}

      {/* Reject Order Modal */}
      {pendingRejectOrderId && (
        <RejectOrderModal
          visible={!!pendingRejectOrderId}
          orderNumber={
            ordersData?.orders.find((o) => o._id === pendingRejectOrderId)?.orderNumber || ''
          }
          onClose={() => setPendingRejectOrderId(null)}
          onReject={async (reason) => {
            await rejectMutation.mutateAsync({
              orderId: pendingRejectOrderId,
              reason,
            });
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#F56B4C',
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  dateSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateButton: {
    padding: 8,
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  todayButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F56B4C',
    textDecorationLine: 'underline',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#F56B4C',
    borderColor: '#F56B4C',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  ordersSection: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingFooter: {
    paddingVertical: 24,
    alignItems: 'center',
  },
});

export default KitchenOrdersScreen;
