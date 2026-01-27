import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
} from 'react-native';
import { useAlert } from '../../../hooks/useAlert';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  CapacitySettings,
  CutoffSettings,
  ServiceArea,
  PackagingStats,
} from '../models/types';
import { colors, spacing } from '../../../theme';

interface SettingsTabProps {
  capacitySettings: CapacitySettings;
  cutoffSettings: CutoffSettings;
  serviceAreas: ServiceArea[];
  packagingStats: PackagingStats;
  onCapacityChange: (settings: CapacitySettings) => void;
  onCutoffChange: (settings: CutoffSettings) => void;
  onServiceAreasChange: (areas: ServiceArea[]) => void;
  onPackagingChange: (stats: PackagingStats) => void;
}

// Card wrapper component
const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

// Progress Bar component
const ProgressBar: React.FC<{ current: number; max: number; label: string }> = ({
  current,
  max,
  label,
}) => {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearLimit = percentage >= 80;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={[styles.progressValue, isNearLimit && styles.progressValueWarning]}>
          {current} / {max}
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%` },
            isNearLimit && styles.progressFillWarning,
          ]}
        />
      </View>
    </View>
  );
};

// Numeric Input component
const NumericInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}> = ({ label, value, onChange, min = 0, max = 9999 }) => {
  const handleChange = (text: string) => {
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    } else if (text === '') {
      onChange(min);
    }
  };

  const increment = () => {
    if (value < max) onChange(value + 10);
  };

  const decrement = () => {
    if (value > min) onChange(value - 10);
  };

  return (
    <View style={styles.numericInput}>
      <Text style={styles.numericLabel}>{label}</Text>
      <View style={styles.numericControls}>
        <TouchableOpacity style={styles.numericButton} onPress={decrement}>
          <MaterialIcons name="remove" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <TextInput
          style={styles.numericValue}
          value={String(value)}
          onChangeText={handleChange}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.numericButton} onPress={increment}>
          <MaterialIcons name="add" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Service Area Chip
const ServiceAreaChip: React.FC<{
  area: ServiceArea;
  onRemove: () => void;
}> = ({ area, onRemove }) => (
  <View style={styles.areaChip}>
    <Text style={styles.areaChipText}>
      {area.name}
      {area.pincode && ` (${area.pincode})`}
    </Text>
    <TouchableOpacity style={styles.areaRemoveButton} onPress={onRemove}>
      <MaterialIcons name="close" size={14} color={colors.textMuted} />
    </TouchableOpacity>
  </View>
);

export const SettingsTab: React.FC<SettingsTabProps> = ({
  capacitySettings,
  cutoffSettings,
  serviceAreas,
  packagingStats,
  onCapacityChange,
  onCutoffChange,
  onServiceAreasChange,
  onPackagingChange,
}) => {
  const { showError, showConfirm } = useAlert();
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaPincode, setNewAreaPincode] = useState('');

  const handleAddArea = () => {
    if (!newAreaName.trim()) {
      showError('Error', 'Please enter area name');
      return;
    }

    const newArea: ServiceArea = {
      id: `area-${Date.now()}`,
      name: newAreaName.trim(),
      pincode: newAreaPincode.trim() || undefined,
    };

    onServiceAreasChange([...serviceAreas, newArea]);
    setNewAreaName('');
    setNewAreaPincode('');
  };

  const handleRemoveArea = (areaId: string) => {
    showConfirm(
      'Remove Area',
      'Are you sure you want to remove this service area?',
      () => {
        onServiceAreasChange(serviceAreas.filter((a) => a.id !== areaId));
      },
      undefined,
      { confirmText: 'Remove', cancelText: 'Cancel', isDestructive: true }
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Capacity Settings */}
      <Card title="Capacity">
        <NumericInput
          label="Max Lunch Meals/Day"
          value={capacitySettings.maxLunchMeals}
          onChange={(value) =>
            onCapacityChange({ ...capacitySettings, maxLunchMeals: value })
          }
        />
        <NumericInput
          label="Max Dinner Meals/Day"
          value={capacitySettings.maxDinnerMeals}
          onChange={(value) =>
            onCapacityChange({ ...capacitySettings, maxDinnerMeals: value })
          }
        />
        <View style={styles.divider} />
        <ProgressBar
          label="Lunch Today"
          current={capacitySettings.currentLunchOrders}
          max={capacitySettings.maxLunchMeals}
        />
        <ProgressBar
          label="Dinner Today"
          current={capacitySettings.currentDinnerOrders}
          max={capacitySettings.maxDinnerMeals}
        />
      </Card>

      {/* Cut-off Settings */}
      <Card title="Cut-off & Time Slots">
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Use Global Defaults</Text>
            <Text style={styles.toggleHelper}>
              Override with kitchen-specific times when disabled
            </Text>
          </View>
          <Switch
            value={cutoffSettings.useGlobalDefaults}
            onValueChange={(value) =>
              onCutoffChange({ ...cutoffSettings, useGlobalDefaults: value })
            }
            trackColor={{ false: colors.divider, true: colors.primaryLight }}
            thumbColor={cutoffSettings.useGlobalDefaults ? colors.primary : colors.card}
          />
        </View>

        <View style={styles.slotSection}>
          <Text style={styles.slotTitle}>Lunch</Text>
          <View style={styles.slotRow}>
            <View style={styles.slotField}>
              <Text style={styles.slotLabel}>Time Slot</Text>
              <TextInput
                style={[styles.slotInput, cutoffSettings.useGlobalDefaults && styles.slotInputDisabled]}
                value={cutoffSettings.lunchSlot}
                onChangeText={(value) =>
                  onCutoffChange({ ...cutoffSettings, lunchSlot: value })
                }
                editable={!cutoffSettings.useGlobalDefaults}
              />
            </View>
            <View style={styles.slotField}>
              <Text style={styles.slotLabel}>Cut-off</Text>
              <TextInput
                style={[styles.slotInput, cutoffSettings.useGlobalDefaults && styles.slotInputDisabled]}
                value={cutoffSettings.lunchCutoff}
                onChangeText={(value) =>
                  onCutoffChange({ ...cutoffSettings, lunchCutoff: value })
                }
                editable={!cutoffSettings.useGlobalDefaults}
              />
            </View>
          </View>
        </View>

        <View style={styles.slotSection}>
          <Text style={styles.slotTitle}>Dinner</Text>
          <View style={styles.slotRow}>
            <View style={styles.slotField}>
              <Text style={styles.slotLabel}>Time Slot</Text>
              <TextInput
                style={[styles.slotInput, cutoffSettings.useGlobalDefaults && styles.slotInputDisabled]}
                value={cutoffSettings.dinnerSlot}
                onChangeText={(value) =>
                  onCutoffChange({ ...cutoffSettings, dinnerSlot: value })
                }
                editable={!cutoffSettings.useGlobalDefaults}
              />
            </View>
            <View style={styles.slotField}>
              <Text style={styles.slotLabel}>Cut-off</Text>
              <TextInput
                style={[styles.slotInput, cutoffSettings.useGlobalDefaults && styles.slotInputDisabled]}
                value={cutoffSettings.dinnerCutoff}
                onChangeText={(value) =>
                  onCutoffChange({ ...cutoffSettings, dinnerCutoff: value })
                }
                editable={!cutoffSettings.useGlobalDefaults}
              />
            </View>
          </View>
        </View>
      </Card>

      {/* Service Areas */}
      <Card title="Service Areas (Jaipur)">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areasScroll}>
          <View style={styles.areasContainer}>
            {serviceAreas.map((area) => (
              <ServiceAreaChip
                key={area.id}
                area={area}
                onRemove={() => handleRemoveArea(area.id)}
              />
            ))}
          </View>
        </ScrollView>
        <View style={styles.addAreaSection}>
          <TextInput
            style={styles.addAreaInput}
            placeholder="Area name"
            placeholderTextColor={colors.textMuted}
            value={newAreaName}
            onChangeText={setNewAreaName}
          />
          <TextInput
            style={[styles.addAreaInput, styles.addAreaInputSmall]}
            placeholder="Pincode"
            placeholderTextColor={colors.textMuted}
            value={newAreaPincode}
            onChangeText={setNewAreaPincode}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addAreaButton} onPress={handleAddArea}>
            <MaterialIcons name="add" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Packaging */}
      <Card title="Packaging & Dabba Rotation">
        <View style={styles.packagingNote}>
          <MaterialIcons name="info-outline" size={16} color={colors.info} />
          <Text style={styles.packagingNoteText}>
            Steel dabba is automatically enabled for subscription plans with more than 14 vouchers.
          </Text>
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Allow Disposable Override</Text>
            <Text style={styles.toggleHelper}>
              Let customers choose disposable even when eligible for steel dabba
            </Text>
          </View>
          <Switch
            value={packagingStats.allowDisposableOverride}
            onValueChange={(value) =>
              onPackagingChange({ ...packagingStats, allowDisposableOverride: value })
            }
            trackColor={{ false: colors.divider, true: colors.primaryLight }}
            thumbColor={packagingStats.allowDisposableOverride ? colors.primary : colors.card}
          />
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <MaterialIcons name="inventory" size={20} color={colors.primary} />
            <Text style={styles.statBoxValue}>{packagingStats.totalIssued}</Text>
            <Text style={styles.statBoxLabel}>Total Issued</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="people" size={20} color={colors.warning} />
            <Text style={styles.statBoxValue}>{packagingStats.withCustomers}</Text>
            <Text style={styles.statBoxLabel}>With Customers</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="assignment-return" size={20} color={colors.success} />
            <Text style={styles.statBoxValue}>{packagingStats.expectedReturnsToday}</Text>
            <Text style={styles.statBoxLabel}>Returns Today</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="warning" size={20} color={colors.error} />
            <Text style={styles.statBoxValue}>{packagingStats.lostDamagedThisMonth}</Text>
            <Text style={styles.statBoxLabel}>Lost/Damaged</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  // Numeric Input
  numericInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  numericLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  numericControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusMd,
  },
  numericButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numericValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    minWidth: 60,
    paddingHorizontal: spacing.sm,
  },
  // Progress Bar
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressValueWarning: {
    color: colors.warning,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressFillWarning: {
    backgroundColor: colors.warning,
  },
  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  toggleHelper: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  // Slot Settings
  slotSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  slotTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  slotRow: {
    flexDirection: 'row',
  },
  slotField: {
    flex: 1,
    marginRight: spacing.sm,
  },
  slotLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  slotInput: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusSm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 13,
    color: colors.textPrimary,
  },
  slotInputDisabled: {
    opacity: 0.5,
  },
  // Service Areas
  areasScroll: {
    marginBottom: spacing.md,
  },
  areasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  areaChipText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  areaRemoveButton: {
    marginLeft: spacing.xs,
    padding: 2,
  },
  addAreaSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addAreaInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadiusSm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 13,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  addAreaInputSmall: {
    flex: 0.5,
  },
  addAreaButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Packaging
  packagingNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoLight,
    padding: spacing.sm,
    borderRadius: spacing.borderRadiusSm,
    marginBottom: spacing.md,
  },
  packagingNoteText: {
    fontSize: 12,
    color: colors.info,
    marginLeft: spacing.xs,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  statBox: {
    width: '50%',
    padding: spacing.sm,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statBoxLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export default SettingsTab;
