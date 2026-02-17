import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaScreen } from '../../../components/common/SafeAreaScreen';
import { deliveryService } from '../../../services/delivery.service';
import { Card } from '../../../components/common/Card';

interface Props {
  onMenuPress: () => void;
}

const DATE_RANGES = [
  { label: 'Today', getValue: () => { const d = new Date().toISOString().split('T')[0]; return { dateFrom: d, dateTo: d }; }},
  { label: 'Last 7 Days', getValue: () => { const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 7); return { dateFrom: from.toISOString().split('T')[0], dateTo: to.toISOString().split('T')[0] }; }},
  { label: 'Last 30 Days', getValue: () => { const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 30); return { dateFrom: from.toISOString().split('T')[0], dateTo: to.toISOString().split('T')[0] }; }},
  { label: 'All Time', getValue: () => ({}) },
];

const DeliveryStatsScreen: React.FC<Props> = ({ onMenuPress }) => {
  const [selectedRange, setSelectedRange] = useState(0);
  const dateRange = DATE_RANGES[selectedRange].getValue();

  const { data, isLoading } = useQuery({
    queryKey: ['deliveryStats', selectedRange],
    queryFn: () => deliveryService.getDeliveryStats(dateRange as any),
  });

  const stats = data?.data || data?.error;

  return (
    <SafeAreaScreen topBackgroundColor="#F56B4C" bottomBackgroundColor="#f9fafb" backgroundColor="#f9fafb">
      {/* Header */}
      <View className="bg-[#F56B4C] px-4 pb-3 pt-2 flex-row items-center">
        <TouchableOpacity onPress={onMenuPress} className="mr-4">
          <Icon name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-semibold">Delivery Statistics</Text>
      </View>

      {/* Date Range Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
        {DATE_RANGES.map((range, index) => (
          <TouchableOpacity
            key={range.label}
            onPress={() => setSelectedRange(index)}
            className={`px-4 py-2 rounded-full mr-2 ${
              selectedRange === index ? 'bg-orange-500' : 'bg-white border border-gray-300'
            }`}
          >
            <Text className={`text-sm ${selectedRange === index ? 'text-white font-semibold' : 'text-gray-600'}`}>
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F56B4C" />
        </View>
      ) : stats ? (
        <ScrollView className="flex-1">
          {/* Summary Cards */}
          <View className="flex-row flex-wrap px-4">
            <View className="w-1/2 pr-2 mb-3">
              <Card className="p-4 items-center">
                <Icon name="layers" size={24} color="#3b82f6" />
                <Text className="text-2xl font-bold text-gray-800 mt-1">{stats.totalBatches || 0}</Text>
                <Text className="text-xs text-gray-500">Total Batches</Text>
              </Card>
            </View>
            <View className="w-1/2 pl-2 mb-3">
              <Card className="p-4 items-center">
                <Icon name="local-shipping" size={24} color="#8b5cf6" />
                <Text className="text-2xl font-bold text-gray-800 mt-1">{stats.totalOrders || stats.totalDeliveries || 0}</Text>
                <Text className="text-xs text-gray-500">Total Deliveries</Text>
              </Card>
            </View>
            <View className="w-1/2 pr-2 mb-3">
              <Card className="p-4 items-center">
                <Icon name="check-circle" size={24} color="#16a34a" />
                <Text className="text-2xl font-bold text-green-600 mt-1">{stats.successRate || 0}%</Text>
                <Text className="text-xs text-gray-500">Success Rate</Text>
              </Card>
            </View>
            <View className="w-1/2 pl-2 mb-3">
              <Card className="p-4 items-center">
                <Icon name="cancel" size={24} color="#dc2626" />
                <Text className="text-2xl font-bold text-red-600 mt-1">{stats.failedDeliveries || stats.totalFailed || 0}</Text>
                <Text className="text-xs text-gray-500">Failed</Text>
              </Card>
            </View>
          </View>

          {/* By Zone */}
          {stats.byZone?.length > 0 && (
            <View className="px-4 pb-4">
              <Card className="p-4">
                <View className="flex-row items-center mb-4">
                  <Icon name="location-on" size={24} color="#F56B4C" />
                  <Text className="text-lg font-semibold text-gray-800 ml-2">By Zone</Text>
                </View>

                {stats.byZone.map((zone: any, index: number) => (
                  <View key={zone._id || index} className="mb-3">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-sm font-medium text-gray-700">
                        {zone.zone?.name || zone.zone || zone._id}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {zone.orders || zone.deliveries || 0} deliveries · {zone.successRate || 0}%
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View
                        className="h-2 rounded-full"
                        style={{
                          width: `${zone.successRate || 0}%`,
                          backgroundColor: (zone.successRate || 0) >= 95 ? '#16a34a' : (zone.successRate || 0) >= 85 ? '#eab308' : '#dc2626',
                        }}
                      />
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* By Driver */}
          {stats.byDriver?.length > 0 && (
            <View className="px-4 pb-4">
              <Card className="p-4">
                <View className="flex-row items-center mb-4">
                  <Icon name="person" size={24} color="#F56B4C" />
                  <Text className="text-lg font-semibold text-gray-800 ml-2">By Driver</Text>
                </View>

                {stats.byDriver.map((driver: any, index: number) => (
                  <View key={driver.driver?._id || index} className="flex-row items-center justify-between py-2 border-b border-gray-100">
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-700">{driver.driver?.name || 'Unknown'}</Text>
                      <Text className="text-xs text-gray-500">{driver.batches} batches · {driver.orders} orders</Text>
                    </View>
                    <View className="items-end">
                      <Text className={`text-sm font-semibold ${(driver.successRate || 0) >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
                        {driver.successRate || 0}%
                      </Text>
                      {driver.failed > 0 && (
                        <Text className="text-xs text-red-500">{driver.failed} failed</Text>
                      )}
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          )}
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Icon name="bar-chart" size={48} color="#d1d5db" />
          <Text className="text-gray-400 text-base mt-4">No statistics available</Text>
        </View>
      )}
    </SafeAreaScreen>
  );
};

export default DeliveryStatsScreen;
