import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme';

export type ChipVariant = 'filled' | 'outlined';
export type ChipSize = 'small' | 'medium';

interface ChipProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  variant?: ChipVariant;
  size?: ChipSize;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  color,
  backgroundColor,
  variant = 'filled',
  size = 'small',
  selected = false,
  onPress,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingHorizontal: size === 'small' ? 8 : 12,
      paddingVertical: size === 'small' ? 4 : 6,
      borderRadius: size === 'small' ? 12 : 16,
    };

    if (variant === 'outlined') {
      return {
        ...baseStyle,
        backgroundColor: selected ? (backgroundColor || colors.primary) : 'transparent',
        borderWidth: 1,
        borderColor: backgroundColor || colors.primary,
      };
    }

    return {
      ...baseStyle,
      backgroundColor: backgroundColor || colors.primaryLight,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? 11 : 13,
      fontWeight: '600',
    };

    if (variant === 'outlined' && !selected) {
      return {
        ...baseStyle,
        color: color || colors.primary,
      };
    }

    if (variant === 'outlined' && selected) {
      return {
        ...baseStyle,
        color: colors.white,
      };
    }

    return {
      ...baseStyle,
      color: color || colors.primary,
    };
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.container, getContainerStyle(), style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[getTextStyle(), textStyle]} numberOfLines={1}>
        {label}
      </Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
});

Chip.displayName = 'Chip';
