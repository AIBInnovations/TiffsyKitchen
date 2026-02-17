import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { SafeAreaScreen } from '../../../components/common/SafeAreaScreen';
import { Header } from '../../../components/common/Header';
import { kitchenStaffService } from '../../../services/kitchen-staff.service';
import { useInAppNotifications } from '../../../context/InAppNotificationContext';
import { useNavigation } from '../../../context/NavigationContext';
import KitchenOrdersScreen from '../../orders/screens/KitchenOrdersScreen';
import { MenuManagementExample } from '../../menu/MenuManagementExample';
import { BatchManagementTab } from '../../kitchen/components/BatchManagementTab';

interface KitchenDashboardScreenProps {
  onMenuPress: () => void;
}

type TabId = 'overview' | 'orders' | 'menu' | 'batches' | 'profile';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Dashboard', icon: 'dashboard' },
  { id: 'orders', label: 'Orders', icon: 'receipt-long' },
  { id: 'menu', label: 'Menu', icon: 'restaurant-menu' },
  { id: 'batches', label: 'Batches', icon: 'local-shipping' },
  { id: 'profile', label: 'Profile', icon: 'store' },
];

export const KitchenDashboardScreen: React.FC<KitchenDashboardScreenProps> = ({
  onMenuPress,
}) => {
  const { unreadCount } = useInAppNotifications();
  const { navigate } = useNavigation();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const handleNotificationPress = () => {
    navigate('Notifications');
  };

  return (
    <SafeAreaScreen
      topBackgroundColor={colors.primary}
      bottomBackgroundColor={colors.background}
    >
      <Header
        title="Kitchen Dashboard"
        onMenuPress={onMenuPress}
        rightComponent={
          <TouchableOpacity onPress={handleNotificationPress} style={styles.notificationButton}>
            <MaterialIcons name="notifications-none" size={24} color="#ffffff" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.tabActive,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <MaterialIcons
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? colors.primary : colors.gray600}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.container}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'menu' && <MenuTab />}
        {activeTab === 'batches' && <BatchesTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </View>
    </SafeAreaScreen>
  );
};

// Overview Tab Component
const OverviewTab: React.FC = () => {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['kitchenDashboard'],
    queryFn: () => kitchenStaffService.getDashboardStats(),
    refetchInterval: 60000, // Refresh every minute
  });

  const stats = data?.data?.todayStats;
  const batchStats = data?.data?.batchStats;
  const menuStats = data?.data?.menuStats;
  const recentOrders = data?.data?.recentOrders || [];

  if (isLoading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.tabScrollView}
      contentContainerStyle={styles.tabScrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome back! 👋</Text>
        <Text style={styles.welcomeSubtitle}>
          {data?.data?.kitchen?.name || 'Your Kitchen'}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Today's Orders"
          value={stats?.ordersCount || 0}
          icon="receipt-long"
          color={colors.info}
        />
        <StatCard
          label="Revenue"
          value={`₹${stats?.ordersRevenue || 0}`}
          icon="currency-rupee"
          color={colors.success}
        />
        <StatCard
          label="Pending"
          value={stats?.pendingOrders || 0}
          icon="pending"
          color={colors.warning}
        />
        <StatCard
          label="Completed"
          value={stats?.completedOrders || 0}
          icon="check-circle"
          color={colors.success}
        />
      </View>

      {/* Meal Window Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meal Windows</Text>
        <View style={styles.mealWindowsGrid}>
          <MealWindowCard
            title="Lunch"
            orders={stats?.lunchOrders || 0}
            revenue={stats?.lunchRevenue || 0}
            icon="wb-sunny"
          />
          <MealWindowCard
            title="Dinner"
            orders={stats?.dinnerOrders || 0}
            revenue={stats?.dinnerRevenue || 0}
            icon="nightlight"
          />
        </View>
      </View>

      {/* Batch Status */}
      {batchStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Batch Status</Text>
          <View style={styles.batchStatsCard}>
            <BatchStatRow
              label="Collecting"
              value={batchStats.collectingBatches}
              color={colors.warning}
            />
            <BatchStatRow
              label="Ready"
              value={batchStats.readyBatches}
              color={colors.info}
            />
            <BatchStatRow
              label="Dispatched"
              value={batchStats.dispatchedBatches}
              color={colors.success}
            />
            <BatchStatRow
              label="Completed"
              value={batchStats.completedBatches}
              color={colors.gray600}
            />
          </View>
        </View>
      )}

      {/* Menu Stats */}
      {menuStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu Overview</Text>
          <View style={styles.menuStatsCard}>
            <View style={styles.menuStatItem}>
              <MaterialIcons name="restaurant-menu" size={32} color={colors.primary} />
              <Text style={styles.menuStatValue}>{menuStats.totalMenuItems}</Text>
              <Text style={styles.menuStatLabel}>Total Items</Text>
            </View>
            <View style={styles.menuStatItem}>
              <MaterialIcons name="check-circle" size={32} color={colors.success} />
              <Text style={styles.menuStatValue}>{menuStats.activeMenuItems}</Text>
              <Text style={styles.menuStatLabel}>Active</Text>
            </View>
            <View style={styles.menuStatItem}>
              <MaterialIcons name="error-outline" size={32} color={colors.gray400} />
              <Text style={styles.menuStatValue}>{menuStats.unavailableItems}</Text>
              <Text style={styles.menuStatLabel}>Unavailable</Text>
            </View>
          </View>
        </View>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {recentOrders.slice(0, 5).map((order) => (
            <View key={order._id} style={styles.recentOrderCard}>
              <View style={styles.recentOrderHeader}>
                <Text style={styles.recentOrderNumber}>{order.orderNumber}</Text>
                <Text style={styles.recentOrderAmount}>₹{order.totalAmount}</Text>
              </View>
              <View style={styles.recentOrderFooter}>
                <Text style={styles.recentOrderStatus}>{order.status}</Text>
                <Text style={styles.recentOrderTime}>
                  {new Date(order.placedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

// Orders Tab Component
const OrdersTab: React.FC = () => {
  return <KitchenOrdersScreen />;
};

// Menu Tab Component
const MenuTab: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['myKitchenStatus'],
    queryFn: () => kitchenStaffService.getMyKitchenStatus(),
  });

  const kitchenId = data?.data?.kitchen?._id;

  if (isLoading || !kitchenId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading kitchen info...</Text>
      </View>
    );
  }

  return (
    <MenuManagementExample
      kitchenId={kitchenId}
      userRole="KITCHEN_STAFF"
    />
  );
};

// Batches Tab Component
const BatchesTab: React.FC = () => {
  return <BatchManagementTab />;
};

// Profile Tab Component
const ProfileTab: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['myKitchenStatus'],
    queryFn: () => kitchenStaffService.getMyKitchenStatus(),
  });

  const kitchen = data?.data?.kitchen;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.tabScrollView}
      contentContainerStyle={styles.tabScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <MaterialIcons name="store" size={48} color={colors.primary} />
        <Text style={styles.profileName}>{kitchen?.name || 'N/A'}</Text>
        <View style={styles.profileStatusBadge}>
          <Text style={styles.profileStatusText}>{kitchen?.status || 'ACTIVE'}</Text>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Contact Information</Text>
        <ProfileDetailRow
          icon="phone"
          label="Phone"
          value={kitchen?.contactPhone || 'N/A'}
        />
        <ProfileDetailRow
          icon="email"
          label="Email"
          value={kitchen?.contactEmail || 'N/A'}
        />
        <ProfileDetailRow
          icon="person"
          label="Owner"
          value={kitchen?.ownerName || 'N/A'}
        />
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Address</Text>
        <ProfileDetailRow
          icon="location-on"
          label="Address"
          value={`${kitchen?.address?.addressLine1 || ''}, ${kitchen?.address?.locality || ''}`}
        />
        <ProfileDetailRow
          icon="location-city"
          label="City"
          value={`${kitchen?.address?.city || ''}, ${kitchen?.address?.state || ''}`}
        />
        <ProfileDetailRow
          icon="pin-drop"
          label="Pincode"
          value={kitchen?.address?.pincode || 'N/A'}
        />
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Cuisine Types</Text>
        <View style={styles.cuisineChips}>
          {kitchen?.cuisineTypes?.map((cuisine: string, index: number) => (
            <View key={index} style={styles.cuisineChip}>
              <Text style={styles.cuisineChipText}>{cuisine}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Operating Hours</Text>
        {kitchen?.operatingHours?.lunch && (
          <ProfileDetailRow
            icon="wb-sunny"
            label="Lunch"
            value={`${kitchen.operatingHours.lunch.startTime} - ${kitchen.operatingHours.lunch.endTime}`}
          />
        )}
        {kitchen?.operatingHours?.dinner && (
          <ProfileDetailRow
            icon="nightlight"
            label="Dinner"
            value={`${kitchen.operatingHours.dinner.startTime} - ${kitchen.operatingHours.dinner.endTime}`}
          />
        )}
      </View>
    </ScrollView>
  );
};

// Helper Components

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: string;
  color: string;
}> = ({ label, value, icon, color }) => (
  <View style={styles.statCard}>
    <MaterialIcons name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MealWindowCard: React.FC<{
  title: string;
  orders: number;
  revenue: number;
  icon: string;
}> = ({ title, orders, revenue, icon }) => (
  <View style={styles.mealWindowCard}>
    <MaterialIcons name={icon} size={32} color={colors.primary} />
    <Text style={styles.mealWindowTitle}>{title}</Text>
    <Text style={styles.mealWindowOrders}>{orders} orders</Text>
    <Text style={styles.mealWindowRevenue}>₹{revenue}</Text>
  </View>
);

const BatchStatRow: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <View style={styles.batchStatRow}>
    <View style={[styles.batchStatDot, { backgroundColor: color }]} />
    <Text style={styles.batchStatLabel}>{label}</Text>
    <Text style={styles.batchStatValue}>{value}</Text>
  </View>
);

const ProfileDetailRow: React.FC<{
  icon: string;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <View style={styles.profileDetailRow}>
    <MaterialIcons name={icon} size={20} color={colors.gray600} />
    <View style={styles.profileDetailContent}>
      <Text style={styles.profileDetailLabel}>{label}</Text>
      <Text style={styles.profileDetailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.gray600,
  },
  tabScrollView: {
    flex: 1,
  },
  tabScrollContent: {
    padding: 16,
  },
  tabBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabBarContent: {
    paddingHorizontal: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray600,
  },
  tabLabelActive: {
    fontWeight: '600',
    color: colors.primary,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.gray600,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray900,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 12,
  },
  mealWindowsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  mealWindowCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mealWindowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginTop: 8,
  },
  mealWindowOrders: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: 4,
  },
  mealWindowRevenue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
    marginTop: 4,
  },
  batchStatsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  batchStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  batchStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  batchStatLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.gray700,
  },
  batchStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
  },
  menuStatsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-around',
  },
  menuStatItem: {
    alignItems: 'center',
  },
  menuStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray900,
    marginTop: 8,
  },
  menuStatLabel: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 4,
  },
  recentOrderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recentOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recentOrderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
  },
  recentOrderAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  recentOrderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentOrderStatus: {
    fontSize: 12,
    color: colors.gray600,
  },
  recentOrderTime: {
    fontSize: 12,
    color: colors.gray500,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray900,
    marginTop: 12,
  },
  profileStatusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  profileStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  profileSection: {
    marginBottom: 24,
  },
  profileSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 12,
  },
  profileDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileDetailContent: {
    flex: 1,
    marginLeft: 12,
  },
  profileDetailLabel: {
    fontSize: 12,
    color: colors.gray600,
    marginBottom: 2,
  },
  profileDetailValue: {
    fontSize: 14,
    color: colors.gray900,
  },
  cuisineChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cuisineChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cuisineChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
});
