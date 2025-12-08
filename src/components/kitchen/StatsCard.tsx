import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../common/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
}) => {
  return (
    <Card className="flex-1 mr-2 last:mr-0">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-gray-600 text-sm">{title}</Text>
          <Text className="font-bold text-2xl mt-1">{value}</Text>
          {trend && (
            <Text className={`text-sm mt-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Text>
          )}
        </View>
        {icon && <View>{icon}</View>}
      </View>
    </Card>
  );
};
