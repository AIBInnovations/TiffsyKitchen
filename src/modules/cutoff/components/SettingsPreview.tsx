import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  CutoffTimesSettings,
  parseTimeString,
  formatTimeToDisplay,
  OVERRIDE_ROLES,
} from '../models/types';
import { colors, spacing } from '../../../theme';

interface SettingsPreviewProps {
  settings: CutoffTimesSettings;
}

interface PreviewRowProps {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}

const PreviewRow: React.FC<PreviewRowProps> = ({ icon, label, value, valueColor }) => (
  <View style={styles.row}>
    <MaterialIcons name={icon} size={16} color={colors.textMuted} style={styles.rowIcon} />
    <Text style={styles.rowLabel}>{label}:</Text>
    <Text style={[styles.rowValue, valueColor && { color: valueColor }]}>{value}</Text>
  </View>
);

export const SettingsPreview: React.FC<SettingsPreviewProps> = ({ settings }) => {
  const lunchStart = formatTimeToDisplay(parseTimeString(settings.lunch.startTime));
  const lunchCutoff = formatTimeToDisplay(parseTimeString(settings.lunch.cutoffTime));
  const dinnerStart = formatTimeToDisplay(parseTimeString(settings.dinner.startTime));
  const dinnerCutoff = formatTimeToDisplay(parseTimeString(settings.dinner.cutoffTime));

  const getRoleLabels = (): string => {
    if (settings.operationalBehavior.overrideRoles.length === 0) {
      return 'None';
    }
    return settings.operationalBehavior.overrideRoles
      .map((roleId) => OVERRIDE_ROLES.find((r) => r.id === roleId)?.label || roleId)
      .join(', ');
  };

  const getEmergencyOverrideSummary = (): string => {
    if (!settings.emergencyOverride.active) {
      return 'Inactive';
    }

    const type = settings.emergencyOverride.type;
    const meals = settings.emergencyOverride.meals.join(', ') || 'None';
    const minutes = settings.emergencyOverride.minutes;

    if (type === 'STOP_ORDERS') {
      return `Active: Stop orders for ${meals}`;
    } else if (type === 'EXTEND') {
      return `Active: Extend by ${minutes} min for ${meals}`;
    } else {
      return `Active: Close early by ${minutes} min for ${meals}`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="preview" size={18} color={colors.primary} />
        <Text style={styles.title}>Preview</Text>
      </View>

      <View style={styles.content}>
        <PreviewRow
          icon="wb-sunny"
          label="Lunch ordering"
          value={`${lunchStart} – ${lunchCutoff}`}
        />
        <PreviewRow
          icon="nights-stay"
          label="Dinner ordering"
          value={`${dinnerStart} – ${dinnerCutoff}`}
        />
        <PreviewRow
          icon="edit"
          label="Order edits"
          value={settings.operationalBehavior.allowOrderEditUntilCutoff ? 'Allowed until cut-off' : 'Not allowed'}
          valueColor={settings.operationalBehavior.allowOrderEditUntilCutoff ? colors.success : colors.textMuted}
        />
        <PreviewRow
          icon="event-busy"
          label="Subscription skips"
          value={settings.operationalBehavior.allowSkipUntilCutoff ? 'Allowed until cut-off' : 'Not allowed'}
          valueColor={settings.operationalBehavior.allowSkipUntilCutoff ? colors.success : colors.textMuted}
        />
        <PreviewRow
          icon="admin-panel-settings"
          label="Manual overrides"
          value={settings.operationalBehavior.allowOverrideAfterCutoff ? `Enabled (${getRoleLabels()})` : 'Disabled'}
          valueColor={settings.operationalBehavior.allowOverrideAfterCutoff ? colors.warning : colors.textMuted}
        />
        <PreviewRow
          icon="speed"
          label="Capacity limit"
          value={settings.capacity.enableSoftCapacity ? `${settings.capacity.maxMealsPerSlot} meals/slot` : 'Disabled'}
          valueColor={settings.capacity.enableSoftCapacity ? colors.primary : colors.textMuted}
        />
        <PreviewRow
          icon="warning"
          label="Emergency override"
          value={getEmergencyOverrideSummary()}
          valueColor={settings.emergencyOverride.active ? colors.error : colors.textMuted}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusLg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  content: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  rowIcon: {
    width: 20,
    marginRight: spacing.xs,
  },
  rowLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  rowValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'right',
  },
});

export default SettingsPreview;
