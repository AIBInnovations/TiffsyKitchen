import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { UserStatus } from '../../../types/api.types';

interface StatusBadgeProps {
  status: UserStatus;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const statusConfig: Record<UserStatus, { label: string; color: string; icon: string }> = {
  ACTIVE: {
    label: 'Active',
    color: '#10b981', // green
    icon: 'check-circle',
  },
  INACTIVE: {
    label: 'Inactive',
    color: '#6b7280', // gray
    icon: 'cancel',
  },
  SUSPENDED: {
    label: 'Suspended',
    color: '#ef4444', // red
    icon: 'block',
  },
  DELETED: {
    label: 'Deleted',
    color: '#1f2937', // dark gray
    icon: 'delete',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  showIcon = true,
}) => {
  const config = statusConfig[status];

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
      {showIcon && (
        <MaterialIcons name={config.icon} size={currentSize.iconSize} color={config.color} />
      )}
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
