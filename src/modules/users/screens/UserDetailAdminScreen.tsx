import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { adminUsersService } from '../../../services/admin-users.service';
import { User, Kitchen, UserDetailsResponse } from '../../../types/api.types';
import { RoleBadge } from '../components/RoleBadge';
import { StatusBadge } from '../components/StatusBadge';
import { SuspendUserModal } from '../components/SuspendUserModal';
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import { EditUserModal } from '../components/EditUserModal';

interface UserDetailAdminScreenProps {
  userId: string;
  onBack: () => void;
}

const colors = {
  primary: '#FF6B35',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  white: '#ffffff',
  black: '#1f2937',
  border: '#e5e7eb',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const UserDetailAdminScreen: React.FC<UserDetailAdminScreenProps> = ({
  userId,
  onBack,
}) => {
  const [userData, setUserData] = useState<UserDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchUserDetails = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await adminUsersService.getUserById(userId);
      setUserData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load user details');
      Alert.alert('Error', err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const onRefresh = () => {
    fetchUserDetails(true);
  };

  const handleCall = () => {
    if (userData?.user.phone) {
      Linking.openURL(`tel:${userData.user.phone}`);
    }
  };

  const handleActivate = async () => {
    Alert.alert(
      'Activate User',
      `Are you sure you want to activate ${userData?.user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: async () => {
            try {
              setActionLoading(true);
              await adminUsersService.activateUser(userId);
              Alert.alert('Success', 'User activated successfully');
              fetchUserDetails();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to activate user');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeactivate = async () => {
    Alert.alert(
      'Deactivate User',
      `Are you sure you want to deactivate ${userData?.user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await adminUsersService.deactivateUser(userId);
              Alert.alert('Success', 'User deactivated successfully');
              fetchUserDetails();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to deactivate user');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userData?.user.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await adminUsersService.deleteUser(userId);
              Alert.alert('Success', 'User deleted successfully');
              onBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete user');
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading user details...</Text>
        </View>
      </View>
    );
  }

  if (error || !userData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.danger} />
          <Text style={styles.errorTitle}>Failed to load</Text>
          <Text style={styles.errorSubtitle}>{error || 'User not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchUserDetails()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { user, kitchen, stats, addresses } = userData;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.editButton}>
            <MaterialIcons name="edit" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCall} style={styles.callButton}>
            <MaterialIcons name="phone" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <MaterialIcons
                name={
                  user.role === 'DRIVER'
                    ? 'local-shipping'
                    : user.role === 'KITCHEN_STAFF'
                    ? 'restaurant'
                    : user.role === 'ADMIN'
                    ? 'admin-panel-settings'
                    : 'person'
                }
                size={48}
                color={colors.primary}
              />
            </View>
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
          {user.email && <Text style={styles.userEmail}>{user.email}</Text>}

          <View style={styles.badgesRow}>
            <RoleBadge role={user.role} size="medium" />
            <StatusBadge status={user.status} size="medium" />
          </View>

          {user.status === 'SUSPENDED' && user.suspensionReason && (
            <View style={styles.suspensionBanner}>
              <MaterialIcons name="warning" size={16} color={colors.danger} />
              <Text style={styles.suspensionText}>{user.suspensionReason}</Text>
            </View>
          )}
        </View>

        {/* Role-Specific Info */}
        {user.role === 'KITCHEN_STAFF' && kitchen && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="restaurant" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Assigned Kitchen</Text>
            </View>
            <View style={styles.kitchenCard}>
              <Text style={styles.kitchenName}>{kitchen.name}</Text>
              <Text style={styles.kitchenCode}>{kitchen.code}</Text>
              <View style={styles.kitchenMeta}>
                <MaterialIcons name="location-on" size={14} color={colors.gray} />
                <Text style={styles.kitchenMetaText}>
                  {kitchen.address.city}, {kitchen.address.pincode}
                </Text>
              </View>
            </View>
          </View>
        )}

        {user.role === 'ADMIN' && user.username && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="account-circle" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Admin Info</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Username:</Text>
              <Text style={styles.infoValue}>@{user.username}</Text>
            </View>
          </View>
        )}

        {/* Statistics */}
        {stats && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="analytics" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Statistics</Text>
            </View>
            <View style={styles.statsGrid}>
              {user.role === 'CUSTOMER' && (
                <>
                  <View style={styles.statBox}>
                    <MaterialIcons name="shopping-bag" size={24} color={colors.primary} />
                    <Text style={styles.statValue}>{stats.totalOrders || 0}</Text>
                    <Text style={styles.statLabel}>Total Orders</Text>
                  </View>
                  <View style={styles.statBox}>
                    <MaterialIcons name="account-balance-wallet" size={24} color={colors.success} />
                    <Text style={styles.statValue}>₹{stats.totalSpent || 0}</Text>
                    <Text style={styles.statLabel}>Total Spent</Text>
                  </View>
                  <View style={styles.statBox}>
                    <MaterialIcons name="confirmation-number" size={24} color={colors.warning} />
                    <Text style={styles.statValue}>{stats.availableVouchers || 0}</Text>
                    <Text style={styles.statLabel}>Vouchers</Text>
                  </View>
                </>
              )}
              {user.role === 'KITCHEN_STAFF' && (
                <>
                  <View style={styles.statBox}>
                    <MaterialIcons name="today" size={24} color={colors.primary} />
                    <Text style={styles.statValue}>{stats.ordersProcessedToday || 0}</Text>
                    <Text style={styles.statLabel}>Today</Text>
                  </View>
                  <View style={styles.statBox}>
                    <MaterialIcons name="calendar-month" size={24} color={colors.success} />
                    <Text style={styles.statValue}>{stats.ordersProcessedThisMonth || 0}</Text>
                    <Text style={styles.statLabel}>This Month</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Addresses (for Customers) */}
        {user.role === 'CUSTOMER' && addresses && addresses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="location-on" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Saved Addresses</Text>
            </View>
            {addresses.map(address => (
              <View key={address._id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <Text style={styles.addressLabel}>{address.label}</Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressText}>
                  {address.addressLine1}, {address.locality}
                </Text>
                <Text style={styles.addressText}>
                  {address.city}, {address.pincode}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Account Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="info" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Account Info</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>
              {new Date(user.createdAt || '').toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          {user.lastLoginAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Login:</Text>
              <Text style={styles.infoValue}>
                {new Date(user.lastLoginAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Actions Section */}
        {user.role !== 'CUSTOMER' && (
          <View style={styles.actionsSection}>
            <Text style={styles.actionsTitle}>Actions</Text>

            {/* Status Actions */}
            <View style={styles.actionButtons}>
              {user.status === 'ACTIVE' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.warningButton]}
                    onPress={handleDeactivate}
                    disabled={actionLoading}
                  >
                    <MaterialIcons name="cancel" size={18} color={colors.white} />
                    <Text style={styles.actionButtonText}>Deactivate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.dangerButton]}
                    onPress={() => setShowSuspendModal(true)}
                    disabled={actionLoading}
                  >
                    <MaterialIcons name="block" size={18} color={colors.white} />
                    <Text style={styles.actionButtonText}>Suspend</Text>
                  </TouchableOpacity>
                </>
              )}
              {user.status === 'INACTIVE' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.successButton]}
                  onPress={handleActivate}
                  disabled={actionLoading}
                >
                  <MaterialIcons name="check-circle" size={18} color={colors.white} />
                  <Text style={styles.actionButtonText}>Activate</Text>
                </TouchableOpacity>
              )}
              {user.status === 'SUSPENDED' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.successButton]}
                  onPress={handleActivate}
                  disabled={actionLoading}
                >
                  <MaterialIcons name="check-circle" size={18} color={colors.white} />
                  <Text style={styles.actionButtonText}>Reactivate</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Admin-specific actions */}
            {user.role === 'ADMIN' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton, styles.fullWidthButton]}
                onPress={() => setShowResetPasswordModal(true)}
                disabled={actionLoading}
              >
                <MaterialIcons name="lock-reset" size={18} color={colors.white} />
                <Text style={styles.actionButtonText}>Reset Password</Text>
              </TouchableOpacity>
            )}

            {/* Delete Action */}
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton, styles.fullWidthButton]}
              onPress={handleDelete}
              disabled={actionLoading}
            >
              <MaterialIcons name="delete" size={18} color={colors.white} />
              <Text style={styles.actionButtonText}>Delete User</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <EditUserModal
        visible={showEditModal}
        user={user}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => fetchUserDetails()}
      />
      <SuspendUserModal
        visible={showSuspendModal}
        user={user}
        onClose={() => setShowSuspendModal(false)}
        onSuccess={() => fetchUserDetails()}
      />
      <ResetPasswordModal
        visible={showResetPasswordModal}
        user={user}
        onClose={() => setShowResetPasswordModal(false)}
        onSuccess={() => fetchUserDetails()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginTop: spacing.md,
  },
  errorSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarSection: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.xs,
  },
  userPhone: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: spacing.xs / 2,
  },
  userEmail: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: spacing.md,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  suspensionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    width: '100%',
  },
  suspensionText: {
    flex: 1,
    fontSize: 13,
    color: colors.danger,
    fontWeight: '500',
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  kitchenCard: {
    padding: spacing.md,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  kitchenName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.xs,
  },
  kitchenCode: {
    fontSize: 13,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  kitchenMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  kitchenMetaText: {
    fontSize: 13,
    color: colors.gray,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  addressCard: {
    padding: spacing.md,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  defaultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  addressText: {
    fontSize: 13,
    color: colors.gray,
    lineHeight: 18,
  },
  actionsSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    gap: spacing.xs,
    flex: 1,
    minWidth: '48%',
  },
  fullWidthButton: {
    width: '100%',
    marginTop: spacing.sm,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  successButton: {
    backgroundColor: colors.success,
  },
  warningButton: {
    backgroundColor: colors.warning,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  deleteButton: {
    backgroundColor: '#991b1b',
  },
});
