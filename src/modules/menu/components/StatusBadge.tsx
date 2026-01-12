import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MenuItemStatus } from '../../../types/api.types';

interface StatusBadgeProps {
  status: MenuItemStatus;
  size?: 'small' | 'medium' | 'large';
}

const STATUS_CONFIG: Record<MenuItemStatus, { label: string; color: string; bgColor: string }> = {
  ACTIVE: { label: 'Active', color: '#16a34a', bgColor: '#dcfce7' },
  INACTIVE: { label: 'Inactive', color: '#6b7280', bgColor: '#f3f4f6' },
  DISABLED_BY_ADMIN: { label: 'Disabled', color: '#dc2626', bgColor: '#fee2e2' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const config = STATUS_CONFIG[status];
  const sizeStyles = getSizeStyles(size);

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }, sizeStyles.container]}>
      <Text style={[styles.text, { color: config.color }, sizeStyles.text]}>{config.label}</Text>
    </View>
  );
};

const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        container: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
        text: { fontSize: 10 },
      };
    case 'large':
      return {
        container: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
        text: { fontSize: 14 },
      };
    default:
      return {
        container: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
        text: { fontSize: 12 },
      };
  }
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
