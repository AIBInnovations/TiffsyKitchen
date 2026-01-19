/**
 * Kitchen Profile Screen
 * Displays kitchen details for Kitchen Staff (read-only)
 * Shows all information filled during kitchen onboarding
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaScreen } from '../../../components/common/SafeAreaScreen';
import { Header } from '../../../components/common/Header';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { Kitchen, Zone } from '../../../types/api.types';
import kitchenService from '../../../services/kitchen.service';

interface KitchenProfileScreenProps {
  onMenuPress: () => void;
}

export const KitchenProfileScreen: React.FC<KitchenProfileScreenProps> = ({
  onMenuPress,
}) => {
  const [kitchenId, setKitchenId] = React.useState<string | null>(null);

  // Load kitchen ID from AsyncStorage
  React.useEffect(() => {
    const loadKitchenId = async () => {
      try {
        console.log('🔍 [KitchenProfile] Loading kitchen ID from AsyncStorage...');
        const userData = await AsyncStorage.getItem('userData');
        console.log('🔍 [KitchenProfile] userData:', userData);

        if (userData) {
          const parsedData = JSON.parse(userData);
          console.log('🔍 [KitchenProfile] Parsed userData:', parsedData);
          console.log('🔍 [KitchenProfile] Kitchen ID:', parsedData.kitchenId);
          setKitchenId(parsedData.kitchenId);
        } else {
          console.warn('⚠️ [KitchenProfile] No userData found in AsyncStorage');
        }
      } catch (error) {
        console.error('❌ [KitchenProfile] Error loading kitchen ID:', error);
      }
    };
    loadKitchenId();
  }, []);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['kitchenProfile', kitchenId],
    queryFn: async () => {
      console.log('🔍 [KitchenProfile] Fetching kitchen details for ID:', kitchenId);
      if (!kitchenId) {
        console.error('❌ [KitchenProfile] No kitchen ID available');
        throw new Error('Kitchen ID not found');
      }

      try {
        const response = await kitchenService.getKitchenById(kitchenId);
        console.log('✅ [KitchenProfile] Kitchen details fetched successfully:', response);
        return response;
      } catch (err) {
        console.error('❌ [KitchenProfile] Error fetching kitchen details:', err);
        throw err;
      }
    },
    enabled: !!kitchenId, // Only run query when kitchenId is available
  });

  const kitchen = data?.kitchen;

  const getStatusColor = () => {
    if (!kitchen) return colors.textMuted;
    switch (kitchen.status) {
      case 'ACTIVE':
        return colors.success;
      case 'INACTIVE':
        return colors.textMuted;
      case 'PENDING_APPROVAL':
        return colors.warning;
      case 'SUSPENDED':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getTypeColor = () => {
    if (!kitchen) return colors.info;
    return kitchen.type === 'TIFFSY' ? colors.info : colors.secondary;
  };

  const zones = kitchen?.zonesServed
    ? Array.isArray(kitchen.zonesServed)
      ? kitchen.zonesServed.filter((z): z is Zone => typeof z !== 'string')
      : []
    : [];

  // Get initials from kitchen name
  const getInitials = (name: string) => {
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  if (isLoading) {
    return (
      <SafeAreaScreen
        topBackgroundColor={colors.primary}
        bottomBackgroundColor={colors.background}
      >
        <Header title="Kitchen Profile" onMenuPress={onMenuPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading kitchen profile...</Text>
        </View>
      </SafeAreaScreen>
    );
  }

  if (error || (!isLoading && !kitchen)) {
    console.log('❌ [KitchenProfile] Error state:', { error, kitchen, kitchenId, isLoading });

    return (
      <SafeAreaScreen
        topBackgroundColor={colors.primary}
        bottomBackgroundColor={colors.background}
      >
        <Header title="Kitchen Profile" onMenuPress={onMenuPress} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Failed to load profile</Text>
          <Text style={styles.errorMessage}>
            {error instanceof Error
              ? error.message
              : !kitchenId
              ? 'Kitchen ID not found in user data'
              : 'An error occurred while fetching kitchen details'}
          </Text>
          {error && (
            <Text style={styles.errorDetails}>
              {JSON.stringify(error, null, 2)}
            </Text>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Icon name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaScreen>
    );
  }

  return (
    <SafeAreaScreen
      topBackgroundColor={colors.primary}
      bottomBackgroundColor={colors.background}
    >
      <Header title="Kitchen Profile" onMenuPress={onMenuPress} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Kitchen Header */}
        <View style={styles.kitchenHeader}>
          {/* Kitchen Name Letters Avatar */}
          <View style={styles.nameAvatar}>
            <Text style={styles.nameAvatarText}>{getInitials(kitchen.name)}</Text>
          </View>

          <Text style={styles.kitchenName}>{kitchen.name}</Text>
          <Text style={styles.kitchenCode}>{kitchen.code}</Text>

          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: getTypeColor() }]}>
              <Text style={styles.badgeText}>{kitchen.type}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.badgeText}>{kitchen.status}</Text>
            </View>
          </View>

          {kitchen.averageRating > 0 && (
            <View style={styles.rating}>
              <Icon name="star" size={20} color={colors.warning} />
              <Text style={styles.ratingText}>
                {kitchen.averageRating.toFixed(1)} ({kitchen.totalRatings} ratings)
              </Text>
            </View>
          )}
        </View>

        {/* Quality Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quality Badges</Text>
          <View style={styles.badgeGrid}>
            {kitchen.authorizedFlag && (
              <View style={styles.qualityBadgeItem}>
                <Icon name="check-decagram" size={24} color={colors.success} />
                <Text style={styles.qualityBadgeText}>Authorized</Text>
              </View>
            )}
            {kitchen.premiumFlag && (
              <View style={styles.qualityBadgeItem}>
                <Icon name="star" size={24} color={colors.warning} />
                <Text style={styles.qualityBadgeText}>Premium</Text>
              </View>
            )}
            {kitchen.gourmetFlag && (
              <View style={styles.qualityBadgeItem}>
                <Icon name="chef-hat" size={24} color={colors.secondary} />
                <Text style={styles.qualityBadgeText}>Gourmet</Text>
              </View>
            )}
            {!kitchen.authorizedFlag && !kitchen.premiumFlag && !kitchen.gourmetFlag && (
              <Text style={styles.emptyText}>No quality badges assigned</Text>
            )}
          </View>
        </View>

        {/* Order Acceptance Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Acceptance</Text>
          <View style={styles.statusRow}>
            <Icon
              name={kitchen.isAcceptingOrders ? 'check-circle' : 'close-circle'}
              size={24}
              color={kitchen.isAcceptingOrders ? colors.success : colors.error}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: kitchen.isAcceptingOrders ? colors.success : colors.error,
                },
              ]}
            >
              {kitchen.isAcceptingOrders ? 'Accepting Orders' : 'Not Accepting Orders'}
            </Text>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          {kitchen.description && (
            <View style={styles.infoRow}>
              <Icon name="information" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>{kitchen.description}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Icon name="silverware-variant" size={18} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {kitchen.cuisineTypes.length > 0
                ? kitchen.cuisineTypes.join(', ')
                : 'No cuisine types specified'}
            </Text>
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={18} color={colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoText}>{kitchen.address.addressLine1}</Text>
              {kitchen.address.addressLine2 && (
                <Text style={styles.infoText}>{kitchen.address.addressLine2}</Text>
              )}
              <Text style={styles.infoText}>
                {kitchen.address.locality}, {kitchen.address.city}
              </Text>
              <Text style={styles.infoText}>
                {kitchen.address.state} - {kitchen.address.pincode}
              </Text>
              {kitchen.address.coordinates && (
                <Text style={styles.coordinatesText}>
                  📍 {kitchen.address.coordinates.latitude.toFixed(6)},{' '}
                  {kitchen.address.coordinates.longitude.toFixed(6)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Zones Served */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zones Served ({zones.length})</Text>
          {zones.length > 0 ? (
            zones.map((zone) => (
              <View key={zone._id} style={styles.zoneItem}>
                <View style={styles.zoneInfo}>
                  <Text style={styles.zonePincode}>{zone.pincode}</Text>
                  <Text style={styles.zoneName}>
                    {zone.name}, {zone.city}
                  </Text>
                </View>
                {zone.orderingEnabled ? (
                  <Icon name="check-circle" size={16} color={colors.success} />
                ) : (
                  <Icon name="close-circle" size={16} color={colors.error} />
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No zones assigned</Text>
          )}
        </View>

        {/* Operating Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          {kitchen.operatingHours.lunch && (
            <View style={styles.hoursRow}>
              <Icon name="food" size={18} color={colors.textSecondary} />
              <Text style={styles.hoursLabel}>Lunch:</Text>
              <Text style={styles.hoursValue}>
                {kitchen.operatingHours.lunch.startTime} -{' '}
                {kitchen.operatingHours.lunch.endTime}
              </Text>
            </View>
          )}
          {kitchen.operatingHours.dinner && (
            <View style={styles.hoursRow}>
              <Icon name="food-variant" size={18} color={colors.textSecondary} />
              <Text style={styles.hoursLabel}>Dinner:</Text>
              <Text style={styles.hoursValue}>
                {kitchen.operatingHours.dinner.startTime} -{' '}
                {kitchen.operatingHours.dinner.endTime}
              </Text>
            </View>
          )}
          {kitchen.operatingHours.onDemand && (
            <View style={styles.hoursRow}>
              <Icon name="clock-fast" size={18} color={colors.textSecondary} />
              <Text style={styles.hoursLabel}>On-Demand:</Text>
              {kitchen.operatingHours.onDemand.isAlwaysOpen ? (
                <Text style={styles.hoursValue}>Always Open</Text>
              ) : (
                <Text style={styles.hoursValue}>
                  {kitchen.operatingHours.onDemand.startTime} -{' '}
                  {kitchen.operatingHours.onDemand.endTime}
                </Text>
              )}
            </View>
          )}
          {!kitchen.operatingHours.lunch &&
            !kitchen.operatingHours.dinner &&
            !kitchen.operatingHours.onDemand && (
              <Text style={styles.emptyText}>No operating hours configured</Text>
            )}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {kitchen.contactPhone ? (
            <View style={styles.infoRow}>
              <Icon name="phone" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>{kitchen.contactPhone}</Text>
            </View>
          ) : null}
          {kitchen.contactEmail ? (
            <View style={styles.infoRow}>
              <Icon name="email" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>{kitchen.contactEmail}</Text>
            </View>
          ) : null}
          {!kitchen.contactPhone && !kitchen.contactEmail && (
            <Text style={styles.emptyText}>No contact information provided</Text>
          )}
        </View>

        {/* Owner Details (for PARTNER kitchens) */}
        {kitchen.type === 'PARTNER' && (kitchen.ownerName || kitchen.ownerPhone) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner Details</Text>
            {kitchen.ownerName && (
              <View style={styles.infoRow}>
                <Icon name="account" size={18} color={colors.textSecondary} />
                <Text style={styles.infoText}>{kitchen.ownerName}</Text>
              </View>
            )}
            {kitchen.ownerPhone && (
              <View style={styles.infoRow}>
                <Icon name="phone" size={18} color={colors.textSecondary} />
                <Text style={styles.infoText}>{kitchen.ownerPhone}</Text>
              </View>
            )}
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          {kitchen.createdAt && (
            <View style={styles.infoRow}>
              <Icon name="calendar-plus" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Created: {new Date(kitchen.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
          {kitchen.approvedAt && (
            <View style={styles.infoRow}>
              <Icon name="check-circle" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Approved: {new Date(kitchen.approvedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  errorDetails: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'left',
    marginTop: spacing.sm,
    fontFamily: 'monospace',
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusSm,
    maxWidth: '90%',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    marginTop: spacing.lg,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  kitchenHeader: {
    backgroundColor: colors.card,
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nameAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nameAvatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  kitchenName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  kitchenCode: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: spacing.borderRadiusSm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.card,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  qualityBadgeItem: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
    minWidth: 100,
  },
  qualityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  coordinatesText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  zoneInfo: {
    flex: 1,
  },
  zonePincode: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  zoneName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  hoursLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    width: 80,
  },
  hoursValue: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
