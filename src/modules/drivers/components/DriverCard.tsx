import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import type { DriverCardProps } from '../../../types/driver.types';

const getVehicleIcon = (vehicleType?: string) => {
  switch (vehicleType) {
    case 'BIKE':
      return 'motorcycle';
    case 'SCOOTER':
      return 'moped';
    case 'BICYCLE':
      return 'pedal-bike';
    default:
      return 'two-wheeler';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return colors.warning;
    case 'APPROVED':
      return colors.success;
    case 'REJECTED':
      return colors.error;
    default:
      return colors.gray500;
  }
};

export const DriverCard: React.FC<DriverCardProps> = ({ driver, onPress }) => {
  const statusColor = getStatusColor(driver.approvalStatus);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(driver)}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {driver.profileImage ? (
            <Image source={{ uri: driver.profileImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <MaterialIcons name="person" size={24} color={colors.gray500} />
            </View>
          )}
        </View>

        {/* Driver Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{driver.name}</Text>
          <Text style={styles.phone}>{driver.phone}</Text>

          {/* Vehicle Info */}
          {driver.driverDetails?.vehicleName && (
            <View style={styles.vehicleRow}>
              <MaterialIcons
                name={getVehicleIcon(driver.driverDetails.vehicleType)}
                size={16}
                color={colors.gray600}
              />
              <Text style={styles.vehicleText}>
                {driver.driverDetails.vehicleName}
                {driver.driverDetails.vehicleNumber &&
                  ` • ${driver.driverDetails.vehicleNumber}`}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {driver.approvalStatus}
          </Text>
        </View>

        {/* Registration Date */}
        <Text style={styles.dateText}>{formatDate(driver.createdAt)}</Text>

        {/* Chevron */}
        <MaterialIcons name="chevron-right" size={24} color={colors.gray400} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 6,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleText: {
    fontSize: 13,
    color: colors.gray600,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: colors.gray500,
  },
});
