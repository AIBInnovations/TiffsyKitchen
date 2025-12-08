import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface OrderCardProps {
  orderId: string;
  customerName: string;
  status: string;
  totalAmount: number;
  onPress?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  orderId,
  customerName,
  status,
  totalAmount,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card className="mb-3">
        <View className="flex-row justify-between items-center">
          <Text className="font-bold text-lg">#{orderId}</Text>
          <Badge text={status} />
        </View>
        <Text className="text-gray-600 mt-2">{customerName}</Text>
        <Text className="font-semibold mt-1">₦{totalAmount.toLocaleString()}</Text>
      </Card>
    </TouchableOpacity>
  );
};
