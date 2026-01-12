import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DietaryType } from '../../../types/api.types';

interface DietaryBadgeProps {
  dietaryType: DietaryType;
  size?: 'small' | 'medium' | 'large';
}

const DIETARY_CONFIG: Record<DietaryType, { label: string; color: string; bgColor: string }> = {
  VEG: { label: 'Veg', color: '#16a34a', bgColor: '#dcfce7' },
  NON_VEG: { label: 'Non-Veg', color: '#dc2626', bgColor: '#fee2e2' },
  VEGAN: { label: 'Vegan', color: '#7c3aed', bgColor: '#ede9fe' },
  EGGETARIAN: { label: 'Egg', color: '#f59e0b', bgColor: '#fef3c7' },
};

export const DietaryBadge: React.FC<DietaryBadgeProps> = ({ dietaryType, size = 'medium' }) => {
  const config = DIETARY_CONFIG[dietaryType];
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
