import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';

interface UserCardProps {
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  onPress?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  name,
  email,
  phone,
  avatarUrl,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card className="mb-3">
        <View className="flex-row items-center">
          <Avatar source={avatarUrl} name={name} size="md" />
          <View className="ml-3 flex-1">
            <Text className="font-bold">{name}</Text>
            <Text className="text-gray-600 text-sm">{email}</Text>
            <Text className="text-gray-500 text-sm">{phone}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};
