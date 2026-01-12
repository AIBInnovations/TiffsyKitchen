import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import OrderStatsCard from './OrderStatsCard';
import {OrderStatistics} from '../../../types/api.types';

interface OrderStatsDashboardProps {
  stats: OrderStatistics | null;
  loading?: boolean;
  onStatusPress?: (status: string) => void;
  onRefresh?: () => void;
}

const STATUS_CONFIG = {
  placed: {
    label: 'Placed',
    icon: 'receipt',
    color: '#007AFF',
  },
  accepted: {
    label: 'Accepted',
    icon: 'check-circle',
    color: '#00C7BE',
  },
  preparing: {
    label: 'Preparing',
    icon: 'restaurant',
    color: '#FFCC00',
  },
  ready: {
    label: 'Ready',
    icon: 'done-all',
    color: '#FF9500',
  },
  pickedUp: {
    label: 'Picked Up',
    icon: 'local-shipping',
    color: '#AF52DE',
  },
  outForDelivery: {
    label: 'Out for Delivery',
    icon: 'directions-bike',
    color: '#5856D6',
  },
  delivered: {
    label: 'Delivered',
    icon: 'home',
    color: '#34C759',
  },
  cancelled: {
    label: 'Cancelled',
    icon: 'close',
    color: '#FF3B30',
  },
  rejected: {
    label: 'Rejected',
    icon: 'cancel',
    color: '#FF3B30',
  },
};

export const OrderStatsDashboard: React.FC<OrderStatsDashboardProps> = ({
  stats,
  loading,
  onStatusPress,
  onRefresh,
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="bar-chart" size={48} color="#C7C7CC" />
        <Text style={styles.emptyText}>No statistics available</Text>
        {onRefresh && (
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Order Statistics</Text>
          <Text style={styles.headerSubtitle}>Today's Overview</Text>
        </View>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} style={styles.refreshIcon}>
            <MaterialIcons name="refresh" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Total Orders Card */}
      <View style={styles.totalCard}>
        <View style={styles.totalIconContainer}>
          <MaterialIcons name="shopping-bag" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.totalContent}>
          <Text style={styles.totalLabel}>Total Orders Today</Text>
          <Text style={styles.totalValue}>{stats.today.total}</Text>
        </View>
      </View>

      {/* Status Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Order Status</Text>
      </View>
      <View style={styles.statsGrid}>
        <OrderStatsCard
          label={STATUS_CONFIG.placed.label}
          value={stats.today.placed}
          color={STATUS_CONFIG.placed.color}
          icon={STATUS_CONFIG.placed.icon}
          highlight={stats.today.placed > 0}
        />
        <OrderStatsCard
          label={STATUS_CONFIG.accepted.label}
          value={stats.today.accepted}
          color={STATUS_CONFIG.accepted.color}
          icon={STATUS_CONFIG.accepted.icon}
        />
        <OrderStatsCard
          label={STATUS_CONFIG.preparing.label}
          value={stats.today.preparing}
          color={STATUS_CONFIG.preparing.color}
          icon={STATUS_CONFIG.preparing.icon}
        />
        <OrderStatsCard
          label={STATUS_CONFIG.ready.label}
          value={stats.today.ready}
          color={STATUS_CONFIG.ready.color}
          icon={STATUS_CONFIG.ready.icon}
        />
        <OrderStatsCard
          label={STATUS_CONFIG.pickedUp.label}
          value={stats.today.pickedUp}
          color={STATUS_CONFIG.pickedUp.color}
          icon={STATUS_CONFIG.pickedUp.icon}
        />
        <OrderStatsCard
          label={STATUS_CONFIG.outForDelivery.label}
          value={stats.today.outForDelivery}
          color={STATUS_CONFIG.outForDelivery.color}
          icon={STATUS_CONFIG.outForDelivery.icon}
        />
        <OrderStatsCard
          label={STATUS_CONFIG.delivered.label}
          value={stats.today.delivered}
          color={STATUS_CONFIG.delivered.color}
          icon={STATUS_CONFIG.delivered.icon}
        />
        <OrderStatsCard
          label={STATUS_CONFIG.cancelled.label}
          value={stats.today.cancelled}
          color={STATUS_CONFIG.cancelled.color}
          icon={STATUS_CONFIG.cancelled.icon}
        />
      </View>

      {/* Menu Type Breakdown */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>By Menu Type</Text>
      </View>
      <View style={styles.menuTypeGrid}>
        <View style={[styles.menuTypeCard, {borderLeftColor: '#34C759'}]}>
          <MaterialIcons name="restaurant-menu" size={24} color="#34C759" />
          <Text style={styles.menuTypeLabel}>Meal Menu</Text>
          <Text style={[styles.menuTypeValue, {color: '#34C759'}]}>
            {stats.byMenuType.MEAL_MENU}
          </Text>
        </View>
        <View style={[styles.menuTypeCard, {borderLeftColor: '#007AFF'}]}>
          <MaterialIcons name="fastfood" size={24} color="#007AFF" />
          <Text style={styles.menuTypeLabel}>On-Demand</Text>
          <Text style={[styles.menuTypeValue, {color: '#007AFF'}]}>
            {stats.byMenuType.ON_DEMAND_MENU}
          </Text>
        </View>
      </View>

      {/* Meal Window Breakdown */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>By Meal Window</Text>
      </View>
      <View style={styles.menuTypeGrid}>
        <View style={[styles.menuTypeCard, {borderLeftColor: '#FFCC00'}]}>
          <MaterialIcons name="wb-sunny" size={24} color="#FFCC00" />
          <Text style={styles.menuTypeLabel}>Lunch</Text>
          <Text style={[styles.menuTypeValue, {color: '#FFCC00'}]}>
            {stats.byMealWindow.LUNCH}
          </Text>
        </View>
        <View style={[styles.menuTypeCard, {borderLeftColor: '#5856D6'}]}>
          <MaterialIcons name="nights-stay" size={24} color="#5856D6" />
          <Text style={styles.menuTypeLabel}>Dinner</Text>
          <Text style={[styles.menuTypeValue, {color: '#5856D6'}]}>
            {stats.byMealWindow.DINNER}
          </Text>
        </View>
      </View>

      {/* Revenue */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Revenue</Text>
      </View>
      <View style={styles.revenueCard}>
        <View style={styles.revenueRow}>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Today</Text>
            <Text style={styles.revenueValue}>₹{stats.revenue.today.toLocaleString()}</Text>
          </View>
          <View style={styles.revenueDivider} />
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Avg Order Value</Text>
            <Text style={styles.revenueValue}>
              ₹{stats.averageOrderValue.MEAL_MENU.toFixed(0)}
            </Text>
          </View>
        </View>
      </View>

      <View style={{height: 20}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  refreshButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  refreshIcon: {
    padding: 8,
  },
  totalCard: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  totalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  totalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  menuTypeGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  menuTypeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuTypeLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
    marginBottom: 4,
  },
  menuTypeValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  revenueCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  revenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  revenueItem: {
    flex: 1,
  },
  revenueDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  revenueLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34C759',
  },
});
