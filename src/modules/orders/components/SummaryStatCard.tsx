import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing } from '../../../theme';

interface SummaryStatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  onPress?: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export const SummaryStatCard: React.FC<SummaryStatCardProps> = ({
  title,
  value,
  icon,
  iconColor = colors.primary,
  iconBgColor = colors.primaryLight,
  trend,
  onPress,
  style,
  compact = false,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.container, compact && styles.containerCompact, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <MaterialIcons name={icon} size={compact ? 18 : 22} color={iconColor} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={[styles.value, compact && styles.valueCompact]}>{value}</Text>
        <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={1}>
          {title}
        </Text>
        {trend && (
          <View style={styles.trendContainer}>
            <MaterialIcons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={12}
              color={trend.isPositive ? colors.success : colors.error}
            />
            <Text
              style={[
                styles.trendValue,
                { color: trend.isPositive ? colors.success : colors.error },
              ]}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Text>
            {trend.label && (
              <Text style={styles.trendLabel}>{trend.label}</Text>
            )}
          </View>
        )}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusLg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 140,
  },
  containerCompact: {
    padding: spacing.sm,
    minWidth: 100,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: spacing.borderRadiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  valueCompact: {
    fontSize: 18,
  },
  title: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  titleCompact: {
    fontSize: 11,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendValue: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  trendLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: 4,
  },
});

SummaryStatCard.displayName = 'SummaryStatCard';
