import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Zone } from '../../../types/api.types';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAlert } from '../../../hooks/useAlert';

interface ZoneCardProps {
  zone: Zone;
  onEdit: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
  onToggleStatus: (zone: Zone) => void;
  onToggleOrdering: (zone: Zone, enabled: boolean) => void;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({
  zone,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleOrdering,
}) => {
  const { showConfirm } = useAlert();

  const handleDelete = () => {
    showConfirm(
      'Delete Zone',
      `Are you sure you want to delete ${zone.name} (${zone.pincode})?\n\nThis action cannot be undone.`,
      () => onDelete(zone),
      undefined,
      { confirmText: 'Delete', cancelText: 'Cancel', isDestructive: true }
    );
  };

  const handleToggleStatus = () => {
    const action = zone.status === 'ACTIVE' ? 'deactivate' : 'activate';
    const actionTitle = action === 'activate' ? 'Activate' : 'Deactivate';
    showConfirm(
      `${actionTitle} Zone`,
      `Are you sure you want to ${action} ${zone.name}?`,
      () => onToggleStatus(zone),
      undefined,
      { confirmText: actionTitle, cancelText: 'Cancel' }
    );
  };

  const isActive = zone.status === 'ACTIVE';

  return (
    <TouchableOpacity
      style={[styles.card, !isActive && styles.cardInactive]}
      onPress={() => onEdit(zone)}
      activeOpacity={0.95}>

      {/* Top Accent Bar */}
      <View style={[styles.accentBar, { backgroundColor: isActive ? colors.success : colors.textMuted }]} />

      {/* Header Section */}
      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
          {/* Pincode - Hero Element */}
          <View style={styles.pincodeSection}>
            <View style={styles.pincodeIconBg}>
              <Icon name="map-marker" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.pincodeInfo}>
              <Text style={styles.pincodeLabel}>PINCODE</Text>
              <Text style={styles.pincode}>{zone.pincode}</Text>
            </View>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
            <View style={[styles.statusDot, { backgroundColor: isActive ? '#10b981' : '#94a3b8' }]} />
            <Text style={[styles.statusText, { color: isActive ? '#10b981' : '#64748b' }]}>
              {isActive ? 'ACTIVE' : 'INACTIVE'}
            </Text>
          </View>
        </View>

        {/* Zone Name - Prominent */}
        <Text style={styles.zoneName} numberOfLines={2}>
          {zone.name}
        </Text>

        {/* Location Info */}
        <View style={styles.locationContainer}>
          <Icon name="map-marker-radius" size={12} color={colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {zone.city}, {zone.state}
          </Text>
        </View>
      </View>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        {/* Timezone Card */}
        <View style={styles.infoCard}>
          <Icon name="clock-time-four" size={16} color={colors.primary} />
          <Text style={styles.infoCardLabel}>Timezone</Text>
          <Text style={styles.infoCardValue} numberOfLines={1}>{zone.timezone}</Text>
        </View>

        {/* Display Order Card */}
        <View style={styles.infoCard}>
          <Icon name="format-list-numbered" size={16} color={colors.primary} />
          <Text style={styles.infoCardLabel}>Display Order</Text>
          <Text style={styles.infoCardValue}>{zone.displayOrder || 'N/A'}</Text>
        </View>
      </View>

      {/* Ordering Status - Compact Section */}
      <View style={[styles.orderingSection, zone.orderingEnabled && styles.orderingSectionActive]}>
        <View style={styles.orderingContent}>
          <View style={[styles.orderingIcon, zone.orderingEnabled && styles.orderingIconActive]}>
            <Icon
              name={zone.orderingEnabled ? 'storefront' : 'storefront-outline'}
              size={18}
              color={zone.orderingEnabled ? '#10b981' : '#94a3b8'}
            />
          </View>
          <View style={styles.orderingTextContainer}>
            <Text style={styles.orderingTitle}>Online Ordering</Text>
            <Text style={[styles.orderingStatus, zone.orderingEnabled && styles.orderingStatusActive]}>
              {zone.orderingEnabled ? 'Accepting Orders' : 'Not Accepting Orders'}
            </Text>
          </View>
        </View>
        <Switch
          value={zone.orderingEnabled}
          onValueChange={(value) => onToggleOrdering(zone, value)}
          trackColor={{ false: '#e2e8f0', true: '#86efac' }}
          thumbColor={zone.orderingEnabled ? '#10b981' : '#cbd5e1'}
          ios_backgroundColor="#e2e8f0"
        />
      </View>

      {/* Actions Section - Compact Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => onEdit(zone)}
          activeOpacity={0.8}>
          <Icon name="pencil" size={16} color="#FFFFFF" />
          <Text style={styles.primaryActionText}>Edit</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.secondaryActionButton, styles.statusActionButton]}
            onPress={handleToggleStatus}
            activeOpacity={0.8}>
            <Icon
              name={isActive ? 'pause' : 'play'}
              size={16}
              color={isActive ? '#f59e0b' : '#10b981'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryActionButton, styles.deleteActionButton]}
            onPress={handleDelete}
            activeOpacity={0.8}>
            <Icon name="delete" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Card Container - Compact Modern Design
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardInactive: {
    opacity: 0.65,
  },

  // Accent Bar at Top - Visual Status Indicator
  accentBar: {
    height: 3,
    width: '100%',
  },

  // Header Section - Compact Information
  cardHeader: {
    padding: 14,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  // Pincode Section - Compact Display
  pincodeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pincodeIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  pincodeInfo: {
    flex: 1,
  },
  pincodeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.6,
    marginBottom: 1,
  },
  pincode: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: 0.8,
  },

  // Status Badge - Compact Design
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#f1f5f9',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // Zone Name - Compact Typography
  zoneName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 22,
    marginBottom: 6,
  },

  // Location Container - Compact
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 4,
  },

  // Info Grid - Compact Card Layout
  infoGrid: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoCardLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
    marginBottom: 1,
  },
  infoCardValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },

  // Ordering Section - Compact Feature Display
  orderingSection: {
    marginHorizontal: 14,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderingSectionActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  orderingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  orderingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  orderingIconActive: {
    backgroundColor: '#d1fae5',
  },
  orderingTextContainer: {
    flex: 1,
  },
  orderingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 1,
  },
  orderingStatus: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748b',
  },
  orderingStatusActive: {
    color: '#059669',
  },

  // Actions Section - Compact Button Design
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    gap: 6,
  },
  primaryActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusActionButton: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde047',
  },
  deleteActionButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
});
