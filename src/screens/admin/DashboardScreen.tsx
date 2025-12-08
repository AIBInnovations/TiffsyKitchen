import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { MealType } from '../../types/dashboard';
import {
  FilterBar,
  KpiCard,
  OrderStatusFunnel,
  MealSlotCard,
  BusinessChart,
  PlanSummaryRow,
  RecentActivityList,
  SectionHeader,
  DatePickerModal,
} from '../../components/dashboard';
import {
  mockKpiMetrics,
  mockOrderStatusFunnel,
  mockMealSlots,
  mockChartData,
  mockPlanSummary,
  mockRecentActivity,
} from '../../data/dashboardMockData';

interface DashboardScreenProps {
  onMenuPress: () => void;
  onNotificationPress?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onMenuPress,
  onNotificationPress,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMealType, setSelectedMealType] = useState<MealType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const handleDatePress = () => {
    setDatePickerVisible(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMealTypeChange = (mealType: MealType) => {
    setSelectedMealType(mealType);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleOrderStatusPress = (status: string) => {
    Alert.alert('Order Status', `Viewing orders with status: ${status}`);
  };

  const handlePlanPress = (planId: string) => {
    Alert.alert('Plan Details', `Viewing plan: ${planId}`);
  };

  const handleActivityPress = (activityId: string) => {
    Alert.alert('Activity Details', `Viewing activity: ${activityId}`);
  };

  const handleViewAllPlans = () => {
    Alert.alert('Plans', 'Navigating to all plans');
  };

  const handleViewAllActivity = () => {
    Alert.alert('Activity', 'Navigating to all activity');
  };

  // Filter meal slots based on selected meal type
  const filteredMealSlots =
    selectedMealType === 'all'
      ? mockMealSlots
      : mockMealSlots.filter((slot) => slot.mealType === selectedMealType);

  // Calculate filtered KPIs based on meal type
  const getFilteredKpis = () => {
    if (selectedMealType === 'all') {
      return mockKpiMetrics;
    }

    // Calculate multiplier based on meal type (lunch ~60%, dinner ~40%)
    const multiplier = selectedMealType === 'lunch' ? 0.58 : 0.42;

    return mockKpiMetrics.map((metric) => ({
      ...metric,
      value: Math.round(metric.value * multiplier),
    }));
  };

  // Calculate filtered order status based on meal type
  const getFilteredOrderStatus = () => {
    if (selectedMealType === 'all') {
      return mockOrderStatusFunnel;
    }

    const multiplier = selectedMealType === 'lunch' ? 0.58 : 0.42;

    return mockOrderStatusFunnel.map((item) => ({
      ...item,
      count: Math.round(item.count * multiplier),
    }));
  };

  const filteredKpis = getFilteredKpis();
  const filteredOrderStatus = getFilteredOrderStatus();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <MaterialIcons name="menu" size={26} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tiffsy Kitchen</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={onNotificationPress}
            style={styles.notificationButton}
          >
            <MaterialIcons name="notifications-none" size={24} color="#ffffff" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>
      </View>

      {/* Dashboard Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#f97316']}
            tintColor="#f97316"
          />
        }
      >
        {/* Filter Bar */}
        <FilterBar
          selectedDate={selectedDate}
          selectedMealType={selectedMealType}
          onDatePress={handleDatePress}
          onMealTypeChange={handleMealTypeChange}
        />

        {/* KPI Cards */}
        <SectionHeader title="Today's Overview" />
        <View style={styles.kpiGrid}>
          {filteredKpis.map((metric) => (
            <KpiCard key={metric.id} metric={metric} />
          ))}
        </View>

        {/* Order Status Funnel */}
        <OrderStatusFunnel
          items={filteredOrderStatus}
          onItemPress={handleOrderStatusPress}
        />

        {/* Meal Slot Snapshot */}
        <SectionHeader title="Meal Slots" subtitle="Current status" />
        <View style={styles.mealSlotGrid}>
          {filteredMealSlots.map((slot) => (
            <MealSlotCard key={slot.mealType} slot={slot} />
          ))}
        </View>

        {/* Business Chart */}
        <BusinessChart data={mockChartData} />

        {/* Plan Summary */}
        <PlanSummaryRow
          plans={mockPlanSummary}
          onPlanPress={handlePlanPress}
          onViewAllPress={handleViewAllPlans}
        />

        {/* Recent Activity */}
        <RecentActivityList
          activities={mockRecentActivity}
          onActivityPress={handleActivityPress}
          onViewAllPress={handleViewAllActivity}
          maxItems={5}
        />

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        selectedDate={selectedDate}
        onClose={() => setDatePickerVisible(false)}
        onDateSelect={handleDateSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 4,
    marginRight: 12,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f97316',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealSlotGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});

DashboardScreen.displayName = 'DashboardScreen';

export default DashboardScreen;
