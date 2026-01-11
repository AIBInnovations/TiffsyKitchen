import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface OrderStatsCardProps {
  label: string;
  value: string | number;
  color: string;
  highlight?: boolean;
  icon?: string;
}

const OrderStatsCard: React.FC<OrderStatsCardProps> = ({
  label,
  value,
  color,
  highlight = false,
  icon,
}) => {
  return (
    <View style={[styles.card, highlight && styles.cardHighlight]}>
      {icon && (
        <View style={[styles.iconContainer, {backgroundColor: `${color}15`}]}>
          <Icon name={icon} size={16} color={color} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, {color}]}>{value}</Text>
      </View>
      {highlight && (
        <View style={[styles.badge, {backgroundColor: color}]}>
          <Text style={styles.badgeText}>New</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    minWidth: 120,
    minHeight: 90,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0,
    marginRight: 2,
  },
  cardHighlight: {
    borderWidth: 2,
    borderColor: '#FF9500',
    shadowColor: '#FF9500',
    shadowOpacity: 0.2,
    elevation: 5,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginBottom: 4,
    lineHeight: 12,
  },
  value: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 20,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    elevation: 2,
  },
  badgeText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
});

export default OrderStatsCard;
