import React, {useState, useCallback} from 'react';
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
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useQuery} from '@tanstack/react-query';
import {ordersService} from '../../../services/orders.service';
import {Order, OrderStatus} from '../../../types/api.types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {format} from 'date-fns';

const STATUS_FILTERS: {label: string; value: OrderStatus | 'ALL'}[] = [
  {label: 'All', value: 'ALL'},
  {label: 'Placed', value: 'PLACED'},
  {label: 'Accepted', value: 'ACCEPTED'},
  {label: 'Preparing', value: 'PREPARING'},
  {label: 'Ready', value: 'READY'},
];

const MEAL_WINDOW_FILTERS: {label: string; value: 'ALL' | 'LUNCH' | 'DINNER'}[] = [
  {label: 'All', value: 'ALL'},
  {label: 'Lunch', value: 'LUNCH'},
  {label: 'Dinner', value: 'DINNER'},
];

interface KitchenOrdersScreenProps {
  onMenuPress?: () => void;
  navigation?: any;
}

const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    PLACED: '#007AFF',
    ACCEPTED: '#00C7BE',
    REJECTED: '#FF3B30',
    PREPARING: '#FFCC00',
    READY: '#FF9500',
    PICKED_UP: '#AF52DE',
    OUT_FOR_DELIVERY: '#5856D6',
    DELIVERED: '#34C759',
    CANCELLED: '#FF3B30',
    FAILED: '#8B0000',
  };
  return colors[status] || '#8E8E93';
};

const KitchenOrdersScreen: React.FC<KitchenOrdersScreenProps> = ({
  onMenuPress,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedMealWindow, setSelectedMealWindow] = useState<'ALL' | 'LUNCH' | 'DINNER'>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [page, setPage] = useState(1);

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
    if (navigation) {
      navigation.navigate('OrderDetail', {orderId});
    }
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

  const renderOrderItem = ({item}: {item: Order}) => {
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(item._id)}>
        <View style={styles.orderCardHeader}>
          <View style={styles.orderCardTop}>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: getStatusColor(item.status)},
              ]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          {item.mealWindow && (
            <View style={styles.mealWindowBadge}>
              <Text style={styles.mealWindowText}>
                {item.mealWindow === 'LUNCH' ? '🍱 Lunch' : '🍽️ Dinner'}
              </Text>
            </View>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsSectionTitle}>Items:</Text>
          {item.items && item.items.length > 0 ? (
            item.items.map((orderItem, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemText}>
                  {orderItem.quantity}x {orderItem.name}
                </Text>
                {orderItem.addons && orderItem.addons.length > 0 && (
                  <View style={styles.addonsContainer}>
                    {orderItem.addons.map((addon, addonIndex) => (
                      <Text key={addonIndex} style={styles.addonText}>
                        + {addon.quantity}x {addon.name}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noItemsText}>No items</Text>
          )}
        </View>

        {/* Special Instructions */}
        {item.specialInstructions && (
          <View style={styles.instructionsSection}>
            <Text style={styles.instructionLabel}>Special Instructions:</Text>
            <Text style={styles.instructionText}>{item.specialInstructions}</Text>
          </View>
        )}

        {/* Delivery Info */}
        {item.deliveryAddress && (
          <View style={styles.deliverySection}>
            <Icon name="location-on" size={14} color="#8E8E93" />
            <Text style={styles.deliveryText}>
              {item.deliveryAddress.locality}, {item.deliveryAddress.pincode}
            </Text>
          </View>
        )}

        {/* Placed Time */}
        <View style={styles.timeSection}>
          <Icon name="access-time" size={14} color="#8E8E93" />
          <Text style={styles.timeText}>
            Placed: {item.placedAt ? format(new Date(item.placedAt), 'hh:mm a') : 'N/A'}
          </Text>
        </View>
      </TouchableOpacity>
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
        <ActivityIndicator size="small" color="#f97316" />
      </View>
    );
  };

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f97316" />

      {/* Header */}
      {onMenuPress && (
        <View style={[styles.header, {paddingTop: insets.top + 8}]}>
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
          <Icon name="chevron-left" size={24} color="#f97316" />
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
          <Icon name="chevron-right" size={24} color="#f97316" />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#f97316',
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
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
    color: '#f97316',
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
    backgroundColor: '#f97316',
    borderColor: '#f97316',
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
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderCardHeader: {
    marginBottom: 12,
  },
  orderCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mealWindowBadge: {
    alignSelf: 'flex-start',
  },
  mealWindowText: {
    fontSize: 13,
    color: '#6b7280',
  },
  itemsSection: {
    marginBottom: 12,
  },
  itemsSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
  },
  itemRow: {
    marginBottom: 6,
  },
  itemText: {
    fontSize: 14,
    color: '#3C3C43',
    fontWeight: '500',
  },
  addonsContainer: {
    marginLeft: 12,
    marginTop: 2,
  },
  addonText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  noItemsText: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  instructionsSection: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFCC00',
  },
  instructionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CC9900',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    color: '#3C3C43',
    lineHeight: 18,
  },
  deliverySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  deliveryText: {
    fontSize: 13,
    color: '#6b7280',
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#6b7280',
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
