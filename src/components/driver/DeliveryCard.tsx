import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface DriverDeliveryCardProps {
  orderId: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: string;
  estimatedTime?: string;
  onPress?: () => void;
}

export const DeliveryCard: React.FC<DriverDeliveryCardProps> = ({
  orderId,
  customerName,
  customerPhone,
  pickupAddress,
  deliveryAddress,
  status,
  estimatedTime,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card className="mb-3">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="font-bold">#{orderId}</Text>
          <Badge text={status} />
        </View>
        <Text className="font-semibold">{customerName}</Text>
        <Text className="text-gray-500 text-sm">{customerPhone}</Text>
        <View className="mt-3">
          <Text className="text-gray-600 text-xs">PICKUP</Text>
          <Text className="text-sm">{pickupAddress}</Text>
        </View>
        <View className="mt-2">
          <Text className="text-gray-600 text-xs">DELIVERY</Text>
          <Text className="text-sm">{deliveryAddress}</Text>
        </View>
        {estimatedTime && (
          <Text className="text-blue-500 text-sm mt-2">ETA: {estimatedTime}</Text>
        )}
      </Card>
    </TouchableOpacity>
  );
};
