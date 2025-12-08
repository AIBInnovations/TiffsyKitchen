import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';

interface MenuItemCardProps {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  onPress?: () => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  name,
  description,
  price,
  imageUrl,
  isAvailable,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card className={`mb-3 ${!isAvailable ? 'opacity-50' : ''}`}>
        <View className="flex-row">
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              className="w-20 h-20 rounded-lg mr-3"
            />
          )}
          <View className="flex-1">
            <Text className="font-bold text-lg">{name}</Text>
            <Text className="text-gray-600 text-sm" numberOfLines={2}>{description}</Text>
            <Text className="font-semibold mt-1">₦{price.toLocaleString()}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};
