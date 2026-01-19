import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
// import {useSafeAreaInsets} from 'react-native-safe-area-context'; // Removed
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaScreen } from '../../../components/common/SafeAreaScreen';
import { ordersService } from '../../../services/orders.service';
import { Order, OrderStatus } from '../../../types/api.types';
import OrderCardAdminImproved from '../components/OrderCardAdminImproved';
import OrderStatsCard from '../components/OrderStatsCard';
import ExpandableKitchenOrderCard from '../components/ExpandableKitchenOrderCard';
import Icon from 'react-native-vector-icons/MaterialIcons';

const STATUS_FILTERS: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Placed', value: 'PLACED' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Preparing', value: 'PREPARING' },
  { label: 'Ready', value: 'READY' },
  { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Failed', value: 'FAILED' },
];

interface OrdersScreenAdminProps {
  onMenuPress?: () => void;
  navigation?: any;
}

const OrdersScreenAdmin = ({ onMenuPress, navigation }: OrdersScreenAdminProps) => {
  console.log('✨ OrdersScreenAdmin RENDERED - New version with inline status editing');

  const onMenuPressProp = onMenuPress; // Renaming to avoid lint issues if needed, or just keep as is
  // const insets = useSafeAreaInsets(); // Removed
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch order statistics
  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['orderStats'],
    queryFn: () => ordersService.getOrderStatistics(),
  });

  // Fetch orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
    isFetching,
  } = useQuery({
    queryKey: ['orders', selectedStatus, page],
    queryFn: () =>
      ordersService.getOrders({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        page,
        limit: 20,
      }),
  });

  // Update order status mutation (using ADMIN endpoint)
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      console.log('====================================');
      console.log('🔄 QUICK STATUS UPDATE FROM LIST (ADMIN ENDPOINT)');
      console.log('====================================');
      console.log('Order ID:', orderId);
      console.log('New Status:', status);
      console.log('Using Admin Endpoint: /api/orders/admin/:id/status');
      console.log('====================================');

      // Use the ADMIN endpoint which allows ALL statuses
      return ordersService.updateOrderStatusAdmin(orderId, { status });
    },
    onMutate: ({ orderId }) => {
      // Set loading state for this specific order
      setUpdatingOrderId(orderId);
    },
    onSuccess: (updatedOrder, variables) => {
      // Use variables.status since response might not have the order object
      const newStatus = updatedOrder?.status || variables.status;
      console.log('✅ Status updated successfully to:', newStatus);

      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });

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

  const handleRefresh = useCallback(() => {
    refetchStats();
    refetchOrders();
  }, [refetchStats, refetchOrders]);

  const handleStatusFilter = (status: OrderStatus | 'ALL') => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handleOrderPress = (orderId: string) => {
    if (navigation) {
      navigation.navigate('OrderDetail', { orderId });
    } else {
      Alert.alert(
        'Order Details',
        `Order ID: ${orderId}\n\nNote: Order detail screen requires React Navigation to be configured.`,
      );
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
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

  // Group orders by kitchen with search filtering
  const kitchenOrdersGroups = useMemo(() => {
    if (!ordersData?.orders) return [];

    // Filter orders based on search query
    let filteredOrders = ordersData.orders;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredOrders = ordersData.orders.filter((order) => {
        const orderNumber = order.orderNumber?.toLowerCase() || '';
        const customerName = typeof order.userId === 'string'
          ? ''
          : order.userId.name?.toLowerCase() || '';
        const customerPhone = typeof order.userId === 'string'
          ? ''
          : order.userId.phone?.toLowerCase() || '';
        const kitchenName = typeof order.kitchenId === 'string'
          ? ''
          : order.kitchenId.name?.toLowerCase() || '';
        const kitchenCode = typeof order.kitchenId === 'string'
          ? ''
          : order.kitchenId.code?.toLowerCase() || '';

        return (
          orderNumber.includes(query) ||
          customerName.includes(query) ||
          customerPhone.includes(query) ||
          kitchenName.includes(query) ||
          kitchenCode.includes(query)
        );
      });
    }

    const groupedMap = new Map<string, {
      kitchenId: string;
      kitchenName: string;
      kitchenCode: string;
      orders: Order[];
    }>();

    filteredOrders.forEach((order) => {
      // Handle null or undefined kitchenId
      if (!order.kitchenId) {
        return; // Skip orders with no kitchen data
      }

      const kitchenId = typeof order.kitchenId === 'string'
        ? order.kitchenId
        : order.kitchenId._id;
      const kitchenName = typeof order.kitchenId === 'string'
        ? 'Unknown Kitchen'
        : order.kitchenId.name;
      const kitchenCode = typeof order.kitchenId === 'string'
        ? 'N/A'
        : order.kitchenId.code;

      if (!groupedMap.has(kitchenId)) {
        groupedMap.set(kitchenId, {
          kitchenId,
          kitchenName,
          kitchenCode,
          orders: [],
        });
      }

      groupedMap.get(kitchenId)!.orders.push(order);
    });

    // Convert map to array and sort by kitchen name
    return Array.from(groupedMap.values()).sort((a, b) =>
      a.kitchenName.localeCompare(b.kitchenName)
    );
  }, [ordersData, searchQuery]);

  const renderStatsSection = () => {
    if (statsLoading || !statsData) {
      return (
        <View style={styles.statsLoadingContainer}>
          <ActivityIndicator size="small" color="#F56B4C" />
        </View>
      );
    }

    const { today, revenue } = statsData;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsScroll}
        contentContainerStyle={styles.statsContainer}>
        <OrderStatsCard
          label="Today's Orders"
          value={today.total}
          color="#F56B4C"
          icon="receipt-long"
        />
        <OrderStatsCard
          label="Placed"
          value={today.placed}
          color="#FF9500"
          highlight={today.placed > 0}
          icon="pending"
        />
        <OrderStatsCard
          label="Preparing"
          value={today.preparing}
          color="#FFCC00"
          icon="restaurant"
        />
        <OrderStatsCard
          label="Delivered"
          value={today.delivered}
          color="#34C759"
          icon="check-circle"
        />
        <OrderStatsCard
          label="Cancelled"
          value={today.cancelled}
          color="#FF3B30"
          icon="cancel"
        />
        <OrderStatsCard
          label="Today's Revenue"
          value={`₹${revenue.today.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          color="#5856D6"
          icon="currency-rupee"
        />
      </ScrollView>
    );
  };

  const renderStatusFilters = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
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
    );
  };

  const renderKitchenGroup = ({ item }: { item: {
    kitchenId: string;
    kitchenName: string;
    kitchenCode: string;
    orders: Order[];
  } }) => {
    return (
      <ExpandableKitchenOrderCard
        kitchenId={item.kitchenId}
        kitchenName={item.kitchenName}
        kitchenCode={item.kitchenCode}
        orders={item.orders}
        onOrderPress={handleOrderPress}
        onStatusChange={handleStatusChange}
        updatingOrderId={updatingOrderId}
      />
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <Icon name="inbox" size={64} color="#d1d5db" />
        <Text style={styles.emptyStateText}>No orders found</Text>
        <Text style={styles.emptyStateSubtext}>
          {selectedStatus === 'ALL'
            ? 'There are no orders yet'
            : `No orders with status "${selectedStatus}"`}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetching) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  return (
    <SafeAreaScreen style={{ flex: 1 }} backgroundColor="#F56B4C">
      {/* Header */}
      {onMenuPress && (
        <View style={[styles.header, { paddingTop: 8 }]}>
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
            <Icon name="menu" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orders Management</Text>
          <View style={styles.headerBadge}>
            <Icon name="bolt" size={16} color="#fff" />
            <Text style={styles.headerBadgeText}>Quick Edit</Text>
          </View>
        </View>
      )}

      {/* Stats and Filters Section */}
      <View style={styles.topSection}>
        {renderStatsSection()}
        {renderStatusFilters()}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by order number, customer, kitchen..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={(text) => {
              console.log('🔍 Search query changed:', text);
              setSearchQuery(text);
            }}
            autoCorrect={false}
            autoCapitalize="none"
            autoComplete="off"
            clearButtonMode="never"
            underlineColorAndroid="transparent"
            returnKeyType="search"
            enablesReturnKeyAutomatically
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Orders List Section - Grouped by Kitchen */}
      <View style={styles.ordersSection}>
        <FlatList
          data={kitchenOrdersGroups}
          renderItem={renderKitchenGroup}
          keyExtractor={(item) => item.kitchenId}
          refreshControl={
            <RefreshControl
              refreshing={ordersLoading && !isFetching}
              onRefresh={handleRefresh}
              tintColor="#F56B4C"
              colors={['#F56B4C']}
            />
          }
          ListEmptyComponent={!ordersLoading ? renderEmptyState : null}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={[
            styles.listContainer,
            (!ordersData || !ordersData.orders || ordersData.orders.length === 0) &&
            styles.emptyListContainer,
          ]}
        />
      </View>
    </SafeAreaScreen>
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
  topSection: {
    backgroundColor: '#f9fafb',
  },
  ordersSection: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  menuButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  statsLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsScroll: {
    backgroundColor: '#f9fafb',
    paddingVertical: 6,
    maxHeight: 110,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 10,
    paddingRight: 24,
  },
  filtersScroll: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    maxHeight: 60,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterChipActive: {
    backgroundColor: '#F56B4C',
    borderColor: '#F56B4C',
    elevation: 3,
    shadowColor: '#F56B4C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
});

export default OrdersScreenAdmin;
