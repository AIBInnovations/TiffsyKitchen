import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Order } from '../models/types';
import { StatusBadge } from './StatusBadge';
import {
  formatCurrency,
  formatDate,
  formatTime,
  getPlanDisplayName,
  getPackagingDisplayName,
} from '../utils/orderUtils';
import { colors, spacing } from '../../../theme';

interface OrderCardProps {
  order: Order;
  onPress: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(order)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.orderNumber}`}
    >
      {/* Top Row: Order ID & Status */}
      <View style={styles.topRow}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderId}>{order.orderNumber}</Text>
          <View style={styles.mealBadge}>
            <MaterialIcons
              name={order.mealType === 'lunch' ? 'wb-sunny' : 'nights-stay'}
              size={12}
              color={order.mealType === 'lunch' ? '#f97316' : '#6366f1'}
            />
            <Text
              style={[
                styles.mealText,
                { color: order.mealType === 'lunch' ? '#f97316' : '#6366f1' },
              ]}
            >
              {order.mealType === 'lunch' ? 'Lunch' : 'Dinner'}
            </Text>
          </View>
        </View>
        <StatusBadge status={order.status} type="order" size="small" />
      </View>

      {/* Second Row: Customer Info */}
      <View style={styles.customerRow}>
        <View style={styles.customerInfo}>
          <MaterialIcons name="person-outline" size={14} color={colors.textMuted} />
          <Text style={styles.customerName} numberOfLines={1}>
            {order.customer.name}
          </Text>
          <Text style={styles.customerPhone}>{order.customer.phone}</Text>
        </View>
      </View>

      {/* Third Row: Tags */}
      <View style={styles.tagsRow}>
        {order.subscription && (
          <View style={styles.tag}>
            <MaterialIcons name="card-membership" size={10} color={colors.textMuted} />
            <Text style={styles.tagText}>{getPlanDisplayName(order.subscription.planName)}</Text>
          </View>
        )}
        <View style={styles.tag}>
          <MaterialIcons
            name={order.packagingType === 'STEEL_DABBA' ? 'eco' : 'takeout-dining'}
            size={10}
            color={colors.textMuted}
          />
          <Text style={styles.tagText}>{getPackagingDisplayName(order.packagingType)}</Text>
        </View>
      </View>

      {/* Fourth Row: Date, Time, Payment */}
      <View style={styles.detailsRow}>
        <View style={styles.dateTimeContainer}>
          <MaterialIcons name="schedule" size={12} color={colors.textMuted} />
          <Text style={styles.dateTime}>
            {formatDate(order.createdAt)} • {order.deliverySlot.label}
          </Text>
        </View>
        <View style={styles.paymentContainer}>
          <StatusBadge status={order.payment.status} type="payment" size="small" />
          <Text style={styles.amount}>{formatCurrency(order.pricing.finalTotal)}</Text>
        </View>
      </View>

      {/* Bottom Row: Kitchen & Delivery Partner */}
      <View style={styles.bottomRow}>
        <View style={styles.kitchenInfo}>
          <MaterialIcons name="restaurant" size={11} color={colors.textMuted} />
          <Text style={styles.kitchenText} numberOfLines={1}>
            {order.kitchen.name}
          </Text>
        </View>
        <View style={styles.deliveryInfo}>
          <MaterialIcons name="delivery-dining" size={11} color={colors.textMuted} />
          <Text style={styles.deliveryText}>
            {order.deliveryAssignment?.partner.name || 'Unassigned'}
          </Text>
        </View>
      </View>

      {/* Failure Banner */}
      {order.failureBanner && (
        <View style={styles.failureBanner}>
          <MaterialIcons name="error-outline" size={14} color={colors.error} />
          <Text style={styles.failureBannerText} numberOfLines={1}>
            {order.failureBanner}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusLg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  mealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  mealText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  customerRow: {
    marginBottom: spacing.sm,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 13,
    color: colors.textPrimary,
    marginLeft: 4,
    flex: 1,
    marginRight: spacing.sm,
  },
  customerPhone: {
    fontSize: 12,
    color: colors.textMuted,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: spacing.xs,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginLeft: 3,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  kitchenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  kitchenText: {
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: 3,
    flex: 1,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: 3,
  },
  failureBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    padding: spacing.sm,
    borderRadius: spacing.borderRadiusSm,
    marginTop: spacing.sm,
  },
  failureBannerText: {
    fontSize: 11,
    color: colors.error,
    marginLeft: spacing.xs,
    flex: 1,
  },
});

OrderCard.displayName = 'OrderCard';
