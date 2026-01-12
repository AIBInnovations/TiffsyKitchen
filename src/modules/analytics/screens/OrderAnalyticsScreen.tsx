import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { PieChart, BarChart } from 'react-native-chart-kit';
import adminDashboardService, { OrderStats } from '../../../services/admin-dashboard.service';
import { Card } from '../../../components/common/Card';
import { DatePickerModal } from '../../../components/dashboard/DatePickerModal';
import { format } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

const OrderAnalyticsScreen: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'from' | 'to'>('from');

  const { data: stats, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orderStats', format(dateFrom, 'yyyy-MM-dd'), format(dateTo, 'yyyy-MM-dd')],
    queryFn: () => adminDashboardService.getOrderStats({
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

  // Prepare pie chart data for order status
  const statusChartData = stats ? Object.entries(stats.byStatus).map(([key, value], index) => ({
    name: key.replace(/_/g, ' '),
    population: value,
    color: getStatusColor(key, index),
    legendFontColor: '#6b7280',
    legendFontSize: 12,
  })) : [];

  // Prepare bar chart data for menu types
  const menuTypeData = stats ? {
    labels: ['Meal Menu', 'On Demand'],
    datasets: [{
      data: [
        stats.byMenuType.MEAL_MENU || 0,
        stats.byMenuType.ON_DEMAND_MENU || 0,
      ],
    }],
  } : {
    labels: [],
    datasets: [{ data: [] }],
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
                {stats?.totalOrders.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Total Orders</Text>
            </Card>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-gray-800">
                ₹{stats?.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Total Revenue</Text>
            </Card>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-gray-800">
                ₹{stats?.avgOrderValue.toFixed(2)}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Avg Order Value</Text>
            </Card>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-gray-800">
                {stats?.totalVouchersUsed.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Vouchers Used</Text>
            </Card>
          </View>
        </View>
      </View>

      {/* Order Status Breakdown */}
      <View className="px-4 pb-4">
        <Card className="p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Order Status Breakdown</Text>
          {statusChartData.length > 0 && (
            <PieChart
              data={statusChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          )}
        </Card>
      </View>

      {/* Menu Type Distribution */}
      <View className="px-4 pb-4">
        <Card className="p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Orders by Menu Type</Text>
          {menuTypeData.datasets[0].data.length > 0 && (
            <BarChart
              data={menuTypeData}
              width={screenWidth - 64}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForLabels: {
                  fontSize: 12,
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              showValuesOnTopOfBars
            />
          )}
          <View className="mt-4 flex-row justify-between">
            <View>
              <Text className="text-sm text-gray-600">Meal Menu</Text>
              <Text className="text-lg font-semibold text-gray-800">
                {stats?.byMenuType.MEAL_MENU.toLocaleString()}
              </Text>
            </View>
            <View>
              <Text className="text-sm text-gray-600">On Demand</Text>
              <Text className="text-lg font-semibold text-gray-800">
                {stats?.byMenuType.ON_DEMAND_MENU.toLocaleString()}
              </Text>
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

const getStatusColor = (status: string, index: number): string => {
  const colors: Record<string, string> = {
    DELIVERED: '#22c55e',
    CANCELLED: '#ef4444',
    PLACED: '#3b82f6',
    ACCEPTED: '#8b5cf6',
    PREPARING: '#eab308',
    READY: '#06b6d4',
    PICKED_UP: '#10b981',
    OUT_FOR_DELIVERY: '#f59e0b',
    REJECTED: '#dc2626',
    FAILED: '#991b1b',
  };
  return colors[status] || `hsl(${index * 40}, 70%, 50%)`;
};

export default OrderAnalyticsScreen;