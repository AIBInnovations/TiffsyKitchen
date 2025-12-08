import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Plan } from '../../types/dashboard';
import { SectionHeader } from './SectionHeader';
import { formatCurrency } from '../../data/dashboardMockData';

interface PlanSummaryRowProps {
  plans: Plan[];
  onPlanPress?: (planId: string) => void;
  onViewAllPress?: () => void;
}

export const PlanSummaryRow: React.FC<PlanSummaryRowProps> = ({
  plans,
  onPlanPress,
  onViewAllPress,
}) => {
  const totalSubscribers = plans.reduce((sum, plan) => sum + plan.activeSubscribers, 0);
  const totalRevenue = plans.reduce((sum, plan) => sum + plan.totalRevenue, 0);

  const getDurationBadgeColor = (duration: 'weekly' | 'monthly'): string => {
    return duration === 'weekly' ? '#3b82f6' : '#8b5cf6';
  };

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Plan Summary"
        subtitle={`${totalSubscribers} active subscribers`}
        actionLabel="View All"
        onActionPress={onViewAllPress}
      />

      <View style={styles.totalRevenue}>
        <Text style={styles.totalRevenueLabel}>Total Subscription Revenue</Text>
        <Text style={styles.totalRevenueValue}>{formatCurrency(totalRevenue)}</Text>
      </View>

      {plans.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={styles.planRow}
          onPress={() => onPlanPress?.(plan.id)}
          activeOpacity={0.7}
        >
          <View style={styles.planInfo}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View
                style={[
                  styles.durationBadge,
                  { backgroundColor: getDurationBadgeColor(plan.duration) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.durationText,
                    { color: getDurationBadgeColor(plan.duration) },
                  ]}
                >
                  {plan.duration}
                </Text>
              </View>
            </View>
            <Text style={styles.planDescription}>{plan.description}</Text>
          </View>

          <View style={styles.planStats}>
            <View style={styles.statItem}>
              <MaterialIcons name="people" size={14} color="#6b7280" />
              <Text style={styles.statValue}>{plan.activeSubscribers}</Text>
            </View>
            <Text style={styles.planRevenue}>{formatCurrency(plan.totalRevenue)}</Text>
          </View>

          <MaterialIcons name="chevron-right" size={20} color="#d1d5db" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  totalRevenue: {
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRevenueLabel: {
    fontSize: 13,
    color: '#9a3412',
  },
  totalRevenueValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#c2410c',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  planInfo: {
    flex: 1,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  durationBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  planDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  planStats: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  planRevenue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
});

PlanSummaryRow.displayName = 'PlanSummaryRow';
