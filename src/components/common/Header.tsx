import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HeaderProps {
  title: string;
  onMenuPress?: () => void;
  rightComponent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuPress, rightComponent }) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#f97316" />
      <View
        className="bg-orange-500 px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center justify-between">
          {/* Hamburger Menu */}
          <TouchableOpacity
            onPress={onMenuPress}
            className="w-10 h-10 items-center justify-center"
          >
            <Icon name="menu" size={28} color="#ffffff" />
          </TouchableOpacity>

          {/* Title */}
          <Text className="text-white text-xl font-bold flex-1 text-center">
            {title}
          </Text>

          {/* Right Component or Placeholder */}
          <View className="w-10 h-10 items-center justify-center">
            {rightComponent}
          </View>
        </View>
      </View>
    </>
  );
};
