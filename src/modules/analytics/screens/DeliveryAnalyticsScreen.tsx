import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import adminDashboardService from '../../../services/admin-dashboard.service';
import { Card } from '../../../components/common/Card';
import { DatePickerModal } from '../../../components/dashboard/DatePickerModal';
import { format } from 'date-fns';

const DeliveryAnalyticsScreen: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'from' | 'to'>('from');

  const { data: stats, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['deliveryStats', format(dateFrom, 'yyyy-MM-dd'), format(dateTo, 'yyyy-MM-dd')],
    queryFn: () => adminDashboardService.getDeliveryStats({
      dateFrom: format(dateFrom, 'yyyy-MM-dd'),
      dateTo: format(dateTo, 'yyyy-MM-dd'),
    }),
    staleTime: 60000, // 1 minute
  });

  const openDatePicker = (mode: 'from' | 'to') => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const handleDateChange = (date: Date) => {
    if (datePickerMode === 'from') {
      setDateFrom(date);
    } else {
      setDateTo(date);
    }
    setShowDatePicker(false);
  };

  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 95) return 'bg-green-100 text-green-800';
    if (rate >= 85) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#f97316']} />
      }
    >
      {/* Date Range Selector */}
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-sm font-medium text-gray-700 mb-2">Date Range</Text>
        <View className="flex-row items-center space-x-2">
          <View className="flex-1">
            <Text
              className="bg-gray-100 p-3 rounded-lg text-gray-800"
              onPress={() => openDatePicker('from')}
            >
              From: {format(dateFrom, 'MMM dd, yyyy')}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              className="bg-gray-100 p-3 rounded-lg text-gray-800"
              onPress={() => openDatePicker('to')}
            >
              To: {format(dateTo, 'MMM dd, yyyy')}
            </Text>
          </View>
        </View>
      </View>

      {/* Key Metrics */}
      <View className="p-4">
        <View className="flex-row flex-wrap -mx-2">
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-gray-800">
                {stats?.totalBatches.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Total Batches</Text>
            </Card>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-gray-800">
                {stats?.totalDeliveries.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Total Deliveries</Text>
            </Card>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className={`text-2xl font-bold ${stats && stats.successRate >= 95 ? 'text-green-600' : stats && stats.successRate >= 85 ? 'text-yellow-600' : 'text-red-600'}`}>
                {stats?.successRate}%
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Success Rate</Text>
            </Card>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-red-600">
                {stats?.totalFailed.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Failed Deliveries</Text>
            </Card>
          </View>
        </View>
      </View>

      {/* Zone-wise Performance */}
      <View className="px-4 pb-4">
        <Card className="p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Zone-wise Performance</Text>

          {stats?.byZone && stats.byZone.length > 0 ? (
            <View>
              {/* Table Header */}
              <View className="flex-row pb-3 border-b border-gray-200">
                <Text className="flex-1 text-sm font-semibold text-gray-700">Zone</Text>
                <Text className="w-24 text-sm font-semibold text-gray-700 text-right">Deliveries</Text>
                <Text className="w-24 text-sm font-semibold text-gray-700 text-right">Success Rate</Text>
              </View>

              {/* Table Rows */}
              {stats.byZone.map((zone, index) => (
                <View
                  key={zone._id}
                  className={`flex-row py-3 ${index !== stats.byZone.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <Text className="flex-1 text-sm text-gray-800">{zone.zone}</Text>
                  <Text className="w-24 text-sm text-gray-800 text-right">
                    {zone.deliveries.toLocaleString()}
                  </Text>
                  <View className="w-24 items-end">
                    <View className={`px-2 py-1 rounded ${getSuccessRateColor(zone.successRate)}`}>
                      <Text className="text-xs font-medium">{zone.successRate}%</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-center text-gray-500 py-4">No zone data available</Text>
          )}
        </Card>
      </View>

      {/* Success Rate Legend */}
      <View className="px-4 pb-6">
        <Card className="p-4">
          <Text className="text-sm font-medium text-gray-700 mb-3">Success Rate Legend</Text>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded bg-green-500 mr-2" />
              <Text className="text-sm text-gray-600">≥ 95% - Excellent</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded bg-yellow-500 mr-2" />
              <Text className="text-sm text-gray-600">85-95% - Good</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded bg-red-500 mr-2" />
              <Text className="text-sm text-gray-600">&lt; 85% - Needs Improvement</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={datePickerMode === 'from' ? dateFrom : dateTo}
        onDateChange={handleDateChange}
        onClose={() => setShowDatePicker(false)}
      />
    </ScrollView>
  );
};

export default DeliveryAnalyticsScreen;