import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { StatusTimelineStep } from '../models/types';
import { formatTime, formatDate } from '../utils/orderUtils';
import { colors, spacing } from '../../../theme';

interface TimelineStepProps {
  step: StatusTimelineStep;
  isLast?: boolean;
  style?: ViewStyle;
}

export const TimelineStep: React.FC<TimelineStepProps> = ({
  step,
  isLast = false,
  style,
}) => {
  const getIconName = (): string => {
    if (step.isCompleted) return 'check-circle';
    if (step.isCurrent) return 'radio-button-checked';
    return 'radio-button-unchecked';
  };

  const getIconColor = (): string => {
    if (step.isCompleted) return colors.success;
    if (step.isCurrent) return colors.primary;
    return colors.textMuted;
  };

  const getLineColor = (): string => {
    if (step.isCompleted) return colors.success;
    return colors.border;
  };

  const isFailed = step.status === 'FAILED' || step.status === 'CANCELLED' || step.status === 'REFUNDED';

  return (
    <View style={[styles.container, style]}>
      {/* Icon and Line */}
      <View style={styles.iconColumn}>
        <View style={[styles.iconWrapper, step.isCurrent && styles.iconWrapperCurrent]}>
          <MaterialIcons
            name={isFailed && step.isCurrent ? 'error' : getIconName()}
            size={20}
            color={isFailed && step.isCurrent ? colors.error : getIconColor()}
          />
        </View>
        {!isLast && (
          <View style={[styles.line, { backgroundColor: getLineColor() }]} />
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.label,
            step.isCompleted && styles.labelCompleted,
            step.isCurrent && styles.labelCurrent,
            step.isPending && styles.labelPending,
            isFailed && step.isCurrent && styles.labelFailed,
          ]}
        >
          {step.label}
        </Text>
        {step.timestamp ? (
          <Text style={styles.timestamp}>
            {formatDate(step.timestamp)} at {formatTime(step.timestamp)}
          </Text>
        ) : (
          <Text style={styles.pendingText}>Pending</Text>
        )}
        {step.note && (
          <View style={styles.noteContainer}>
            <MaterialIcons name="info-outline" size={12} color={colors.textMuted} />
            <Text style={styles.noteText}>{step.note}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  iconColumn: {
    alignItems: 'center',
    width: 32,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  iconWrapperCurrent: {
    backgroundColor: colors.primaryLight,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
    borderRadius: 1,
  },
  content: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  labelCompleted: {
    color: colors.success,
  },
  labelCurrent: {
    color: colors.primary,
  },
  labelPending: {
    color: colors.textMuted,
  },
  labelFailed: {
    color: colors.error,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pendingText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: spacing.borderRadiusSm,
  },
  noteText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
});

TimelineStep.displayName = 'TimelineStep';
