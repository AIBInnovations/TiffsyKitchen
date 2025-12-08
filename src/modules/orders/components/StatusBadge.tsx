import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { OrderStatus, PaymentStatus, DeliveryStatus } from '../models/types';
import {
  orderStatusLabels,
  orderStatusColors,
  orderStatusIcons,
  paymentStatusLabels,
  paymentStatusColors,
  deliveryStatusLabels,
  deliveryStatusColors,
} from '../utils/orderUtils';

type BadgeType = 'order' | 'payment' | 'delivery';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | DeliveryStatus;
  type?: BadgeType;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'order',
  size = 'small',
  showIcon = false,
  style,
}) => {
  const getLabel = (): string => {
    switch (type) {
      case 'order':
        return orderStatusLabels[status as OrderStatus] || status;
      case 'payment':
        return paymentStatusLabels[status as PaymentStatus] || status;
      case 'delivery':
        return deliveryStatusLabels[status as DeliveryStatus] || status;
      default:
        return status;
    }
  };

  const getColors = (): { bg: string; text: string } => {
    switch (type) {
      case 'order':
        return orderStatusColors[status as OrderStatus] || { bg: '#f3f4f6', text: '#6b7280' };
      case 'payment':
        return paymentStatusColors[status as PaymentStatus] || { bg: '#f3f4f6', text: '#6b7280' };
      case 'delivery':
        return deliveryStatusColors[status as DeliveryStatus] || { bg: '#f3f4f6', text: '#6b7280' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const getIcon = (): string => {
    if (type === 'order') {
      return orderStatusIcons[status as OrderStatus] || 'help-outline';
    }
    return 'help-outline';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          text: styles.textSmall,
          iconSize: 12,
        };
      case 'medium':
        return {
          container: styles.containerMedium,
          text: styles.textMedium,
          iconSize: 14,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          text: styles.textLarge,
          iconSize: 16,
        };
      default:
        return {
          container: styles.containerSmall,
          text: styles.textSmall,
          iconSize: 12,
        };
    }
  };

  const colors = getColors();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor: colors.bg },
        style,
      ]}
    >
      {showIcon && (
        <MaterialIcons
          name={getIcon()}
          size={sizeStyles.iconSize}
          color={colors.text}
          style={styles.icon}
        />
      )}
      <Text style={[sizeStyles.text, { color: colors.text }]} numberOfLines={1}>
        {getLabel()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 12,
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  containerMedium: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  containerLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  textSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
  textMedium: {
    fontSize: 12,
    fontWeight: '600',
  },
  textLarge: {
    fontSize: 14,
    fontWeight: '600',
  },
  icon: {
    marginRight: 4,
  },
});

StatusBadge.displayName = 'StatusBadge';
