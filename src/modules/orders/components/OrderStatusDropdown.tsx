import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Vibration,
} from 'react-native';
import {OrderStatus} from '../../../types/api.types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface OrderStatusDropdownProps {
  currentStatus: OrderStatus;
  onStatusChange?: (newStatus: OrderStatus) => void;
  disabled?: boolean;
  isKitchenMode?: boolean;
}

const OrderStatusDropdown: React.FC<OrderStatusDropdownProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
  isKitchenMode = false,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // All possible statuses
  const allStatuses: OrderStatus[] = [
    'PLACED',
    'ACCEPTED',
    'PREPARING',
    'READY',
    'PICKED_UP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REJECTED',
    'FAILED',
  ];

  // Filter statuses based on mode
  const availableStatuses = isKitchenMode
    ? allStatuses.filter(
        status =>
          !['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED', 'ACCEPTED', 'REJECTED'].includes(status)
      )
    : allStatuses;

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

  const getStatusIcon = (status: OrderStatus): string => {
    const icons: Record<OrderStatus, string> = {
      PLACED: 'receipt',
      SCHEDULED: 'event',
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
      SCHEDULED: 'Scheduled',
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

  const handleStatusSelect = (status: OrderStatus) => {
    if (disabled || !onStatusChange) return;

    // 🔍 LOG: Status selected in dropdown
    console.log('====================================');
    console.log('📱 DROPDOWN: Status Selected');
    console.log('====================================');
    console.log('Selected Status:', status);
    console.log('Status Type:', typeof status);
    console.log('Is String?', typeof status === 'string');
    console.log('Status Value (raw):', `"${status}"`);
    console.log('====================================');

    // Haptic feedback
    try {
      Vibration.vibrate(10);
    } catch (error) {
      // Silently ignore vibration errors
    }

    setDropdownVisible(false);
    onStatusChange(status);
  };

  const openDropdown = () => {
    if (disabled) return;

    try {
      Vibration.vibrate(5);
    } catch (error) {
      // Silently ignore
    }

    setDropdownVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Current Status Display */}
      <TouchableOpacity
        style={[
          styles.dropdownTrigger,
          disabled && styles.dropdownTriggerDisabled,
        ]}
        onPress={openDropdown}
        disabled={disabled}
        activeOpacity={0.7}>
        <View style={styles.triggerContent}>
          <View
            style={[
              styles.statusIconContainer,
              {backgroundColor: getStatusColor(currentStatus)},
            ]}>
            <MaterialIcons
              name={getStatusIcon(currentStatus) as any}
              size={20}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusLabel}>Current Status</Text>
            <Text
              style={[
                styles.statusValue,
                {color: getStatusColor(currentStatus)},
              ]}>
              {formatStatusText(currentStatus)}
            </Text>
          </View>
          {!disabled && (
            <MaterialIcons
              name="arrow-drop-down"
              size={28}
              color={getStatusColor(currentStatus)}
            />
          )}
          {disabled && (
            <MaterialIcons name="sync" size={20} color="#8E8E93" />
          )}
        </View>
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="swap-vert" size={24} color="#007AFF" />
              <Text style={styles.modalTitle}>Change Order Status</Text>
              <TouchableOpacity
                onPress={() => setDropdownVisible(false)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <MaterialIcons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.statusList}>
              {availableStatuses.map(status => {
                const isCurrent = status === currentStatus;
                const isTerminal = ['CANCELLED', 'REJECTED', 'FAILED'].includes(
                  status,
                );

                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusItem,
                      isCurrent && styles.statusItemCurrent,
                    ]}
                    onPress={() => handleStatusSelect(status)}
                    activeOpacity={0.7}>
                    <View
                      style={[
                        styles.statusItemIcon,
                        {backgroundColor: getStatusColor(status)},
                      ]}>
                      <MaterialIcons
                        name={getStatusIcon(status) as any}
                        size={20}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text
                      style={[
                        styles.statusItemText,
                        isCurrent && styles.statusItemTextCurrent,
                      ]}>
                      {formatStatusText(status)}
                    </Text>
                    {isCurrent && (
                      <View style={styles.currentBadge}>
                        <MaterialIcons
                          name="check-circle"
                          size={16}
                          color="#34C759"
                        />
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                    {isTerminal && !isCurrent && (
                      <MaterialIcons name="warning" size={16} color="#FF3B30" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={styles.footerHint}>
                💡 Tap any status to change instantly
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  dropdownTrigger: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownTriggerDisabled: {
    opacity: 0.6,
    borderColor: '#C7C7CC',
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  statusList: {
    maxHeight: 400,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  statusItemCurrent: {
    backgroundColor: '#F0F9FF',
  },
  statusItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  statusItemTextCurrent: {
    fontWeight: '700',
    color: '#007AFF',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    backgroundColor: '#F9F9F9',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  footerHint: {
    fontSize: 13,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default OrderStatusDropdown;
