import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { User, UserRole, UserStatus } from '../../types/user';
import { Chip } from '../common/Chip';
import { colors, spacing } from '../../theme';

interface UserListItemProps {
  user: User;
  onPress: (user: User) => void;
}

const getRoleConfig = (role: UserRole): { label: string; color: string; bgColor: string } => {
  switch (role) {
    case 'customer':
      return { label: 'Customer', color: colors.roleCustomer, bgColor: '#dbeafe' };
    case 'driver':
      return { label: 'Driver', color: colors.roleDriver, bgColor: '#ede9fe' };
    case 'kitchen_staff':
      return { label: 'Kitchen Staff', color: colors.roleKitchenStaff, bgColor: colors.primaryLight };
    case 'kitchen_admin':
      return { label: 'Admin', color: colors.roleKitchenAdmin, bgColor: colors.errorLight };
    default:
      return { label: 'Unknown', color: colors.textMuted, bgColor: colors.background };
  }
};

const getStatusConfig = (status: UserStatus): { label: string; color: string; bgColor: string } => {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Active', color: colors.statusActive, bgColor: colors.successLight };
    case 'BLOCKED':
      return { label: 'Blocked', color: colors.statusBlocked, bgColor: colors.errorLight };
    case 'PENDING':
      return { label: 'Pending', color: colors.statusPending, bgColor: colors.warningLight };
    case 'UNVERIFIED':
      return { label: 'Unverified', color: colors.statusUnverified, bgColor: colors.background };
    default:
      return { label: 'Unknown', color: colors.textMuted, bgColor: colors.background };
  }
};

const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const UserListItem: React.FC<UserListItemProps> = ({ user, onPress }) => {
  const roleConfig = getRoleConfig(user.role);
  const statusConfig = getStatusConfig(user.status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(user)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: roleConfig.bgColor }]}>
        <Text style={[styles.avatarText, { color: roleConfig.color }]}>
          {getInitials(user.fullName)}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{user.fullName}</Text>
          <Text style={styles.lastActive}>{formatDate(user.lastActiveAt || user.updatedAt)}</Text>
        </View>

        <Text style={styles.contact} numberOfLines={1}>
          {user.phone} {user.email ? `• ${user.email}` : ''}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.chips}>
            <Chip
              label={roleConfig.label}
              color={roleConfig.color}
              backgroundColor={roleConfig.bgColor}
              size="small"
            />
            <Chip
              label={statusConfig.label}
              color={statusConfig.color}
              backgroundColor={statusConfig.bgColor}
              size="small"
              style={styles.statusChip}
            />
          </View>

          {user.role === 'customer' && user.totalOrders !== undefined && (
            <View style={styles.ordersContainer}>
              <MaterialIcons name="shopping-bag" size={12} color={colors.textMuted} />
              <Text style={styles.ordersText}>{user.totalOrders}</Text>
            </View>
          )}
        </View>
      </View>

      <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  lastActive: {
    fontSize: 11,
    color: colors.textMuted,
  },
  contact: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    marginLeft: spacing.xs,
  },
  ordersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ordersText: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 4,
  },
});

UserListItem.displayName = 'UserListItem';
