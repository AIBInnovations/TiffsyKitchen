import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../common/Card';

interface EarningsCardProps {
  period: string;
  totalEarnings: number;
  deliveriesCount: number;
  averagePerDelivery?: number;
}

export const EarningsCard: React.FC<EarningsCardProps> = ({
  period,
  totalEarnings,
  deliveriesCount,
  averagePerDelivery,
}) => {
  return (
    <Card className="mb-3">
      <Text className="text-gray-600 text-sm">{period}</Text>
      <Text className="font-bold text-2xl mt-1">₦{totalEarnings.toLocaleString()}</Text>
      <View className="flex-row mt-3">
        <View className="flex-1">
          <Text className="text-gray-600 text-xs">Deliveries</Text>
          <Text className="font-semibold">{deliveriesCount}</Text>
        </View>
        {averagePerDelivery && (
          <View className="flex-1">
            <Text className="text-gray-600 text-xs">Avg/Delivery</Text>
            <Text className="font-semibold">₦{averagePerDelivery.toLocaleString()}</Text>
          </View>
        )}
      </View>
    </Card>
  );
};
