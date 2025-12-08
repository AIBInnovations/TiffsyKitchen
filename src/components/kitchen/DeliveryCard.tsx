import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface DeliveryCardProps {
  orderId: string;
  customerName: string;
  address: string;
  status: string;
  driverName?: string;
  onPress?: () => void;
}

export const DeliveryCard: React.FC<DeliveryCardProps> = ({
  orderId,
  customerName,
  address,
  status,
  driverName,
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
        <Text className="text-gray-600 text-sm mt-1">{address}</Text>
        {driverName && (
          <Text className="text-blue-500 text-sm mt-2">Driver: {driverName}</Text>
        )}
      </Card>
    </TouchableOpacity>
  );
};
