/**
 * Subscriptions Screen
 *
 * Main screen with tabs for Plans and Customer Subscriptions
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SubscriptionPlanCard } from '../components/SubscriptionPlanCard';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { PlanFormModal } from '../components/PlanFormModal';
import { SubscriptionDetailModal } from '../components/SubscriptionDetailModal';
import { CancelSubscriptionModal } from '../components/CancelSubscriptionModal';
import {
  SubscriptionPlan,
  Subscription,
  SubscriptionDetail,
  PlanStatus,
  SubscriptionStatus,
  CreatePlanRequest,
  CancelSubscriptionRequest,
} from '../../../types/subscription.types';
import {
  getPlans,
  createPlan,
  updatePlan,
  activatePlan,
  deactivatePlan,
  archivePlan,
  getAllSubscriptions,
  getSubscriptionById,
  cancelSubscription,
} from '../../../services/subscriptions.service';

const PRIMARY_COLOR = '#F56B4C';

type TabType = 'plans' | 'subscriptions';

interface SubscriptionsScreenProps {
  onMenuPress?: () => void;
}

export const SubscriptionsScreen: React.FC<SubscriptionsScreenProps> = ({ onMenuPress }) => {
  console.log('SubscriptionsScreen: Component rendering');
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('plans');

  // Plans state
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansRefreshing, setPlansRefreshing] = useState(false);
  const [planStatusFilter, setPlanStatusFilter] = useState<PlanStatus | 'ALL'>('ALL');
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | undefined>(undefined);

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionsRefreshing, setSubscriptionsRefreshing] = useState(false);
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState<
    SubscriptionStatus | 'ALL'
  >('ALL');
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionDetail | null>(null);
  const [subscriptionDetailLoading, setSubscriptionDetailLoading] = useState(false);
  const [showSubscriptionDetail, setShowSubscriptionDetail] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Fetch plans
  const fetchPlans = useCallback(async (isRefresh = false) => {
    console.log('fetchPlans called, isRefresh:', isRefresh);
    if (isRefresh) {
      setPlansRefreshing(true);
    } else {
      setPlansLoading(true);
    }

    try {
      const filters = planStatusFilter !== 'ALL' ? { status: planStatusFilter } : undefined;
      console.log('Fetching plans with filters:', filters);
      const response = await getPlans(filters);
      console.log('Plans fetched:', response.plans.length);

      // Filter out archived plans when 'ALL' is selected
      const filteredPlans = planStatusFilter === 'ALL'
        ? response.plans.filter(plan => plan.status !== 'ARCHIVED')
        : response.plans;

      console.log('Filtered plans:', filteredPlans.length);
      setPlans(filteredPlans);
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      Alert.alert('Error', error.message || 'Failed to load plans');
    } finally {
      setPlansLoading(false);
      setPlansRefreshing(false);
    }
  }, [planStatusFilter]);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setSubscriptionsRefreshing(true);
    } else {
      setSubscriptionsLoading(true);
    }

    try {
      const filters =
        subscriptionStatusFilter !== 'ALL' ? { status: subscriptionStatusFilter } : undefined;
      const response = await getAllSubscriptions(filters);
      setSubscriptions(response.subscriptions);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load subscriptions');
    } finally {
      setSubscriptionsLoading(false);
      setSubscriptionsRefreshing(false);
    }
  }, [subscriptionStatusFilter]);

  // Load data when component mounts or tab changes
  useEffect(() => {
    if (activeTab === 'plans') {
      fetchPlans();
    } else {
      fetchSubscriptions();
    }
  }, [activeTab, fetchPlans, fetchSubscriptions]);

  // Refresh when filter changes
  React.useEffect(() => {
    if (activeTab === 'plans') {
      fetchPlans();
    }
  }, [planStatusFilter]);

  React.useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchSubscriptions();
    }
  }, [subscriptionStatusFilter]);

  // Handle create/update plan
  const handleSavePlan = async (planData: CreatePlanRequest) => {
    if (selectedPlan) {
      await updatePlan(selectedPlan._id, planData);
      Alert.alert('Success', 'Plan updated successfully');
    } else {
      await createPlan(planData);
      Alert.alert('Success', 'Plan created successfully');
    }
    fetchPlans();
  };

  // Handle plan card press
  const handlePlanPress = (plan: SubscriptionPlan) => {
    Alert.alert(
      plan.name,
      'Choose an action',
      [
        {
          text: 'Edit', onPress: () => {
            setSelectedPlan(plan);
            setShowPlanForm(true);
          }
        },
        ...(plan.status === 'ACTIVE'
          ? [{ text: 'Deactivate', onPress: () => handleDeactivatePlan(plan._id) }]
          : plan.status === 'INACTIVE'
            ? [{ text: 'Activate', onPress: () => handleActivatePlan(plan._id) }]
            : []),
        ...(plan.status !== 'ARCHIVED'
          ? [{ text: 'Archive', onPress: () => handleArchivePlan(plan._id), style: 'destructive' as const }]
          : []),
        { text: 'Cancel', style: 'cancel' as const },
      ]
    );
  };

  const handleActivatePlan = async (planId: string) => {
    try {
      await activatePlan(planId);
      Alert.alert('Success', 'Plan activated successfully');
      fetchPlans();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to activate plan');
    }
  };

  const handleDeactivatePlan = async (planId: string) => {
    try {
      await deactivatePlan(planId);
      Alert.alert('Success', 'Plan deactivated successfully');
      fetchPlans();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to deactivate plan');
    }
  };

  const handleArchivePlan = async (planId: string) => {
    Alert.alert(
      'Confirm Archive',
      'This action is permanent. The plan cannot be reactivated.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await archivePlan(planId);
              Alert.alert('Success', 'Plan archived successfully');
              fetchPlans();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to archive plan');
            }
          },
        },
      ]
    );
  };

  // Handle subscription card press
  const handleSubscriptionPress = async (subscription: Subscription) => {
    setShowSubscriptionDetail(true);
    setSubscriptionDetailLoading(true);

    try {
      const detail = await getSubscriptionById(subscription._id);
      setSelectedSubscription(detail);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load subscription details');
      setShowSubscriptionDetail(false);
    } finally {
      setSubscriptionDetailLoading(false);
    }
  };

  // Handle cancel subscription
  const handleCancelSubscription = async (cancelData: CancelSubscriptionRequest) => {
    if (!selectedSubscription) return;

    try {
      await cancelSubscription(selectedSubscription._id, cancelData);
      Alert.alert('Success', 'Subscription cancelled successfully');
      setShowCancelModal(false);
      setShowSubscriptionDetail(false);
      fetchSubscriptions();
    } catch (error: any) {
      throw error;
    }
  };

  // Render Plans Tab
  const renderPlansTab = () => (
    <View style={styles.tabContent}>
      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(['ALL', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, planStatusFilter === status && styles.filterChipActive]}
            onPress={() => setPlanStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                planStatusFilter === status && styles.filterChipTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Plans List */}
      {plansLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      ) : plans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="inventory-2" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Plans Found</Text>
          <Text style={styles.emptyText}>
            {planStatusFilter !== 'ALL'
              ? `No ${planStatusFilter.toLowerCase()} plans`
              : 'Create your first subscription plan'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <SubscriptionPlanCard plan={item} onPress={() => handlePlanPress(item)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={plansRefreshing}
              onRefresh={() => fetchPlans(true)}
              tintColor={PRIMARY_COLOR}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB for Create Plan */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setSelectedPlan(undefined);
          setShowPlanForm(true);
        }}
      >
        <Icon name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  // Render Subscriptions Tab
  const renderSubscriptionsTab = () => (
    <View style={styles.tabContent}>
      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(['ALL', 'ACTIVE', 'EXPIRED', 'CANCELLED'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              subscriptionStatusFilter === status && styles.filterChipActive,
            ]}
            onPress={() => setSubscriptionStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                subscriptionStatusFilter === status && styles.filterChipTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Subscriptions List */}
      {subscriptionsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading subscriptions...</Text>
        </View>
      ) : subscriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="card-membership" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Subscriptions Found</Text>
          <Text style={styles.emptyText}>
            {subscriptionStatusFilter !== 'ALL'
              ? `No ${subscriptionStatusFilter.toLowerCase()} subscriptions`
              : 'No customer subscriptions yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <SubscriptionCard subscription={item} onPress={() => handleSubscriptionPress(item)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={subscriptionsRefreshing}
              onRefresh={() => fetchSubscriptions(true)}
              tintColor={PRIMARY_COLOR}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F56B4C" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {onMenuPress && (
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
            <Icon name="menu" size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Subscription Plans</Text>
      </View>

      {/* Content - Plans Only */}
      {renderPlansTab()}

      {/* Plan Form Modal */}
      <PlanFormModal
        visible={showPlanForm}
        onClose={() => {
          setShowPlanForm(false);
          setSelectedPlan(undefined);
        }}
        onSubmit={handleSavePlan}
        plan={selectedPlan}
      />

      {/* Subscription Detail Modal */}
      <SubscriptionDetailModal
        visible={showSubscriptionDetail}
        onClose={() => {
          setShowSubscriptionDetail(false);
          setSelectedSubscription(null);
        }}
        subscription={selectedSubscription}
        loading={subscriptionDetailLoading}
        onCancel={
          selectedSubscription?.status === 'ACTIVE'
            ? () => setShowCancelModal(true)
            : undefined
        }
      />

      {/* Cancel Subscription Modal */}
      {selectedSubscription && (
        <CancelSubscriptionModal
          visible={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onSubmit={handleCancelSubscription}
          subscriptionName={selectedSubscription.planId.name}
          customerName={selectedSubscription.userId.name}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  menuButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: PRIMARY_COLOR,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: PRIMARY_COLOR,
  },
  tabContent: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  filterChipActive: {
    backgroundColor: '#fff7ed',
    borderColor: PRIMARY_COLOR,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: PRIMARY_COLOR,
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
