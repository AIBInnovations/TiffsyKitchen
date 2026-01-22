import React from 'react';
import { TouchableOpacity, View, Text, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { InAppNotification } from '../../services/notification.service';
import { colors } from '../../theme';
import { formatDistanceToNow } from 'date-fns';

interface NotificationListItemProps {
  notification: InAppNotification;
  onPress: () => void;
  onDelete: () => void;
}

export const NotificationListItem: React.FC<NotificationListItemProps> = ({
  notification,
  onPress,
  onDelete,
}) => {
  const swipeAnim = React.useRef(new Animated.Value(0)).current;
  const [isSwipedLeft, setIsSwipedLeft] = React.useState(false);

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

  const icon = getNotificationIcon(notification.type);

  const handleSwipeLeft = () => {
    Animated.timing(swipeAnim, {
      toValue: -80,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setIsSwipedLeft(true);
  };

  const handleSwipeRight = () => {
    Animated.timing(swipeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setIsSwipedLeft(false);
  };

  const handleDeletePress = () => {
    Animated.timing(swipeAnim, {
      toValue: -500,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
    });
  };

  return (
    <View className="relative">
      {/* Delete button (behind the item) */}
      {isSwipedLeft && (
        <TouchableOpacity
          onPress={handleDeletePress}
          className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 items-center justify-center"
          accessibilityLabel="Delete notification"
        >
          <Icon name="delete" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Notification item */}
      <Animated.View
        style={{
          transform: [{ translateX: swipeAnim }],
        }}
        className={`${
          notification.isRead ? 'bg-gray-50' : 'bg-white'
        } border-b border-gray-200`}
      >
        <TouchableOpacity
          onPress={onPress}
          onLongPress={handleSwipeLeft}
          className="flex-row items-start p-4"
          accessibilityLabel={`Notification: ${notification.title}`}
          accessibilityHint="Long press to delete"
        >
          {/* Icon */}
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${icon.color}20` }}
          >
            <Icon name={icon.name} size={24} color={icon.color} />
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-1">
              <Text
                className={`flex-1 text-base ${
                  notification.isRead ? 'font-normal' : 'font-semibold'
                } text-gray-900`}
                numberOfLines={1}
              >
                {notification.title}
              </Text>
              {!notification.isRead && (
                <View className="w-2 h-2 rounded-full bg-blue-500 ml-2 mt-1" />
              )}
            </View>
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {notification.body}
            </Text>
            <Text className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
