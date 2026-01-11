/**
 * Subscription Detail Modal Component
 *
 * Shows detailed view of a customer subscription with voucher details
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SubscriptionDetail } from '../../../types/subscription.types';
import { format } from 'date-fns';

interface SubscriptionDetailModalProps {
  visible: boolean;
  onClose: () => void;
  subscription: SubscriptionDetail | null;
  loading: boolean;
  onCancel?: () => void;
}

const PRIMARY_COLOR = '#f97316';

export const SubscriptionDetailModal: React.FC<SubscriptionDetailModalProps> = ({
  visible,
  onClose,
  subscription,
  loading,
  onCancel,
}) => {
  if (!subscription && !loading) {
    return null;
  }

  const usagePercentage = subscription
    ? Math.round((subscription.vouchersUsed / subscription.vouchersIssued) * 100)
    : 0;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text style={styles.loadingText}>Loading details...</Text>
          </View>
        ) : subscription ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Customer Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.infoRow}>
                <Icon name="person" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{subscription.userId.name}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Icon name="phone" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{subscription.userId.phone}</Text>
                </View>
              </View>
              {subscription.userId.email && (
                <View style={styles.infoRow}>
                  <Icon name="email" size={20} color="#6b7280" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{subscription.userId.email}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Plan Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Plan Information</Text>
              <View style={styles.infoRow}>
                <Icon name="card-membership" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Plan</Text>
                  <Text style={styles.infoValue}>{subscription.planId.name}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Icon name="schedule" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>{subscription.planId.durationDays} days</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Icon name="confirmation-number" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Vouchers per Day</Text>
                  <Text style={styles.infoValue}>{subscription.planId.vouchersPerDay}</Text>
                </View>
              </View>
            </View>

            {/* Voucher Usage Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Voucher Usage</Text>
              <View style={styles.progressCard}>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Used</Text>
                  <Text style={styles.progressValue}>{subscription.vouchersUsed}</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarFill, { width: `${usagePercentage}%` }]} />
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Remaining</Text>
                  <Text style={styles.progressValue}>{subscription.vouchersRemaining}</Text>
                </View>
                <Text style={styles.progressTotal}>
                  Total Issued: {subscription.vouchersIssued} vouchers
                </Text>
              </View>
            </View>

            {/* Payment Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Information</Text>
              <View style={styles.infoRow}>
                <Icon name="payments" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Amount Paid</Text>
                  <Text style={styles.infoValue}>₹{subscription.amountPaid}</Text>
                </View>
              </View>
              {subscription.paymentMethod && (
                <View style={styles.infoRow}>
                  <Icon name="credit-card" size={20} color="#6b7280" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Payment Method</Text>
                    <Text style={styles.infoValue}>{subscription.paymentMethod}</Text>
                  </View>
                </View>
              )}
              {subscription.paymentId && (
                <View style={styles.infoRow}>
                  <Icon name="receipt" size={20} color="#6b7280" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Payment ID</Text>
                    <Text style={styles.infoValue}>{subscription.paymentId}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Dates Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Important Dates</Text>
              <View style={styles.infoRow}>
                <Icon name="event" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Purchased At</Text>
                  <Text style={styles.infoValue}>
                    {format(new Date(subscription.purchasedAt), 'MMM dd, yyyy hh:mm a')}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Icon name="event-available" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Expires At</Text>
                  <Text style={styles.infoValue}>
                    {format(new Date(subscription.expiresAt), 'MMM dd, yyyy hh:mm a')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Cancellation Info (if cancelled) */}
            {subscription.status === 'CANCELLED' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cancellation Details</Text>
                {subscription.cancelledAt && (
                  <View style={styles.infoRow}>
                    <Icon name="cancel" size={20} color="#dc2626" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Cancelled At</Text>
                      <Text style={styles.infoValue}>
                        {format(new Date(subscription.cancelledAt), 'MMM dd, yyyy hh:mm a')}
                      </Text>
                    </View>
                  </View>
                )}
                {subscription.cancellationReason && (
                  <View style={styles.infoRow}>
                    <Icon name="info" size={20} color="#dc2626" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Reason</Text>
                      <Text style={styles.infoValue}>{subscription.cancellationReason}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Voucher Details */}
            {subscription.voucherDetails && subscription.voucherDetails.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Voucher Details ({subscription.voucherDetails.length})
                </Text>
                {subscription.voucherDetails.slice(0, 10).map((voucher) => (
                  <View key={voucher._id} style={styles.voucherItem}>
                    <Icon
                      name={voucher.status === 'USED' ? 'check-circle' : 'confirmation-number'}
                      size={16}
                      color={voucher.status === 'USED' ? '#10b981' : '#9ca3af'}
                    />
                    <Text style={styles.voucherStatus}>{voucher.status}</Text>
                    {voucher.usedAt && (
                      <Text style={styles.voucherDate}>
                        {format(new Date(voucher.usedAt), 'MMM dd')}
                      </Text>
                    )}
                  </View>
                ))}
                {subscription.voucherDetails.length > 10 && (
                  <Text style={styles.moreVouchers}>
                    +{subscription.voucherDetails.length - 10} more vouchers
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        ) : null}

        {/* Footer with Actions */}
        {subscription && subscription.status === 'ACTIVE' && onCancel && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Icon name="cancel" size={20} color="#dc2626" />
              <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
  },
  progressTotal: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  voucherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  voucherStatus: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  voucherDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  moreVouchers: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fee2e2',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
});
