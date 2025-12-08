import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';

interface AddonCardProps {
  name: string;
  price: number;
  isActive: boolean;
  onPress?: () => void;
}

export const AddonCard: React.FC<AddonCardProps> = ({
  name,
  price,
  isActive,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card className={`mb-3 ${!isActive ? 'opacity-50' : ''}`}>
        <View className="flex-row justify-between items-center">
          <Text className="font-semibold">{name}</Text>
          <Text className="text-gray-600">₦{price.toLocaleString()}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};
