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

const RefundAnalyticsScreen: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'from' | 'to'>('from');

  const { data: stats, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['refundStats', format(dateFrom, 'yyyy-MM-dd'), format(dateTo, 'yyyy-MM-dd')],
    queryFn: () => adminDashboardService.getRefundStats({
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

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
                {stats?.totalRefunds.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Total Refunds</Text>
            </Card>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-gray-800">
                ₹{stats?.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Total Amount</Text>
            </Card>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-green-600">
                {stats?.completedRefunds.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Completed</Text>
            </Card>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-red-600">
                {stats?.failedRefunds.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Failed</Text>
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
              <Text className="text-2xl font-bold text-gray-800">
                {stats?.avgProcessingTimeHours}h
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Avg Processing Time</Text>
            </Card>
          </View>
        </View>
      </View>

      {/* Status Breakdown */}
      <View className="px-4 pb-4">
        <Card className="p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Status Breakdown</Text>

          {stats?.byStatus && Object.keys(stats.byStatus).length > 0 ? (
            <View>
              {/* Table Header */}
              <View className="flex-row pb-3 border-b border-gray-200">
                <Text className="flex-1 text-sm font-semibold text-gray-700">Status</Text>
                <Text className="w-20 text-sm font-semibold text-gray-700 text-right">Count</Text>
                <Text className="w-24 text-sm font-semibold text-gray-700 text-right">Amount</Text>
              </View>

              {/* Table Rows */}
              {Object.entries(stats.byStatus).map(([status, data], index, array) => (
                <View
                  key={status}
                  className={`flex-row py-3 ${index !== array.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <View className="flex-1">
                    <View className={`self-start px-2 py-1 rounded ${getStatusColor(status)}`}>
                      <Text className="text-xs font-medium">{status}</Text>
                    </View>
                  </View>
                  <Text className="w-20 text-sm text-gray-800 text-right">
                    {data.count.toLocaleString()}
                  </Text>
                  <Text className="w-24 text-sm text-gray-800 text-right">
                    ₹{data.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-center text-gray-500 py-4">No status data available</Text>
          )}
        </Card>
      </View>

      {/* Refund Reasons */}
      <View className="px-4 pb-6">
        <Card className="p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Refund Reasons</Text>

          {stats?.byReason && Object.keys(stats.byReason).length > 0 ? (
            <View>
              {Object.entries(stats.byReason)
                .sort(([, a], [, b]) => b - a)
                .map(([reason, count], index, array) => (
                  <View
                    key={reason}
                    className={`flex-row justify-between py-3 ${index !== array.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <Text className="flex-1 text-sm text-gray-700 pr-2">
                      {reason.replace(/_/g, ' ')}
                    </Text>
                    <Text className="text-sm font-semibold text-gray-800">
                      {count.toLocaleString()}
                    </Text>
                  </View>
                ))}
            </View>
          ) : (
            <Text className="text-center text-gray-500 py-4">No reason data available</Text>
          )}
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

export default RefundAnalyticsScreen;