/**
 * Referral Management Screen
 *
 * Combined dashboard + list view for managing the referral program.
 * Shows analytics, config toggle, and browsable referral list.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useApi } from '../../../hooks/useApi';
import { referralService } from '../../../services/referral.service';
import {
  Referral,
  ReferralListResponse,
  ReferralAnalytics,
  ReferralConfig,
  ReferralStatus,
} from '../../../types/api.types';

interface Props {
  onMenuPress: () => void;
}

type FilterTab = 'ALL' | ReferralStatus;

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'CONVERTED', label: 'Converted' },
  { id: 'EXPIRED', label: 'Expired' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

const ReferralManagementScreen: React.FC<Props> = ({ onMenuPress }) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [configLoading, setConfigLoading] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch analytics
  const {
    data: analytics,
    loading: analyticsLoading,
    refresh: refreshAnalytics,
  } = useApi<ReferralAnalytics>('/api/referrals/admin/analytics', { cache: 30000 });

  // Fetch config
  const {
    data: config,
    loading: configLoadingInitial,
    refresh: refreshConfig,
  } = useApi<ReferralConfig>('/api/referrals/admin/config', { cache: 30000 });

  // Fetch referrals with pagination
  const filterQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (activeFilter !== 'ALL') params.append('status', activeFilter);
    params.append('page', '1');
    params.append('limit', '20');
    return params.toString() ? `?${params.toString()}` : '';
  }, [activeFilter]);

  const {
    data: referralsData,
    loading: referralsLoading,
    refresh: refreshReferrals,
  } = useApi<ReferralListResponse>(`/api/referrals/admin/list${filterQuery}`, {
    cache: 10000,
    dependencies: [activeFilter],
  });

  // Sync first page data to state
  React.useEffect(() => {
    if (referralsData?.referrals) {
      setReferrals(referralsData.referrals);
      setPage(1);
      const pagination = referralsData.pagination;
      setHasMore(pagination ? pagination.page < pagination.pages : false);
    }
  }, [referralsData]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loadingMore || referralsLoading) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await referralService.getReferrals({
        page: nextPage,
        limit: 20,
        status: activeFilter !== 'ALL' ? activeFilter as ReferralStatus : undefined,
      });
      setReferrals(prev => [...prev, ...result.referrals]);
      setPage(nextPage);
      setHasMore(result.pagination ? result.pagination.page < result.pagination.pages : false);
    } catch (error) {
      console.error('Error loading more referrals:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, referralsLoading, page, activeFilter]);

  const handleRefresh = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await Promise.all([refreshAnalytics(), refreshConfig(), refreshReferrals()]);
  }, [refreshAnalytics, refreshConfig, refreshReferrals]);

  const handleToggleEnabled = useCallback(async (newValue: boolean) => {
    setConfigLoading(true);
    try {
      await referralService.updateConfig({ enabled: newValue });
      await refreshConfig();
      Alert.alert('Success', `Referral program ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update config');
    } finally {
      setConfigLoading(false);
    }
  }, [refreshConfig]);

  const getStatusColor = (status: ReferralStatus) => {
    switch (status) {
      case 'CONVERTED': return colors.success;
      case 'PENDING': return colors.warning;
      case 'EXPIRED': return colors.gray400;
      case 'CANCELLED': return colors.error;
      default: return colors.gray400;
    }
  };

  const getStatusBg = (status: ReferralStatus) => {
    switch (status) {
      case 'CONVERTED': return colors.successLight;
      case 'PENDING': return colors.warningLight;
      case 'EXPIRED': return colors.gray100;
      case 'CANCELLED': return colors.errorLight;
      default: return colors.gray100;
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  const renderStatsCards = () => {
    if (!analytics) return null;

    const cards = [
      { label: 'Total', value: analytics.totalReferrals, icon: 'people', color: colors.info },
      { label: 'Converted', value: analytics.totalConverted, icon: 'check-circle', color: colors.success },
      { label: 'Pending', value: analytics.totalPending, icon: 'hourglass-empty', color: colors.warning },
      { label: 'Conv. Rate', value: `${(analytics.conversionRate || 0).toFixed(1)}%`, icon: 'trending-up', color: colors.primary },
    ];

    return (
      <View style={styles.statsRow}>
        {cards.map((card, i) => (
          <View key={i} style={[styles.statCard, { borderLeftColor: card.color }]}>
            <Icon name={card.icon} size={20} color={card.color} />
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderConfigToggle = () => (
    <View style={styles.configCard}>
      <View style={styles.configRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.configTitle}>Referral Program</Text>
          <Text style={styles.configSubtitle}>
            {config?.enabled ? 'Active — new referrals are being processed' : 'Disabled — no new conversions will fire'}
          </Text>
        </View>
        {configLoading || configLoadingInitial ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Switch
            value={config?.enabled || false}
            onValueChange={handleToggleEnabled}
            trackColor={{ false: colors.gray300, true: colors.success }}
            thumbColor={colors.white}
          />
        )}
      </View>
      {config && (
        <View style={styles.configDetails}>
          <View style={styles.configDetailItem}>
            <Text style={styles.configDetailLabel}>Referrer Reward</Text>
            <Text style={styles.configDetailValue}>{config.referrerReward.voucherCount} meals</Text>
          </View>
          <View style={styles.configDetailItem}>
            <Text style={styles.configDetailLabel}>Referee Reward</Text>
            <Text style={styles.configDetailValue}>{config.refereeReward.voucherCount} meals</Text>
          </View>
          <View style={styles.configDetailItem}>
            <Text style={styles.configDetailLabel}>Window</Text>
            <Text style={styles.configDetailValue}>{config.conversionWindowDays} days</Text>
          </View>
          <View style={styles.configDetailItem}>
            <Text style={styles.configDetailLabel}>Max/User</Text>
            <Text style={styles.configDetailValue}>{config.maxReferralsPerUser}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderTopReferrers = () => {
    if (!analytics?.topReferrers?.length) return null;

    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Top Referrers</Text>
        {analytics.topReferrers.slice(0, 5).map((referrer, i) => (
          <View key={referrer.userId} style={styles.topReferrerRow}>
            <View style={[styles.rankBadge, i === 0 && { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.rankText, i === 0 && { color: '#D97706' }]}>#{i + 1}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.referrerName}>{referrer.name}</Text>
              <Text style={styles.referrerPhone}>{referrer.phone}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.referrerCount}>{referrer.convertedCount}/{referrer.referralCount}</Text>
              <Text style={styles.referrerSubtext}>converted</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderFilterTabs = () => (
    <View style={styles.filterRow}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab.id)}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderReferralItem = ({ item }: { item: Referral }) => (
    <View style={styles.referralCard}>
      <View style={styles.referralHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.referralReferrer}>
            {item.referrerUserId?.name || 'Unknown'} → {item.refereeUserId?.name || 'Unknown'}
          </Text>
          <Text style={styles.referralPhone}>
            {item.referrerUserId?.phone} → {item.refereeUserId?.phone}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.referralDetails}>
        <View style={styles.referralDetail}>
          <Icon name="code" size={14} color={colors.textMuted} />
          <Text style={styles.referralDetailText}>{item.referralCode}</Text>
        </View>
        <View style={styles.referralDetail}>
          <Icon name="schedule" size={14} color={colors.textMuted} />
          <Text style={styles.referralDetailText}>{formatDate(item.createdAt)}</Text>
        </View>
        {item.status === 'CONVERTED' && item.referrerReward && (
          <View style={styles.referralDetail}>
            <Icon name="card-giftcard" size={14} color={colors.success} />
            <Text style={[styles.referralDetailText, { color: colors.success }]}>
              +{item.referrerReward.voucherCount} meals (referrer){item.refereeReward ? `, +${item.refereeReward.voucherCount} (referee)` : ''}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View>
      {renderStatsCards()}
      {renderConfigToggle()}
      {renderTopReferrers()}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>All Referrals</Text>
      </View>
      {renderFilterTabs()}
    </View>
  );

  const renderEmpty = () => {
    if (referralsLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="people-outline" size={48} color={colors.gray300} />
        <Text style={styles.emptyText}>No referrals found</Text>
      </View>
    );
  };

  const isLoading = analyticsLoading || referralsLoading;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <Icon name="menu" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referral Program</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={referrals}
          renderItem={renderReferralItem}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={loadingMore ? (
            <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={analyticsLoading || referralsLoading} onRefresh={handleRefresh} colors={[colors.primary]} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusLg,
    padding: spacing.md,
    alignItems: 'center',
    borderLeftWidth: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Config
  configCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusLg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  configSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  configDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.sm,
  },
  configDetailItem: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: colors.gray50,
    borderRadius: spacing.borderRadiusMd,
    padding: spacing.sm,
  },
  configDetailLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  configDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },

  // Top referrers
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusLg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  topReferrerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  referrerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  referrerPhone: {
    fontSize: 12,
    color: colors.textMuted,
  },
  referrerCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
  referrerSubtext: {
    fontSize: 10,
    color: colors.textMuted,
  },

  // Filter tabs
  listHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusFull,
    backgroundColor: colors.card,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.white,
  },

  // Referral card
  referralCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusLg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  referralReferrer: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  referralPhone: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  referralDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  referralDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  referralDetailText: {
    fontSize: 12,
    color: colors.textMuted,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});

export default ReferralManagementScreen;
