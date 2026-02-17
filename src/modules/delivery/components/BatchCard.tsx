import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../../../components/common/Card';
import BatchStatusBadge from './BatchStatusBadge';

interface Props {
  batch: any;
  onPress: (batchId: string) => void;
}

const BatchCard: React.FC<Props> = ({ batch, onPress }) => {
  const route = batch.routeOptimization;
  const driver = batch.driverId;

  return (
    <TouchableOpacity onPress={() => onPress(batch._id)} activeOpacity={0.7}>
      <Card className="p-4 mb-3">
        {/* Header Row */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-bold text-gray-800 flex-1" numberOfLines={1}>
            {batch.batchNumber}
          </Text>
          <BatchStatusBadge status={batch.status} />
        </View>

        {/* Kitchen -> Zone + Meal Window */}
        <View className="flex-row items-center mb-2">
          <Icon name="store" size={16} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-1" numberOfLines={1}>
            {batch.kitchenId?.name || 'Unknown'}
          </Text>
          <Icon name="arrow-forward" size={14} color="#9ca3af" style={{ marginHorizontal: 4 }} />
          <Text className="text-sm text-gray-600" numberOfLines={1}>
            {batch.zoneId?.name || 'Unknown'}
          </Text>
          <Text className="text-xs text-gray-400 ml-2">
            {batch.mealWindow} · {batch.orderIds?.length || 0} orders
          </Text>
        </View>

        {/* Driver Info */}
        <View className="flex-row items-center mb-2">
          <Icon name="person" size={16} color="#6b7280" />
          {driver ? (
            <Text className="text-sm text-gray-600 ml-1">
              {driver.name}
              {batch.assignmentStrategy?.assignedScore
                ? ` (Score: ${batch.assignmentStrategy.assignedScore})`
                : ''}
              {batch.assignmentStrategy?.mode
                ? ` · ${batch.assignmentStrategy.mode.replace(/_/g, ' ')}`
                : ''}
            </Text>
          ) : (
            <Text className="text-sm text-gray-400 ml-1 italic">Not assigned</Text>
          )}
        </View>

        {/* Route Info */}
        {route && (
          <View className="flex-row items-center mb-2">
            <Icon name="route" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {route.algorithm}{route.totalDistanceMeters != null ? ` · ${(route.totalDistanceMeters / 1000).toFixed(1)} km` : ''}{route.totalDurationSeconds != null ? ` · ~${Math.round(route.totalDurationSeconds / 60)} min` : ''}{route.improvementPercent != null ? ` · ${route.improvementPercent}% optimized` : ''}
            </Text>
          </View>
        )}

        {/* Delivery Progress */}
        {(batch.totalDelivered > 0 || batch.totalFailed > 0) && (
          <View className="flex-row items-center">
            <Icon name="check-circle" size={14} color="#16a34a" />
            <Text className="text-xs text-green-600 ml-1">{batch.totalDelivered}</Text>
            <Icon name="cancel" size={14} color="#dc2626" style={{ marginLeft: 8 }} />
            <Text className="text-xs text-red-600 ml-1">{batch.totalFailed}</Text>
            <Text className="text-xs text-gray-400 ml-2">
              Pending: {(batch.orderIds?.length || 0) - batch.totalDelivered - batch.totalFailed}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

export default BatchCard;
