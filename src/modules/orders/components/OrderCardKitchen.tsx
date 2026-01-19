import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Modal,
  ScrollView,
  Vibration,
} from 'react-native';
import {Order, OrderStatus, MenuType} from '../../../types/api.types';
import {formatDistanceToNow} from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface OrderCardKitchenProps {
  order: Order;
  onPress: () => void;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
  isUpdating?: boolean;
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

const getStatusIcon = (status: OrderStatus): string => {
  const icons: Record<OrderStatus, string> = {
    PLACED: 'receipt',
    ACCEPTED: 'check-circle',
    PREPARING: 'restaurant',
    READY: 'done-all',
    PICKED_UP: 'local-shipping',
    OUT_FOR_DELIVERY: 'delivery-dining',
    DELIVERED: 'home',
    CANCELLED: 'close',
    REJECTED: 'cancel',
    FAILED: 'error',
  };
  return icons[status] || 'fiber-manual-record';
};

const formatStatusText = (status: OrderStatus): string => {
  const formatted: Record<OrderStatus, string> = {
    PLACED: 'Placed',
    ACCEPTED: 'Accepted',
    PREPARING: 'Preparing',
    READY: 'Ready',
    PICKED_UP: 'Picked Up',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected',
    FAILED: 'Failed',
  };
  return formatted[status] || status;
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

// Kitchen-specific status flow: PLACED → ACCEPTED/REJECTED → PREPARING → READY
const getKitchenStatusOptions = (currentStatus: OrderStatus): OrderStatus[] => {
  const statusFlow: Record<OrderStatus, OrderStatus[]> = {
    PLACED: ['ACCEPTED', 'REJECTED'],
    ACCEPTED: ['PREPARING'],
    REJECTED: [], // Terminal - cannot change
    PREPARING: ['READY'],
    READY: [], // Terminal for kitchen - no more actions
    PICKED_UP: [], // Not kitchen responsibility
    OUT_FOR_DELIVERY: [], // Not kitchen responsibility
    DELIVERED: [], // Terminal
    CANCELLED: [], // Terminal
    FAILED: [], // Terminal
  };

  return statusFlow[currentStatus] || [];
};

const OrderCardKitchen: React.FC<OrderCardKitchenProps> = ({
  order,
  onPress,
  onStatusChange,
  isUpdating = false,
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);

  const handleCardPress = () => {
    console.log('🔵 OrderCardKitchen: Card pressed for order:', order._id);
    onPress();
  };

  const handleCallCustomer = (e: any) => {
    e.stopPropagation();
    if (order.userId?.phone) {
      Linking.openURL(`tel:${order.userId.phone}`);
    }
  };

  const handleStatusPress = (e: any) => {
    e.stopPropagation();
    if (!isUpdating && onStatusChange) {
      try {
        Vibration.vibrate(5);
      } catch (error) {
        // Ignore vibration errors
      }
      setShowStatusModal(true);
    }
  };

  const handleStatusSelect = (newStatus: OrderStatus) => {
    try {
      Vibration.vibrate(10);
    } catch (error) {
      // Ignore vibration errors
    }

    setShowStatusModal(false);
    if (onStatusChange) {
      onStatusChange(order._id, newStatus);
    }
  };

  const kitchenStatusOptions = getKitchenStatusOptions(order.status);
  const canChangeStatus = onStatusChange && kitchenStatusOptions.length > 0;

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={handleCardPress} activeOpacity={0.7}>
        {/* Header with Status Dropdown */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.orderNumber} numberOfLines={1}>
              {order.orderNumber || 'N/A'}
            </Text>
            <Text style={styles.timeAgo} numberOfLines={1}>
              {formatTimeAgo(order.placedAt)}
            </Text>
          </View>

          {/* Status Badge with Dropdown */}
          <TouchableOpacity
            onPress={handleStatusPress}
            disabled={!canChangeStatus || isUpdating}
            activeOpacity={0.8}
            style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: getStatusColor(order.status)},
                !canChangeStatus && styles.statusBadgeDisabled,
              ]}>
              <Icon
                name={getStatusIcon(order.status)}
                size={12}
                color="#FFFFFF"
                style={styles.statusIcon}
              />
              <Text style={styles.statusText} numberOfLines={1}>
                {formatStatusText(order.status)}
              </Text>
              {canChangeStatus && !isUpdating && (
                <Icon name="arrow-drop-down" size={14} color="#FFFFFF" />
              )}
              {isUpdating && (
                <Icon name="sync" size={12} color="#FFFFFF" style={styles.syncIcon} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Customer Info - Compact */}
        <View style={styles.compactInfoRow}>
          <Icon name="person" size={16} color="#6b7280" style={styles.compactIcon} />
          <Text style={styles.compactText} numberOfLines={1}>
            {order.userId?.name || 'Unknown'}
          </Text>
          <TouchableOpacity onPress={handleCallCustomer} style={styles.compactPhoneButton}>
            <Icon name="phone" size={14} color="#f97316" />
          </TouchableOpacity>
        </View>

        {/* Kitchen Info - Compact */}
        <View style={styles.compactInfoRow}>
          <Icon name="restaurant" size={16} color="#6b7280" style={styles.compactIcon} />
          <Text style={styles.compactText} numberOfLines={1}>
            {order.kitchenId?.name || 'Unknown'}
          </Text>
        </View>

        {/* Tags Row */}
        <View style={styles.tagsRow}>
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
              <Text style={styles.mealWindowText} numberOfLines={1}>
                {order.mealWindow}
              </Text>
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
                {order.voucherUsage.voucherCount}V
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Status Change Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatusModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="swap-vert" size={20} color="#F56B4C" />
              <Text style={styles.modalTitle}>Kitchen Status Update</Text>
              <TouchableOpacity
                onPress={() => setShowStatusModal(false)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Icon name="close" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalOrderNumber}>{order.orderNumber}</Text>

            <View style={styles.currentStatusRow}>
              <Text style={styles.currentStatusLabel}>Current:</Text>
              <View
                style={[
                  styles.currentStatusBadge,
                  {backgroundColor: getStatusColor(order.status)},
                ]}>
                <Icon
                  name={getStatusIcon(order.status)}
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={styles.currentStatusText}>
                  {formatStatusText(order.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.optionsLabel}>Change to:</Text>
            <ScrollView style={styles.statusList}>
              {kitchenStatusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.statusOption}
                  onPress={() => handleStatusSelect(status)}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.statusOptionIcon,
                      {backgroundColor: getStatusColor(status)},
                    ]}>
                    <Icon
                      name={getStatusIcon(status)}
                      size={18}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.statusOptionText}>
                    {formatStatusText(status)}
                  </Text>
                  <Icon name="chevron-right" size={20} color="#8E8E93" />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => {
                setShowStatusModal(false);
                onPress();
              }}>
              <Text style={styles.viewDetailsText}>View Full Details</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  timeAgo: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
  },
  statusContainer: {
    flexShrink: 0,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusBadgeDisabled: {
    opacity: 0.9,
  },
  statusIcon: {
    marginRight: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  syncIcon: {
    marginLeft: 2,
  },
  compactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 1,
  },
  compactIcon: {
    marginRight: 8,
    flexShrink: 0,
  },
  compactText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 18,
  },
  compactPhoneButton: {
    padding: 4,
    marginLeft: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  mealWindowTag: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  mealWindowText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.3,
  },
  itemCountBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemCountText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
    marginTop: 6,
  },
  amountContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0,
  },
  amountLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 3,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  voucherBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10b981',
    flexShrink: 0,
  },
  voucherText: {
    fontSize: 10,
    color: '#047857',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 380,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
  },
  modalOrderNumber: {
    fontSize: 13,
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  currentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  currentStatusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  currentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  currentStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  optionsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusList: {
    maxHeight: 240,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  statusOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  viewDetailsButton: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    backgroundColor: '#F9F9F9',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#F56B4C',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default OrderCardKitchen;
