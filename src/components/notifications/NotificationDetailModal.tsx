import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { InAppNotification } from '../../services/notification.service';
import { colors } from '../../theme';
import { format } from 'date-fns';
import { useNavigation } from '../../context/NavigationContext';

interface NotificationDetailModalProps {
  notification: InAppNotification;
  visible: boolean;
  onClose: () => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  visible,
  onClose,
}) => {
  const navigation = useNavigation();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MENU_UPDATE':
        return { name: 'restaurant-menu', color: colors.info };
      case 'ORDER_STATUS_CHANGE':
        return { name: 'inventory', color: colors.success };
      case 'VOUCHER_EXPIRY_REMINDER':
        return { name: 'card-giftcard', color: colors.warning };
      case 'NEW_MANUAL_ORDER':
      case 'NEW_AUTO_ORDER':
        return { name: 'add-shopping-cart', color: colors.warning };
      case 'BATCH_REMINDER':
        return { name: 'schedule', color: colors.error };
      case 'BATCH_READY':
        return { name: 'local-shipping', color: colors.success };
      case 'ADMIN_PUSH':
        return { name: 'campaign', color: colors.primary };
      default:
        return { name: 'notifications', color: colors.gray600 };
    }
  };

  const getActionButton = () => {
    const data = notification.data || {};

    switch (notification.type) {
      case 'ORDER_STATUS_CHANGE':
      case 'NEW_MANUAL_ORDER':
      case 'NEW_AUTO_ORDER':
        if (data.orderId) {
          return {
            label: 'View Order',
            icon: 'inventory',
            action: () => {
              onClose();
              navigation.navigate('Orders');
              // TODO: Navigate to specific order detail
            },
          };
        }
        break;

      case 'MENU_UPDATE':
        if (data.kitchenId) {
          return {
            label: 'Check Menu',
            icon: 'restaurant-menu',
            action: () => {
              onClose();
              navigation.navigate('MenuManagement');
            },
          };
        }
        break;

      case 'BATCH_REMINDER':
      case 'BATCH_READY':
        return {
          label: 'View Pending Orders',
          icon: 'list',
          action: () => {
            onClose();
            navigation.navigate('Orders');
          },
        };

      case 'VOUCHER_EXPIRY_REMINDER':
        return {
          label: 'Use Vouchers',
          icon: 'card-giftcard',
          action: () => {
            onClose();
            // TODO: Navigate to vouchers screen
          },
        };

      case 'ADMIN_PUSH':
        if (data.screen) {
          return {
            label: 'Go to ' + data.screen,
            icon: 'arrow-forward',
            action: () => {
              onClose();
              // TODO: Handle custom screen navigation
            },
          };
        }
        break;
    }

    return null;
  };

  const icon = getNotificationIcon(notification.type);
  const actionButton = getActionButton();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/50 justify-center px-6"
        onPress={onClose}
        accessibilityLabel="Close modal"
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-white rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <View className="p-6 pb-4">
              <View className="flex-row items-center justify-between mb-4">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${icon.color}20` }}
                >
                  <Icon name={icon.name} size={28} color={icon.color} />
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 items-center justify-center"
                  accessibilityLabel="Close"
                >
                  <Icon name="close" size={24} color={colors.gray400} />
                </TouchableOpacity>
              </View>

              <Text className="text-xl font-bold text-gray-900 mb-2">{notification.title}</Text>

              <Text className="text-sm text-gray-500">
                {format(new Date(notification.createdAt), 'MMM d, yyyy • h:mm a')}
              </Text>
            </View>

            {/* Body */}
            <ScrollView className="max-h-64 px-6">
              <Text className="text-base text-gray-700 leading-6">{notification.body}</Text>

              {/* Additional data */}
              {notification.data && Object.keys(notification.data).length > 0 && (
                <View className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <Text className="text-xs font-semibold text-gray-600 mb-2">
                    Additional Information
                  </Text>
                  {Object.entries(notification.data).map(([key, value]) => {
                    // Skip internal fields
                    if (
                      key === 'type' ||
                      key === 'screen' ||
                      key === 'orderId' ||
                      key === 'kitchenId'
                    ) {
                      return null;
                    }

                    return (
                      <View key={key} className="flex-row justify-between py-1">
                        <Text className="text-xs text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </Text>
                        <Text className="text-xs text-gray-800 font-medium">{String(value)}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            {/* Actions */}
            <View className="p-6 pt-4">
              {actionButton ? (
                <TouchableOpacity
                  onPress={actionButton.action}
                  className="flex-row items-center justify-center py-3 px-4 rounded-lg"
                  style={{ backgroundColor: colors.primary }}
                  accessibilityLabel={actionButton.label}
                >
                  <Icon name={actionButton.icon} size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">{actionButton.label}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={onClose}
                  className="py-3 px-4 rounded-lg border border-gray-300"
                  accessibilityLabel="Close"
                >
                  <Text className="text-gray-700 font-semibold text-center">Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
