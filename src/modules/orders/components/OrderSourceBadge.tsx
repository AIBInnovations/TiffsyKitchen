/**
 * Order Source Badge Component
 *
 * Displays order source (Direct, Scheduled, Auto) as a colored badge
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderSource } from '../../../types/api.types';

interface OrderSourceBadgeProps {
  orderSource?: OrderSource;
}

const getSourceConfig = (source?: OrderSource) => {
  switch (source) {
    case 'SCHEDULED':
      return { label: 'Scheduled', bg: '#dbeafe', color: '#2563eb', borderColor: '#93c5fd' };
    case 'AUTO_ORDER':
      return { label: 'Auto', bg: '#ede9fe', color: '#7c3aed', borderColor: '#c4b5fd' };
    case 'DIRECT':
    default:
      return { label: 'Direct', bg: '#f3f4f6', color: '#6b7280', borderColor: '#d1d5db' };
  }
};

export const OrderSourceBadge: React.FC<OrderSourceBadgeProps> = ({ orderSource }) => {
  const config = getSourceConfig(orderSource);
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.borderColor,
        },
      ]}
    >
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
