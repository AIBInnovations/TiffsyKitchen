import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  MealSummary,
  OrderStatusCount,
  DeliveryBatch,
  OrderStatusType,
  orderStatusColors,
  batchStatusColors,
} from '../models/types';
import { colors, spacing } from '../../../theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface OverviewTabProps {
  mealSummaries: MealSummary[];
  orderStatusCounts: OrderStatusCount[];
  deliveryBatches: DeliveryBatch[];
  onBatchStatusChange: (batchId: string, newStatus: DeliveryBatch['status']) => void;
}

// Card wrapper component
const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

// Meal Summary Section
const MealSummarySection: React.FC<{ summaries: MealSummary[] }> = ({ summaries }) => {
  const lunch = summaries.find(s => s.mealType === 'lunch');
  const dinner = summaries.find(s => s.mealType === 'dinner');

  const renderMealColumn = (meal: MealSummary | undefined, label: string, icon: string) => {
    if (!meal) return null;
    return (
      <View style={styles.mealColumn}>
        <View style={styles.mealHeader}>
          <MaterialIcons name={icon} size={16} color={label === 'Lunch' ? '#f97316' : '#6366f1'} />
          <Text style={styles.mealLabel}>{label}</Text>
          <View style={[styles.frozenBadge, meal.isFrozen ? styles.frozenBadgeActive : styles.frozenBadgeOpen]}>
            <Text style={[styles.frozenText, meal.isFrozen ? styles.frozenTextActive : styles.frozenTextOpen]}>
              {meal.isFrozen ? 'Frozen' : 'Open'}
            </Text>
          </View>
        </View>
        <Text style={styles.mealTotal}>{meal.totalOrders} orders</Text>
        <View style={styles.mealStats}>
          <Text style={styles.mealStatText}>Veg: {meal.vegCount}</Text>
          <Text style={styles.mealStatText}>Non-Veg: {meal.nonVegCount}</Text>
          <Text style={styles.mealStatText}>Special: {meal.specialCount}</Text>
        </View>
        <View style={styles.packagingRow}>
          <MaterialIcons name="eco" size={12} color={colors.success} />
          <Text style={styles.packagingText}>Steel: {meal.steelDabbaCount}</Text>
          <MaterialIcons name="takeout-dining" size={12} color={colors.textMuted} style={{ marginLeft: spacing.sm }} />
          <Text style={styles.packagingText}>Disp: {meal.disposableCount}</Text>
        </View>
        <Text style={styles.cutoffText}>Cut-off: {meal.cutoffTime}</Text>
      </View>
    );
  };

  return (
    <Card title="Today's Meal Summary">
      <View style={styles.mealGrid}>
        {renderMealColumn(lunch, 'Lunch', 'wb-sunny')}
        <View style={styles.mealDivider} />
        {renderMealColumn(dinner, 'Dinner', 'nights-stay')}
      </View>
    </Card>
  );
};

// Order Status Section
const OrderStatusSection: React.FC<{
  statusCounts: OrderStatusCount[];
  selectedStatus: OrderStatusType | null;
  onSelectStatus: (status: OrderStatusType | null) => void;
}> = ({ statusCounts, selectedStatus, onSelectStatus }) => (
  <Card title="Order Status">
    <View style={styles.statusGrid}>
      {statusCounts.map((item) => {
        const isSelected = selectedStatus === item.status;
        return (
          <TouchableOpacity
            key={item.status}
            style={[styles.statusChip, isSelected && styles.statusChipSelected]}
            onPress={() => onSelectStatus(isSelected ? null : item.status)}
          >
            <View style={[styles.statusDot, { backgroundColor: item.color }]} />
            <Text style={styles.statusChipText}>{item.status}</Text>
            <Text style={[styles.statusCount, { color: item.color }]}>{item.count}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </Card>
);

// Batch Row Component
const BatchRow: React.FC<{
  batch: DeliveryBatch;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (newStatus: DeliveryBatch['status']) => void;
}> = ({ batch, isExpanded, onToggle, onStatusChange }) => {
  const statusStyle = batchStatusColors[batch.status];

  const getNextStatus = (): DeliveryBatch['status'] | null => {
    switch (batch.status) {
      case 'Preparing': return 'Ready for pickup';
      case 'Ready for pickup': return 'Dispatched';
      case 'Dispatched': return 'Completed';
      default: return null;
    }
  };

  const nextStatus = getNextStatus();

  return (
    <View style={styles.batchRow}>
      <TouchableOpacity style={styles.batchHeader} onPress={onToggle}>
        <View style={styles.batchInfo}>
          <Text style={styles.batchId}>{batch.id}</Text>
          <View style={[styles.batchStatusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.batchStatusText, { color: statusStyle.text }]}>{batch.status}</Text>
          </View>
        </View>
        <View style={styles.batchMeta}>
          <Text style={styles.batchMetaText}>
            {batch.mealType === 'lunch' ? 'Lunch' : 'Dinner'} • {batch.timeSlot}
          </Text>
          <Text style={styles.batchMetaText}>{batch.orderCount} orders • {batch.riderName}</Text>
        </View>
        <MaterialIcons
          name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.batchExpanded}>
          <Text style={styles.batchOrdersLabel}>Orders:</Text>
          {batch.orders.map((order) => (
            <View key={order.orderId} style={styles.batchOrderRow}>
              <Text style={styles.batchOrderId}>{order.orderId}</Text>
              <Text style={styles.batchOrderName}>{order.customerName}</Text>
            </View>
          ))}
          {nextStatus && (
            <TouchableOpacity
              style={styles.batchActionButton}
              onPress={() => onStatusChange(nextStatus)}
            >
              <MaterialIcons name="check-circle" size={16} color={colors.white} />
              <Text style={styles.batchActionText}>Mark as {nextStatus}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

// Delivery Batches Section
const DeliveryBatchesSection: React.FC<{
  batches: DeliveryBatch[];
  onBatchStatusChange: (batchId: string, newStatus: DeliveryBatch['status']) => void;
}> = ({ batches, onBatchStatusChange }) => {
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

  const handleToggle = (batchId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedBatch(expandedBatch === batchId ? null : batchId);
  };

  return (
    <Card title="Delivery Batches">
      {batches.map((batch) => (
        <BatchRow
          key={batch.id}
          batch={batch}
          isExpanded={expandedBatch === batch.id}
          onToggle={() => handleToggle(batch.id)}
          onStatusChange={(newStatus) => onBatchStatusChange(batch.id, newStatus)}
        />
      ))}
    </Card>
  );
};

export const OverviewTab: React.FC<OverviewTabProps> = ({
  mealSummaries,
  orderStatusCounts,
  deliveryBatches,
  onBatchStatusChange,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusType | null>(null);

  return (
    <View style={styles.container}>
      <MealSummarySection summaries={mealSummaries} />
      <OrderStatusSection
        statusCounts={orderStatusCounts}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
      />
      <DeliveryBatchesSection
        batches={deliveryBatches}
        onBatchStatusChange={onBatchStatusChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusLg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  // Meal Summary
  mealGrid: {
    flexDirection: 'row',
  },
  mealColumn: {
    flex: 1,
  },
  mealDivider: {
    width: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.md,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  mealLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  frozenBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  frozenBadgeActive: {
    backgroundColor: colors.infoLight,
  },
  frozenBadgeOpen: {
    backgroundColor: colors.successLight,
  },
  frozenText: {
    fontSize: 10,
    fontWeight: '600',
  },
  frozenTextActive: {
    color: colors.info,
  },
  frozenTextOpen: {
    color: colors.success,
  },
  mealTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  mealStats: {
    marginBottom: spacing.xs,
  },
  mealStatText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  packagingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  packagingText: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 4,
  },
  cutoffText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  // Order Status
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  statusChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  statusCount: {
    fontSize: 14,
    fontWeight: '700',
  },
  // Batches
  batchRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  batchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batchInfo: {
    flex: 1,
  },
  batchId: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  batchStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  batchStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  batchMeta: {
    flex: 1,
    marginLeft: spacing.md,
  },
  batchMetaText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  batchExpanded: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  batchOrdersLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  batchOrderRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  batchOrderId: {
    fontSize: 11,
    color: colors.primary,
    width: 80,
  },
  batchOrderName: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  batchActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
    marginTop: spacing.sm,
  },
  batchActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.xs,
  },
});

export default OverviewTab;
