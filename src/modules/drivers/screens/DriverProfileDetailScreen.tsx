import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { useAlert } from '../../../hooks/useAlert';
import { SafeAreaScreen } from '../../../components/common/SafeAreaScreen';
import type { Driver } from '../../../types/driver.types';
import { adminDriversService } from '../../../services/admin-drivers.service';
import {
  EditDriverModal,
  EditVehicleModal,
  SuspendDriverDialog,
  DeleteDriverDialog,
  DriverActivityLog,
  EnhancedImageViewer,
} from '../components';

interface DriverProfileDetailScreenProps {
  driver: Driver;
  onBack: () => void;
  onActionComplete?: () => void;
}

interface DriverStats {
  totalDeliveries: number;
  deliveredCount: number;
  failedCount: number;
  activeCount: number;
  successRate: string;
}

export const DriverProfileDetailScreen: React.FC<DriverProfileDetailScreenProps> = ({
  driver: initialDriver,
  onBack,
  onActionComplete,
}) => {
  const { showSuccess, showError, showConfirm } = useAlert();
  const [driver, setDriver] = useState<Driver>(initialDriver);
  const [stats, setStats] = useState<DriverStats>({
    totalDeliveries: 0,
    deliveredCount: 0,
    failedCount: 0,
    activeCount: 0,
    successRate: '0',
  });
  const [selectedImages, setSelectedImages] = useState<Array<{ url: string; title: string }>>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showEditDriverModal, setShowEditDriverModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    fetchDriverDetails();
  }, []);

  // Reset image states when driver changes
  useEffect(() => {
    setImageLoadError(false);
    setImageLoaded(false);
  }, [driver._id]);

  const fetchDriverDetails = async () => {
    try {
      // Don't show loading screen on initial fetch - we already have data
      // Fetch driver details and stats separately to handle errors independently
      const detailsPromise = adminDriversService.getDriverById(driver._id);
      const statsPromise = adminDriversService.getDriverStats(driver._id);

      // Handle driver details
      try {
        const detailsResponse = await detailsPromise;
        if (detailsResponse.data?.user) {
          setDriver(detailsResponse.data.user);
        }
      } catch (error: any) {
        console.error('Failed to fetch driver details:', error);
        showError('Error', 'Failed to fetch driver details');
      }

      // Handle stats separately - don't let it break the whole page
      try {
        const statsResponse = await statsPromise;
        console.log('Stats response:', statsResponse);
        setStats(statsResponse);
      } catch (error: any) {
        console.error('Failed to fetch driver stats:', error);
        // Set default stats on error so the card still displays
        setStats({
          totalDeliveries: 0,
          deliveredCount: 0,
          failedCount: 0,
          activeCount: 0,
          successRate: '0',
        });
      }
    } catch (error: any) {
      console.error('Unexpected error in fetchDriverDetails:', error);
    }
  };

  const handleActivate = async () => {
    showConfirm(
      'Activate Driver',
      `Activate ${driver.name}? Driver will be able to login and accept deliveries.`,
      async () => {
        try {
          await adminDriversService.activateDriver(driver._id);
          showSuccess('Success', 'Driver activated successfully');
          fetchDriverDetails();
          onActionComplete?.();
        } catch (error: any) {
          showError('Error', error.message || 'Failed to activate driver');
        }
      },
      undefined,
      { confirmText: 'Activate', cancelText: 'Cancel' }
    );
  };

  const handleDeactivate = async () => {
    showConfirm(
      'Deactivate Driver',
      `Deactivate ${driver.name}? Driver will be temporarily blocked from login.`,
      async () => {
        try {
          await adminDriversService.deactivateDriver(driver._id);
          showSuccess('Success', 'Driver deactivated successfully');
          fetchDriverDetails();
          onActionComplete?.();
        } catch (error: any) {
          showError('Error', error.message || 'Failed to deactivate driver');
        }
      },
      undefined,
      { confirmText: 'Deactivate', cancelText: 'Cancel', isDestructive: true }
    );
  };

  const handleSuspend = () => {
    setShowSuspendDialog(true);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleSuspendSuccess = () => {
    fetchDriverDetails();
    onActionComplete?.();
  };

  const handleDeleteSuccess = () => {
    onActionComplete?.();
    onBack();
  };

  const handleEditDriverSuccess = (updatedDriver: Driver) => {
    setDriver(updatedDriver);
    onActionComplete?.();
  };

  const handleEditVehicleSuccess = () => {
    fetchDriverDetails();
    onActionComplete?.();
  };

  const handleViewImage = (url: string, title: string) => {
    setSelectedImages([{ url, title }]);
    setSelectedImageIndex(0);
    setShowImageViewer(true);
  };

  const getInitials = (name: string): string => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string): string => {
    const avatarColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
      '#F8B739', '#52B788', '#E63946', '#457B9D'
    ];
    const charCode = name.charCodeAt(0);
    return avatarColors[charCode % avatarColors.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return colors.success;
      case 'INACTIVE':
        return colors.textMuted;
      case 'SUSPENDED':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getApprovalColor = (approvalStatus: string) => {
    switch (approvalStatus) {
      case 'APPROVED':
        return colors.success;
      case 'PENDING':
        return colors.warning;
      case 'REJECTED':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isLicenseExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry < 30 && daysUntilExpiry > 0;
  };

  const isDocumentExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getExpiryStatusColor = (expiryDate?: string) => {
    if (!expiryDate) return colors.textMuted;
    if (isDocumentExpired(expiryDate)) return colors.error;
    if (isLicenseExpiringSoon(expiryDate)) return colors.warning;
    return colors.success;
  };

  const getExpiryStatusText = (expiryDate?: string) => {
    if (!expiryDate) return 'No expiry date';
    if (isDocumentExpired(expiryDate)) return 'Expired';
    if (isLicenseExpiringSoon(expiryDate)) return 'Expiring Soon';
    return 'Valid';
  };

  return (
    <SafeAreaScreen>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Profile</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {/* Always show initials placeholder as base */}
            <View style={[styles.profileImagePlaceholder, { backgroundColor: getAvatarColor(driver.name) }]}>
              <Text style={styles.initialsText}>{getInitials(driver.name)}</Text>
            </View>

            {/* Layer actual image on top if available and loaded */}
            {driver.profileImage && !imageLoadError && (
              <Image
                source={{ uri: driver.profileImage }}
                style={[styles.profileImage, { opacity: imageLoaded ? 1 : 0 }]}
                onLoad={() => setImageLoaded(true)}
                onError={(error) => {
                  console.log('Profile image load error:', driver.profileImage, error.nativeEvent?.error);
                  setImageLoadError(true);
                }}
              />
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{driver.name}</Text>
            <Text style={styles.profilePhone}>{driver.phone}</Text>
            {driver.email && <Text style={styles.profileEmail}>{driver.email}</Text>}

            <View style={styles.statusBadges}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(driver.status) }]}>
                <Text style={styles.statusText}>{driver.status}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getApprovalColor(driver.approvalStatus) }]}>
                <Text style={styles.statusText}>{driver.approvalStatus}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {driver.status === 'ACTIVE' ? (
            <TouchableOpacity style={[styles.actionButton, styles.deactivateButton]} onPress={handleDeactivate}>
              <MaterialIcons name="pause-circle" size={18} color={colors.white} />
              <Text style={styles.actionButtonText}>Deactivate</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionButton, styles.activateButton]} onPress={handleActivate}>
              <MaterialIcons name="play-circle" size={18} color={colors.white} />
              <Text style={styles.actionButtonText}>Activate</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.actionButton, styles.suspendButton]} onPress={handleSuspend}>
            <MaterialIcons name="block" size={18} color={colors.white} />
            <Text style={styles.actionButtonText}>Suspend</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
            <MaterialIcons name="delete" size={18} color={colors.white} />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalDeliveries}</Text>
              <Text style={styles.statLabel}>Total Deliveries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>{stats.successRate}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.activeCount}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.error }]}>{stats.failedCount}</Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <TouchableOpacity onPress={() => setShowEditDriverModal(true)} style={styles.editButton}>
              <MaterialIcons name="edit" size={18} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{driver.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{driver.phone}</Text>
          </View>
          {driver.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{driver.email}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registration Date</Text>
            <Text style={styles.infoValue}>{formatDate(driver.createdAt)}</Text>
          </View>
          {driver.lastLoginAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Login</Text>
              <Text style={styles.infoValue}>{formatDate(driver.lastLoginAt)}</Text>
            </View>
          )}
        </View>

        {/* License Information */}
        {driver.driverDetails && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>License Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>License Number</Text>
              <Text style={styles.infoValue}>{driver.driverDetails.licenseNumber}</Text>
            </View>

            {driver.driverDetails.licenseExpiryDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Expiry Date</Text>
                <View style={styles.expiryContainer}>
                  <Text style={styles.infoValue}>{formatDate(driver.driverDetails.licenseExpiryDate)}</Text>
                  {isLicenseExpiringSoon(driver.driverDetails.licenseExpiryDate) && (
                    <MaterialIcons name="warning" size={16} color={colors.warning} style={{ marginLeft: 8 }} />
                  )}
                  {isDocumentExpired(driver.driverDetails.licenseExpiryDate) && (
                    <MaterialIcons name="error" size={16} color={colors.error} style={{ marginLeft: 8 }} />
                  )}
                </View>
              </View>
            )}
            {driver.driverDetails.licenseImageUrl && (
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => handleViewImage(driver.driverDetails!.licenseImageUrl!, 'License Image')}
              >
                <MaterialIcons name="image" size={20} color={colors.primary} />
                <Text style={styles.imageButtonText}>View License Image</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Vehicle Information */}
        {driver.driverDetails && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Vehicle Information</Text>
              <TouchableOpacity onPress={() => setShowEditVehicleModal(true)} style={styles.editButton}>
                <MaterialIcons name="edit" size={18} color={colors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vehicle Name</Text>
              <Text style={styles.infoValue}>{driver.driverDetails.vehicleName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vehicle Number</Text>
              <Text style={styles.infoValue}>{driver.driverDetails.vehicleNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vehicle Type</Text>
              <Text style={styles.infoValue}>{driver.driverDetails.vehicleType}</Text>
            </View>
          </View>
        )}

        {/* Vehicle Documents */}
        {driver.driverDetails?.vehicleDocuments && driver.driverDetails.vehicleDocuments.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vehicle Documents</Text>
            {driver.driverDetails.vehicleDocuments.map((doc, index) => {
              const expiryStatusColor = getExpiryStatusColor(doc.expiryDate);
              const expiryStatusText = getExpiryStatusText(doc.expiryDate);

              return (
                <View key={index} style={styles.documentCard}>
                  {/* Document Header with Type Badge */}
                  <View style={styles.documentCardHeader}>
                    <View style={styles.documentTypeBadge}>
                      <MaterialIcons name="description" size={16} color={colors.primary} />
                      <Text style={styles.documentTypeText}>{doc.type}</Text>
                    </View>

                    {/* Expiry Status Badge */}
                    {doc.expiryDate && (
                      <View style={[styles.expiryStatusBadge, { backgroundColor: expiryStatusColor + '20' }]}>
                        <View style={[styles.expiryStatusDot, { backgroundColor: expiryStatusColor }]} />
                        <Text style={[styles.expiryStatusText, { color: expiryStatusColor }]}>
                          {expiryStatusText}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Document Content */}
                  <View style={styles.documentContent}>
                    {/* Thumbnail Image */}
                    {doc.imageUrl && (
                      <TouchableOpacity
                        style={styles.documentThumbnail}
                        onPress={() => handleViewImage(doc.imageUrl!, `${doc.type} Document`)}
                      >
                        <Image
                          source={{ uri: doc.imageUrl }}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
                        <View style={styles.thumbnailOverlay}>
                          <MaterialIcons name="zoom-in" size={24} color={colors.white} />
                        </View>
                      </TouchableOpacity>
                    )}

                    {/* Document Details */}
                    <View style={styles.documentDetails}>
                      {doc.expiryDate && (
                        <View style={styles.documentDetailRow}>
                          <MaterialIcons name="event" size={16} color={colors.textSecondary} />
                          <Text style={styles.documentDetailLabel}>Expiry Date:</Text>
                          <Text style={styles.documentDetailValue}>{formatDate(doc.expiryDate)}</Text>
                        </View>
                      )}

                      {/* View Document Button */}
                      {doc.imageUrl && (
                        <TouchableOpacity
                          style={styles.viewDocumentButton}
                          onPress={() => handleViewImage(doc.imageUrl!, `${doc.type} Document`)}
                        >
                          <MaterialIcons name="visibility" size={18} color={colors.primary} />
                          <Text style={styles.viewDocumentText}>View Full Size</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Activity Log */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setShowActivityLog(!showActivityLog)}
          >
            <Text style={styles.cardTitle}>Activity Log</Text>
            <MaterialIcons
              name={showActivityLog ? 'expand-less' : 'expand-more'}
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          {showActivityLog && (
            <View style={styles.activityLogContainer}>
              <DriverActivityLog driverId={driver._id} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <EditDriverModal
        visible={showEditDriverModal}
        driver={driver}
        onClose={() => setShowEditDriverModal(false)}
        onSuccess={handleEditDriverSuccess}
      />

      <EditVehicleModal
        visible={showEditVehicleModal}
        driver={driver}
        onClose={() => setShowEditVehicleModal(false)}
        onSuccess={handleEditVehicleSuccess}
      />

      <SuspendDriverDialog
        visible={showSuspendDialog}
        driver={driver}
        onClose={() => setShowSuspendDialog(false)}
        onSuccess={handleSuspendSuccess}
      />

      <DeleteDriverDialog
        visible={showDeleteDialog}
        driver={driver}
        onClose={() => setShowDeleteDialog(false)}
        onSuccess={handleDeleteSuccess}
      />

      <EnhancedImageViewer
        visible={showImageViewer}
        images={selectedImages}
        initialIndex={selectedImageIndex}
        onClose={() => setShowImageViewer(false)}
      />
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  profileHeader: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  activateButton: {
    backgroundColor: colors.success,
  },
  deactivateButton: {
    backgroundColor: colors.textSecondary,
  },
  suspendButton: {
    backgroundColor: colors.warning,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 6,
  },
  imageButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  documentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentType: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  documentExpiry: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  documentCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  documentTypeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  expiryStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  expiryStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  expiryStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  documentContent: {
    flexDirection: 'row',
    gap: 12,
  },
  documentThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  documentDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  documentDetailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  documentDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  viewDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  viewDocumentText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  activityLogContainer: {
    minHeight: 200,
    maxHeight: 400,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullImage: {
    width: '90%',
    height: '80%',
  },
});
