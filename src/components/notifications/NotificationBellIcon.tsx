import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';

interface NotificationBellIconProps {
  unreadCount: number;
  onPress: () => void;
}

export const NotificationBellIcon: React.FC<NotificationBellIconProps> = ({
  unreadCount,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="relative mr-4"
      accessibilityLabel="Notifications"
      accessibilityHint={`You have ${unreadCount} unread notifications`}
    >
      <Icon name="notifications" size={28} color={colors.gray700} />
      {unreadCount > 0 && (
        <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
          <Text className="text-white text-xs font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
