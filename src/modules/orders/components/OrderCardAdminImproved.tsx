import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import {Order, OrderStatus, MenuType} from '../../../types/api.types';
import {formatDistanceToNow} from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface OrderCardAdminImprovedProps {
  order: Order;
  onPress: () => void;
}

const getStatusConfig = (
  status: OrderStatus,
): {color: string; bgColor: string; icon: string} => {
  const configs: Record<
    OrderStatus,
    {color: string; bgColor: string; icon: string}
  > = {
    PLACED: {color: '#007AFF', bgColor: '#007AFF15', icon: 'shopping-cart'},
    ACCEPTED: {color: '#00C7BE', bgColor: '#00C7BE15', icon: 'check-circle'},
    REJECTED: {color: '#FF3B30', bgColor: '#FF3B3015', icon: 'cancel'},
    PREPARING: {color: '#FFCC00', bgColor: '#FFCC0015', icon: 'restaurant'},
    READY: {color: '#FF9500', bgColor: '#FF950015', icon: 'done-all'},
    PICKED_UP: {
      color: '#AF52DE',
      bgColor: '#AF52DE15',
      icon: 'local-shipping',
    },
    OUT_FOR_DELIVERY: {
      color: '#5856D6',
      bgColor: '#5856D615',
      icon: 'local-shipping',
    },
    DELIVERED: {
      color: '#34C759',
      bgColor: '#34C75915',
      icon: 'check-circle-outline',
    },
    CANCELLED: {color: '#FF3B30', bgColor: '#FF3B3015', icon: 'cancel'},
    FAILED: {color: '#8B0000', bgColor: '#8B000015', icon: 'error'},
  };
  return configs[status] || {color: '#8E8E93', bgColor: '#8E8E9315', icon: 'help'};
};

const getMenuTypeConfig = (
  menuType: MenuType,
): {color: string; bgColor: string; label: string} => {
  return menuType === 'MEAL_MENU'
    ? {color: '#34C759', bgColor: '#34C75915', label: 'MEAL'}
    : {color: '#007AFF', bgColor: '#007AFF15', label: 'ON-DEMAND'};
};

const formatTimeAgo = (date: string): string => {
  try {
    return formatDistanceToNow(new Date(date), {addSuffix: true});
  } catch {
    return 'Unknown';
  }
};

const OrderCardAdminImproved: React.FC<OrderCardAdminImprovedProps> = ({
  order,
  onPress,
}) => {
  const statusConfig = getStatusConfig(order.status);
  const menuConfig = getMenuTypeConfig(order.menuType);

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
          <Text style={styles.orderNumber}>{order.orderNumber || 'N/A'}</Text>
          <View style={styles.timeRow}>
            <Icon name="access-time" size={14} color="#8E8E93" />
            <Text style={styles.timeAgo}>{formatTimeAgo(order.placedAt)}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusConfig.bgColor,
              borderColor: statusConfig.color,
            },
          ]}>
          <Icon name={statusConfig.icon} size={16} color={statusConfig.color} />
          <Text style={[styles.statusText, {color: statusConfig.color}]}>
            {order.status}
          </Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.customerSection}>
        <View style={styles.avatarPlaceholder}>
          <Icon name="person" size={20} color="#8E8E93" />
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.userId?.name || 'Unknown'}</Text>
          <TouchableOpacity onPress={handleCallCustomer} style={styles.phoneRow}>
            <Icon name="phone" size={14} color="#007AFF" />
            <Text style={styles.customerPhone}>{order.userId?.phone || 'N/A'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Kitchen & Tags */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Icon name="restaurant" size={16} color="#8E8E93" />
          <Text style={styles.detailText} numberOfLines={1}>
            {order.kitchenId?.name || 'Unknown'}
          </Text>
        </View>

        <View style={styles.tagsRow}>
          <View
            style={[
              styles.tag,
              {
                borderColor: menuConfig.color,
                backgroundColor: menuConfig.bgColor,
              },
            ]}>
            <Text style={[styles.tagText, {color: menuConfig.color}]}>
              {menuConfig.label}
            </Text>
          </View>

          {order.mealWindow && (
            <View style={styles.mealTag}>
              <Icon
                name={order.mealWindow === 'LUNCH' ? 'wb-sunny' : 'nights-stay'}
                size={12}
                color="#3C3C43"
              />
              <Text style={styles.mealText}>{order.mealWindow}</Text>
            </View>
          )}

          <View style={styles.itemsBadge}>
            <Icon name="shopping-bag" size={12} color="#8E8E93" />
            <Text style={styles.itemsText}>
              {order.itemCount || order.items?.length || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Total</Text>
          <Text style={styles.amountValue}>
            ₹{(order.grandTotal || 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.footerRight}>
          {order.voucherUsage && order.voucherUsage.voucherCount > 0 && (
            <View style={styles.voucherBadge}>
              <Icon name="confirmation-number" size={12} color="#34C759" />
              <Text style={styles.voucherText}>
                {order.voucherUsage.voucherCount}
              </Text>
            </View>
          )}
          <Icon name="chevron-right" size={20} color="#C7C7CC" />
        </View>
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
    borderColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeAgo: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#3C3C43',
    fontWeight: '500',
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mealTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  mealText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3C3C43',
  },
  itemsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  itemsText: {
    fontSize: 11,
    color: '#3C3C43',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  amountSection: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voucherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#34C75915',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  voucherText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '700',
  },
});

export default OrderCardAdminImproved;
