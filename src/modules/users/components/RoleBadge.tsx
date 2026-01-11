import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { UserRole } from '../../../types/api.types';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'small' | 'medium' | 'large';
}

const roleConfig: Record<UserRole, { label: string; color: string; icon: string }> = {
  CUSTOMER: {
    label: 'Customer',
    color: '#3b82f6', // blue
    icon: 'person',
  },
  KITCHEN_STAFF: {
    label: 'Staff',
    color: '#8b5cf6', // purple
    icon: 'restaurant',
  },
  DRIVER: {
    label: 'Driver',
    color: '#f59e0b', // orange
    icon: 'local-shipping',
  },
  ADMIN: {
    label: 'Admin',
    color: '#ef4444', // red
    icon: 'admin-panel-settings',
  },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'medium' }) => {
  const config = roleConfig[role];

  const sizeStyles = {
    small: { padding: 4, fontSize: 10, iconSize: 12 },
    medium: { padding: 6, fontSize: 11, iconSize: 14 },
    large: { padding: 8, fontSize: 12, iconSize: 16 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${config.color}15`,
          paddingHorizontal: currentSize.padding + 2,
          paddingVertical: currentSize.padding,
        },
      ]}
    >
      <MaterialIcons name={config.icon} size={currentSize.iconSize} color={config.color} />
      <Text style={[styles.text, { color: config.color, fontSize: currentSize.fontSize }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 4,
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
