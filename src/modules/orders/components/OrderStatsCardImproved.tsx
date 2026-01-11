import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface OrderStatsCardImprovedProps {
  label: string;
  value: string | number;
  color: string;
  icon?: string;
  trend?: string;
  highlight?: boolean;
}

const OrderStatsCardImproved: React.FC<OrderStatsCardImprovedProps> = ({
  label,
  value,
  color,
  icon = 'analytics',
  trend,
  highlight = false,
}) => {
  return (
    <View style={[styles.card, highlight && styles.cardHighlight]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, {backgroundColor: `${color}15`}]}>
          <Icon name={icon} size={22} color={color} />
        </View>
        {trend && (
          <View style={styles.trendBadge}>
            <Text style={[styles.trendText, {color}]}>{trend}</Text>
          </View>
        )}
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHighlight: {
    borderWidth: 2,
    borderColor: '#FF9500',
    shadowOpacity: 0.15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
});

export default OrderStatsCardImproved;
