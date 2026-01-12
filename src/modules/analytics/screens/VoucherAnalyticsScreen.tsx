import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ProgressChart, BarChart } from 'react-native-chart-kit';
import adminDashboardService from '../../../services/admin-dashboard.service';
import { Card } from '../../../components/common/Card';

const screenWidth = Dimensions.get('window').width;

const VoucherAnalyticsScreen: React.FC = () => {
  const { data: stats, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['voucherStats'],
    queryFn: () => adminDashboardService.getVoucherStats(),
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  const redemptionRate = stats ? parseFloat(stats.redemptionRate) / 100 : 0;
  const expiryRate = stats ? parseFloat(stats.expiryRate) / 100 : 0;

  const rateData = {
    labels: ['Redemption', 'Expiry'],
    data: [redemptionRate, expiryRate],
  };

  const mealWindowData = stats ? {
    labels: ['Lunch', 'Dinner'],
    datasets: [{
      data: [
        stats.byMealWindow.lunch.redeemed,
        stats.byMealWindow.dinner.redeemed,
      ],
    }],
  } : {
    labels: [],
    datasets: [{ data: [] }],
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#f97316']} />
      }
    >
      {/* Key Metrics */}
      <View className="p-4">
        <View className="flex-row flex-wrap -mx-2">
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-gray-800">
                {stats?.totalIssued.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Total Issued</Text>
            </Card>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-green-600">
                {stats?.totalRedeemed.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Total Redeemed</Text>
            </Card>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-red-600">
                {stats?.totalExpired.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Total Expired</Text>
            </Card>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-blue-600">
                {stats?.totalAvailable.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Available</Text>
            </Card>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-purple-600">
                {stats?.totalRestored.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Restored</Text>
            </Card>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <Card className="p-4">
              <Text className="text-2xl font-bold text-gray-600">
                {stats?.totalCancelled.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Cancelled</Text>
            </Card>
          </View>
        </View>
      </View>

      {/* Redemption and Expiry Rates */}
      <View className="px-4 pb-4">
        <Card className="p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Redemption & Expiry Rates</Text>

          <ProgressChart
            data={rateData}
            width={screenWidth - 64}
            height={200}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1, index) => {
                if (index === 0) return `rgba(34, 197, 94, ${opacity})`; // Green for redemption
                return `rgba(239, 68, 68, ${opacity})`; // Red for expiry
              },
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            }}
            hideLegend={false}
          />

          <View className="mt-4 space-y-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded bg-green-500 mr-2" />
                <Text className="text-sm text-gray-700">Redemption Rate</Text>
              </View>
              <Text className="text-lg font-semibold text-green-600">
                {stats?.redemptionRate}%
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded bg-red-500 mr-2" />
                <Text className="text-sm text-gray-700">Expiry Rate</Text>
              </View>
              <Text className="text-lg font-semibold text-red-600">
                {stats?.expiryRate}%
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Meal Window Comparison */}
      <View className="px-4 pb-6">
        <Card className="p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Redemptions by Meal Window</Text>

          {mealWindowData.datasets[0].data.length > 0 && (
            <BarChart
              data={mealWindowData}
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
            <View className="flex-1 items-center">
              <Text className="text-sm text-gray-600">Lunch</Text>
              <Text className="text-xl font-semibold text-gray-800 mt-1">
                {stats?.byMealWindow.lunch.redeemed.toLocaleString()}
              </Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-sm text-gray-600">Dinner</Text>
              <Text className="text-xl font-semibold text-gray-800 mt-1">
                {stats?.byMealWindow.dinner.redeemed.toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

export default VoucherAnalyticsScreen;