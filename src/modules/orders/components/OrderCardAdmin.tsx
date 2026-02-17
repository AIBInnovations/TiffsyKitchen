import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import {Order, OrderStatus, MenuType} from '../../../types/api.types';
import {formatDistanceToNow} from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {OrderSourceBadge} from './OrderSourceBadge';

interface OrderCardAdminProps {
  order: Order;
  onPress: () => void;
}

const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    PLACED: '#007AFF',
    SCHEDULED: '#6366f1',
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

const getMenuTypeColor = (menuType: MenuType): string => {
  return menuType === 'MEAL_MENU' ? '#34C759' : '#007AFF';
};

const formatTimeAgo = (date: string): string => {
  try {
    return formatDistanceToNow(new Date(date), {addSuffix: true});
  } catch {
    return 'Unknown';
  }
};

const OrderCardAdmin: React.FC<OrderCardAdminProps> = ({order, onPress}) => {
  const handleCallCustomer = (e: any) => {
    e.stopPropagation();
    if (order.userId?.phone) {
      Linking.openURL(`tel:${order.userId.phone}`);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderNumber} numberOfLines={1}>{order.orderNumber || 'N/A'}</Text>
          <Text style={styles.timeAgo} numberOfLines={1}>{formatTimeAgo(order.placedAt)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(order.status)},
          ]}>
          <Text style={styles.statusText} numberOfLines={1}>{order.status || 'UNKNOWN'}</Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.infoRow}>
        <Icon name="person" size={18} color="#6b7280" style={styles.icon} />
        <View style={styles.infoContent}>
          <Text style={styles.customerName} numberOfLines={1}>{order.userId?.name || 'Unknown'}</Text>
          <TouchableOpacity onPress={handleCallCustomer} style={styles.phoneButton}>
            <Icon name="phone" size={14} color="#f97316" />
            <Text style={styles.customerPhone} numberOfLines={1}>{order.userId?.phone || 'N/A'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Kitchen Info */}
      <View style={styles.infoRow}>
        <Icon name="restaurant" size={18} color="#6b7280" style={styles.icon} />
        <View style={styles.infoContent}>
          <Text style={styles.label}>Kitchen</Text>
          <Text style={styles.value} numberOfLines={1}>{order.kitchenId?.name || 'Unknown'}</Text>
        </View>
      </View>

      {/* Tags Row */}
      <View style={styles.tagsRow}>
        <OrderSourceBadge orderSource={order.orderSource} />
        <View
          style={[
            styles.tag,
            {
              borderColor: getMenuTypeColor(order.menuType),
              backgroundColor: `${getMenuTypeColor(order.menuType)}10`,
            },
          ]}>
          <Text
            style={[
              styles.tagText,
              {color: getMenuTypeColor(order.menuType)},
            ]}>
            {order.menuType === 'MEAL_MENU' ? 'MEAL' : 'ON-DEMAND'}
          </Text>
        </View>

        {order.mealWindow && (
          <View style={[styles.tag, styles.mealWindowTag]}>
            <Text style={styles.mealWindowText} numberOfLines={1}>{order.mealWindow}</Text>
          </View>
        )}

        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText} numberOfLines={1}>
            {order.itemCount || order.items?.length || 0} items
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total:</Text>
          <Text style={styles.amountValue} numberOfLines={1}>
            ₹{(order.grandTotal || 0).toFixed(2)}
          </Text>
        </View>
        {order.voucherUsage && order.voucherUsage.voucherCount > 0 && (
          <View style={styles.voucherBadge}>
            <Text style={styles.voucherText} numberOfLines={1}>
              {order.voucherUsage.voucherCount} voucher
              {order.voucherUsage.voucherCount > 1 ? 's' : ''} used
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 2,
  },
  icon: {
    marginRight: 10,
    marginTop: 2,
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
    minWidth: 0,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 0,
    lineHeight: 20,
  },
  customerPhone: {
    fontSize: 13,
    color: '#f97316',
    fontWeight: '600',
    marginLeft: 2,
  },
  label: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  mealWindowTag: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  mealWindowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.3,
  },
  itemCountBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemCountText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    marginTop: 8,
  },
  amountContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0,
  },
  amountLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  voucherBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
    elevation: 1,
    flexShrink: 0,
  },
  voucherText: {
    fontSize: 9,
    color: '#047857',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});

export default OrderCardAdmin;
