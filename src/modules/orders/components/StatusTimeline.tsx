import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Vibration} from 'react-native';
import {StatusEntry, OrderStatus} from '../../../types/api.types';
import {format} from 'date-fns';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {isAutoAcceptNote} from '../../../utils/autoAccept';

interface StatusTimelineProps {
  timeline: StatusEntry[];
  currentStatus?: OrderStatus;
  onStatusClick?: (status: OrderStatus) => void;
  allowStatusChange?: boolean;
}

const StatusTimeline: React.FC<StatusTimelineProps> = ({
  timeline,
  currentStatus,
  onStatusClick,
  allowStatusChange = false,
}) => {
  // Define all possible statuses in logical order
  const allPossibleStatuses: OrderStatus[] = [
    'PLACED',
    'ACCEPTED',
    'PREPARING',
    'READY',
    'PICKED_UP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REJECTED',
    'FAILED',
  ];

  // Handle undefined or null timeline
  if (!timeline || !Array.isArray(timeline) || timeline.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No status updates yet</Text>
      </View>
    );
  }

  const sortedTimeline = [...timeline].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const formatTimestamp = (timestamp: string): string => {
    try {
      return format(new Date(timestamp), 'dd MMM yyyy, hh:mm a');
    } catch {
      return timestamp;
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    const colors: Record<OrderStatus, string> = {
      PLACED: '#007AFF',
      SCHEDULED: '#6366f1',
      ACCEPTED: '#00C7BE',
      REJECTED: '#FF3B30',
      PREPARING: '#FFCC00',
      READY: '#FF9500',
      PICKED_UP: '#AF52DE',
      OUT_FOR_DELIVERY: '#5856D6',
      DELIVERED: '#34C759',
      CANCELLED: '#FF3B30',
      FAILED: '#8B0000',
    };
    return colors[status] || '#8E8E93';
  };

  const formatStatusText = (status: OrderStatus): string => {
    const formatted: Record<OrderStatus, string> = {
      PLACED: 'Placed',
      SCHEDULED: 'Scheduled',
      ACCEPTED: 'Accepted',
      PREPARING: 'Preparing',
      READY: 'Ready',
      PICKED_UP: 'Picked Up',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
      REJECTED: 'Rejected',
      FAILED: 'Failed',
    };
    return formatted[status] || status;
  };

  const handleStatusPress = (status: OrderStatus) => {
    if (!allowStatusChange || !onStatusClick) return;

    // Haptic feedback for better UX (optional, won't crash if permission denied)
    try {
      Vibration.vibrate(10);
    } catch (error) {
      // Silently ignore vibration errors (permission issues)
    }

    // Quick change without confirmation for forward progression
    onStatusClick(status);
  };

  const handleQuickAction = (status: OrderStatus) => {
    if (!allowStatusChange || !onStatusClick) return;

    // Haptic feedback for better UX (optional, won't crash if permission denied)
    try {
      Vibration.vibrate(10);
    } catch (error) {
      // Silently ignore vibration errors (permission issues)
    }

    onStatusClick(status);
  };

  // Create a map of occurred statuses for quick lookup
  const occurredStatuses = new Map<OrderStatus, StatusEntry>();
  sortedTimeline.forEach(entry => {
    occurredStatuses.set(entry.status as OrderStatus, entry);
  });

  // Find next logical status
  const getNextStatus = (): OrderStatus | null => {
    const currentIdx = allPossibleStatuses.indexOf(currentStatus || 'PLACED');
    if (currentIdx === -1 || currentIdx === allPossibleStatuses.length - 1) return null;

    // Skip to next non-occurred status
    for (let i = currentIdx + 1; i < allPossibleStatuses.length; i++) {
      const status = allPossibleStatuses[i];
      if (!occurredStatuses.has(status)) {
        return status;
      }
    }
    return null;
  };

  const nextStatus = getNextStatus();

  return (
    <View style={styles.container}>
      {/* Only show section header when in action mode */}
      {allowStatusChange && (
        <>
          {onStatusClick && nextStatus && (
            <TouchableOpacity
              style={styles.quickNextButton}
              onPress={() => handleQuickAction(nextStatus)}
              activeOpacity={0.9}>
              <View style={styles.quickNextContent}>
                <View style={styles.quickNextIconContainer}>
                  <MaterialIcons name="flash-on" size={26} color="#FFFFFF" />
                </View>
                <View style={styles.quickNextTextContainer}>
                  <Text style={styles.quickNextLabel}>⚡ QUICK ACTION</Text>
                  <Text style={styles.quickNextStatus}>{formatStatusText(nextStatus)}</Text>
                </View>
                <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.sectionHeaderContainer}>
            <MaterialIcons name="timeline" size={18} color="#000000" />
            <Text style={styles.sectionHeader}>Order Progress</Text>
          </View>
        </>
      )}

      {allPossibleStatuses
        .filter(status => {
          // In history-only mode, show only occurred statuses
          if (!allowStatusChange) {
            return occurredStatuses.has(status);
          }
          // In action mode, show all statuses
          return true;
        })
        .map((status, index) => {
        const entry = occurredStatuses.get(status);
        const hasOccurred = !!entry;
        const isCurrent = status === currentStatus;
        const isClickable = allowStatusChange && onStatusClick && !hasOccurred;
        const ItemWrapper = isClickable ? TouchableOpacity : View;

        // Get status icon
        const getStatusIcon = (st: OrderStatus): string => {
          const icons: Record<OrderStatus, string> = {
            PLACED: 'receipt',
            SCHEDULED: 'event',
            ACCEPTED: 'check-circle',
            PREPARING: 'restaurant',
            READY: 'done-all',
            PICKED_UP: 'local-shipping',
            OUT_FOR_DELIVERY: 'delivery-dining',
            DELIVERED: 'home',
            CANCELLED: 'close',
            REJECTED: 'cancel',
            FAILED: 'error',
          };
          return icons[st] || 'fiber-manual-record';
        };

        return (
          <ItemWrapper
            key={status}
            style={[
              styles.timelineItem,
              !hasOccurred && styles.timelineItemInactive,
            ]}
            onPress={isClickable ? () => handleStatusPress(status) : undefined}
            activeOpacity={0.7}>
            {/* Icon and Line */}
            <View style={styles.timelineIndicator}>
              <View style={[
                styles.iconContainer,
                {
                  backgroundColor: hasOccurred ? getStatusColor(status) : (isClickable ? '#FFFFFF' : '#F2F2F7'),
                  borderColor: getStatusColor(status),
                },
                isCurrent && styles.iconContainerActive,
                isClickable && styles.iconContainerClickable,
                !hasOccurred && !isClickable && styles.iconContainerInactive,
              ]}>
                <MaterialIcons
                  name={getStatusIcon(status) as any}
                  size={isCurrent ? 16 : hasOccurred || isClickable ? 12 : 10}
                  color={hasOccurred ? '#FFFFFF' : (isClickable ? getStatusColor(status) : '#C7C7CC')}
                />
              </View>
              {index < allPossibleStatuses.length - 1 && <View style={styles.line} />}
            </View>

            {/* Content */}
            <View style={[
              styles.content,
              index === allPossibleStatuses.length - 1 && styles.contentLast,
              isClickable && styles.contentClickable,
              !hasOccurred && !isClickable && styles.contentInactive,
            ]}>
              <View style={styles.statusRow}>
                <View style={styles.statusTitleRow}>
                  <Text style={[
                    styles.statusTitle,
                    hasOccurred && styles.statusTitleOccurred,
                    isCurrent && styles.statusTitleCurrent,
                    isClickable && styles.statusTitleClickable,
                  ]}>
                    {formatStatusText(status)}
                  </Text>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <MaterialIcons name="radio-button-checked" size={12} color="#007AFF" />
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </View>

                {hasOccurred && entry ? (
                  <View style={styles.timestampRow}>
                    <MaterialIcons name="access-time" size={12} color="#8E8E93" />
                    <Text style={styles.timestamp}>
                      {formatTimestamp(entry.timestamp)}
                    </Text>
                  </View>
                ) : (
                  <Text style={[
                    styles.timestampInactive,
                    isClickable && styles.timestampClickable,
                  ]}>
                    {isClickable ? '👆 Tap to set' : '⏳ Pending'}
                  </Text>
                )}
              </View>

              {hasOccurred && entry?.notes && (
                <View
                  style={[
                    styles.notesContainer,
                    isAutoAcceptNote(entry.notes) && styles.autoAcceptNotesContainer,
                  ]}>
                  <MaterialIcons
                    name={isAutoAcceptNote(entry.notes) ? 'verified' : 'note'}
                    size={14}
                    color={isAutoAcceptNote(entry.notes) ? '#10B981' : '#8E8E93'}
                  />
                  <Text
                    style={[
                      styles.notes,
                      isAutoAcceptNote(entry.notes) && styles.autoAcceptNotes,
                    ]}>
                    {entry.notes}
                  </Text>
                </View>
              )}

              {hasOccurred && entry?.updatedBy && (
                <View style={styles.updatedByContainer}>
                  <MaterialIcons name="person" size={14} color="#8E8E93" />
                  <Text style={styles.updatedBy}>{entry.updatedBy}</Text>
                </View>
              )}

              {isClickable && (
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAction(status)}
                  activeOpacity={0.8}>
                  <MaterialIcons name="flash-on" size={14} color="#FFFFFF" />
                  <Text style={styles.quickActionText}>Set {formatStatusText(status)}</Text>
                </TouchableOpacity>
              )}
            </View>
          </ItemWrapper>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  tipBanner: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  tipText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  quickNextButton: {
    backgroundColor: '#34C759',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#34C759',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  quickNextContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  quickNextIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNextTextContainer: {
    flex: 1,
  },
  quickNextLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  quickNextStatus: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  timelineItemInactive: {
    opacity: 0.4,
    transform: [{scale: 0.7}],
    marginBottom: -2,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 10,
    width: 24,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C7C7CC',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
  },
  iconContainerInactive: {
    opacity: 0.5,
    borderWidth: 1,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  iconContainerClickable: {
    borderWidth: 2,
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E5EA',
    marginTop: 3,
    minHeight: 12,
  },
  content: {
    flex: 1,
    paddingBottom: 6,
  },
  contentLast: {
    paddingBottom: 0,
  },
  contentInactive: {
    opacity: 0.5,
    paddingBottom: 1,
  },
  contentClickable: {
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
    marginVertical: 1,
  },
  statusRow: {
    flexDirection: 'column',
    gap: 3,
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93',
  },
  statusTitleOccurred: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 13,
  },
  statusTitleCurrent: {
    color: '#007AFF',
    fontWeight: '800',
    fontSize: 14,
  },
  statusTitleClickable: {
    color: '#007AFF',
    fontWeight: '700',
    fontSize: 13,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timestamp: {
    fontSize: 10,
    color: '#8E8E93',
  },
  timestampInactive: {
    fontSize: 10,
    color: '#C7C7CC',
  },
  timestampClickable: {
    color: '#007AFF',
    fontWeight: '600',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  notes: {
    flex: 1,
    fontSize: 11,
    color: '#3C3C43',
    lineHeight: 14,
  },
  autoAcceptNotesContainer: {
    backgroundColor: '#D1FAE5',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    paddingLeft: 6,
  },
  autoAcceptNotes: {
    color: '#059669',
    fontWeight: '600',
  },
  updatedByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  updatedBy: {
    fontSize: 10,
    color: '#8E8E93',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 0.3,
  },
  clickHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E3F2FD',
  },
  clickHint: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    flex: 1,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 6,
    gap: 4,
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default StatusTimeline;
