import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { useAlert } from '../../../hooks/useAlert';
import {
  KitchenStatus,
  KitchenTab,
  MealSummary,
  OrderStatusCount,
  DeliveryBatch,
  InventoryItem,
  ConsumptionEntry,
  StaffMember,
  OperationalContact,
  CapacitySettings,
  CutoffSettings,
  ServiceArea,
  PackagingStats,
  ActivityLogEntry,
  PersistedKitchenSettings,
} from '../models/types';
import {
  mockMealSummaries,
  mockOrderStatusCounts,
  mockInventoryItems,
  mockConsumptionEntries,
  mockOperationalContacts,
  mockActivityLog,
} from '../models/mockData';
import {
  loadKitchenSettings,
  saveKitchenSettings,
  loadStaffMembers,
  saveStaffMembers,
  loadDeliveryBatches,
  updateBatchStatus,
  debouncedSaveSettings,
} from '../storage/kitchenStorage';
import {
  KitchenHeader,
  TabBar,
  OverviewTab,
  BatchManagementTab,
  InventoryTab,
  StaffTab,
  SettingsTab,
  ActivityTab,
} from '../components';
import { colors, spacing } from '../../../theme';
import { SafeAreaScreen } from '../../../components/common/SafeAreaScreen';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface KitchenManagementScreenProps {
  onMenuPress: () => void;
}

export const KitchenManagementScreen: React.FC<KitchenManagementScreenProps> = ({
  onMenuPress,
}) => {
  const { showSuccess, showError, showInfo } = useAlert();
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Persisted settings state
  const [settings, setSettings] = useState<PersistedKitchenSettings | null>(null);

  // UI state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pauseNewOrders, setPauseNewOrders] = useState(false);

  // Data state
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [deliveryBatches, setDeliveryBatches] = useState<DeliveryBatch[]>([]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    if (settings) {
      debouncedSaveSettings(settings);
    }
  }, [settings]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [loadedSettings, loadedStaff, loadedBatches] = await Promise.all([
        loadKitchenSettings(),
        loadStaffMembers(),
        loadDeliveryBatches(),
      ]);

      setSettings(loadedSettings);
      setStaffMembers(loadedStaff);
      setDeliveryBatches(loadedBatches);

      if (loadedSettings.lastSelectedDate) {
        setSelectedDate(new Date(loadedSettings.lastSelectedDate));
      }
    } catch (error) {
      console.error('Error loading kitchen data:', error);
      showError('Error', 'Failed to load kitchen data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update settings helper
  const updateSettings = useCallback(<K extends keyof PersistedKitchenSettings>(
    key: K,
    value: PersistedKitchenSettings[K]
  ) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
  }, []);

  // Handle status change
  const handleStatusChange = useCallback((newStatus: KitchenStatus) => {
    updateSettings('kitchenStatus', newStatus);
  }, [updateSettings]);

  // Handle date change
  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
    updateSettings('lastSelectedDate', date.toISOString().split('T')[0]);
  }, [updateSettings]);

  // Handle tab change
  const handleTabChange = useCallback((tab: KitchenTab) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateSettings('lastSelectedTab', tab);
  }, [updateSettings]);

  // Handle pause orders toggle
  const handleTogglePauseOrders = useCallback(() => {
    setPauseNewOrders((prev) => !prev);
    showInfo(
      pauseNewOrders ? 'Orders Resumed' : 'Orders Paused',
      pauseNewOrders
        ? 'New orders are now being accepted.'
        : 'New orders are temporarily paused.'
    );
  }, [pauseNewOrders, showInfo]);

  // Handle download summary
  const handleDownloadSummary = useCallback(() => {
    showInfo('Download Started', 'Daily summary is being prepared for download.');
  }, [showInfo]);

  // Handle batch status change
  const handleBatchStatusChange = useCallback(async (
    batchId: string,
    newStatus: DeliveryBatch['status']
  ) => {
    try {
      const updatedBatches = await updateBatchStatus(batchId, newStatus);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setDeliveryBatches(updatedBatches);
    } catch (error) {
      console.error('Error updating batch status:', error);
      showError('Error', 'Failed to update batch status.');
    }
  }, [showError]);

  // Handle staff update
  const handleStaffUpdate = useCallback(async (updatedMember: StaffMember) => {
    try {
      const updatedStaff = staffMembers.map((m) =>
        m.id === updatedMember.id ? updatedMember : m
      );
      await saveStaffMembers(updatedStaff);
      setStaffMembers(updatedStaff);
    } catch (error) {
      console.error('Error updating staff member:', error);
      showError('Error', 'Failed to update staff member.');
    }
  }, [staffMembers, showError]);

  // Handle capacity change
  const handleCapacityChange = useCallback((newSettings: CapacitySettings) => {
    updateSettings('capacitySettings', newSettings);
  }, [updateSettings]);

  // Handle cut-off change
  const handleCutoffChange = useCallback((newSettings: CutoffSettings) => {
    updateSettings('cutoffSettings', newSettings);
  }, [updateSettings]);

  // Handle service areas change
  const handleServiceAreasChange = useCallback((areas: ServiceArea[]) => {
    updateSettings('serviceAreas', areas);
  }, [updateSettings]);

  // Handle packaging change
  const handlePackagingChange = useCallback((stats: PackagingStats) => {
    updateSettings('packagingStats', stats);
  }, [updateSettings]);

  // Calculate orders in progress
  const ordersInProgress = useMemo(() => {
    return mockOrderStatusCounts
      .filter((s) => ['Preparing', 'Packed', 'Out for delivery'].includes(s.status))
      .reduce((sum, s) => sum + s.count, 0);
  }, []);

  // Render tab content
  const renderTabContent = () => {
    if (!settings) return null;

    switch (settings.lastSelectedTab) {
      case 'Overview':
        return (
          <OverviewTab
            mealSummaries={mockMealSummaries}
            orderStatusCounts={mockOrderStatusCounts}
            deliveryBatches={deliveryBatches}
            onBatchStatusChange={handleBatchStatusChange}
          />
        );
      case 'Batches':
        return (
          <BatchManagementTab kitchenId="your-kitchen-id" />
        );
      case 'Inventory':
        return (
          <InventoryTab
            inventoryItems={mockInventoryItems}
            consumptionEntries={mockConsumptionEntries}
          />
        );
      case 'Staff':
        return (
          <StaffTab
            staffMembers={staffMembers}
            operationalContacts={mockOperationalContacts}
            onStaffUpdate={handleStaffUpdate}
          />
        );
      case 'Settings':
        return (
          <SettingsTab
            capacitySettings={settings.capacitySettings}
            cutoffSettings={settings.cutoffSettings}
            serviceAreas={settings.serviceAreas}
            packagingStats={settings.packagingStats}
            onCapacityChange={handleCapacityChange}
            onCutoffChange={handleCutoffChange}
            onServiceAreasChange={handleServiceAreasChange}
            onPackagingChange={handlePackagingChange}
          />
        );
      case 'Activity':
        return <ActivityTab activityLog={mockActivityLog} />;
      default:
        return null;
    }
  };

  if (isLoading || !settings) {
    return (
      <SafeAreaScreen style={{ flex: 1 }} topBackgroundColor={colors.primary} bottomBackgroundColor={colors.background}>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaScreen>
    );
  }

  return (
    <SafeAreaScreen style={{ flex: 1 }} topBackgroundColor={colors.primary} bottomBackgroundColor={colors.background}>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {/* Header with stats */}
        <KitchenHeader
          status={settings.kitchenStatus}
          selectedDate={selectedDate}
          pauseNewOrders={pauseNewOrders}
          mealSummaries={mockMealSummaries}
          ordersInProgress={ordersInProgress}
          cutoffSettings={settings.cutoffSettings}
          onStatusChange={handleStatusChange}
          onDateChange={handleDateChange}
          onTogglePauseOrders={handleTogglePauseOrders}
          onCutoffChange={handleCutoffChange}
          onDownloadSummary={handleDownloadSummary}
          onMenuPress={onMenuPress}
        />

        {/* Tab Bar */}
        <TabBar
          activeTab={settings.lastSelectedTab}
          onTabChange={handleTabChange}
        />

        {/* Tab Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderTabContent()}
        </ScrollView>
      </View>
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default KitchenManagementScreen;
