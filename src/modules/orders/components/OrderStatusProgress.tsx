import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Vibration} from 'react-native';
import {OrderStatus} from '../../../types/api.types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface OrderStatusProgressProps {
  currentStatus: OrderStatus;
  orderType: 'MEAL_MENU' | 'ON_DEMAND_MENU';
  onStatusChange?: (newStatus: OrderStatus) => void;
  disabled?: boolean;
}

// Define the order flow with icons and labels
const ORDER_FLOW = {
  MEAL_MENU: [
    {status: 'PLACED', label: 'Placed', icon: 'receipt'},
    {status: 'ACCEPTED', label: 'Accepted', icon: 'check-circle'},
    {status: 'PREPARING', label: 'Preparing', icon: 'restaurant'},
    {status: 'READY', label: 'Ready', icon: 'done-all'},
    {status: 'PICKED_UP', label: 'Picked Up', icon: 'local-shipping'},
    {status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: 'delivery-dining'},
    {status: 'DELIVERED', label: 'Delivered', icon: 'home'},
  ],
  ON_DEMAND_MENU: [
    {status: 'PLACED', label: 'Placed', icon: 'receipt'},
    {status: 'ACCEPTED', label: 'Accepted', icon: 'check-circle'},
    {status: 'PREPARING', label: 'Preparing', icon: 'restaurant'},
    {status: 'READY', label: 'Ready', icon: 'done-all'},
    {status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: 'delivery-dining'},
    {status: 'DELIVERED', label: 'Delivered', icon: 'home'},
  ],
};

const TERMINAL_STATUSES = [
  {status: 'REJECTED', label: 'Rejected', icon: 'cancel', color: '#FF3B30'},
  {status: 'CANCELLED', label: 'Cancelled', icon: 'close', color: '#FF3B30'},
  {status: 'FAILED', label: 'Failed', icon: 'error', color: '#8B0000'},
];

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

const OrderStatusProgress: React.FC<OrderStatusProgressProps> = ({
  currentStatus,
  orderType,
  onStatusChange,
  disabled = false,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Check if current status is a terminal status
  const isTerminalStatus = TERMINAL_STATUSES.some(ts => ts.status === currentStatus);

  // Get the appropriate flow
  const flow = ORDER_FLOW[orderType] || ORDER_FLOW.ON_DEMAND_MENU;

  // Find current status index
  const currentIndex = flow.findIndex(step => step.status === currentStatus);

  // Auto-scroll to current status on mount
  useEffect(() => {
    if (scrollViewRef.current && currentIndex >= 0) {
      const scrollToX = Math.max(0, (currentIndex * 88) - 100); // 88 = step width + margins, offset by 100 to center
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({x: scrollToX, animated: true});
      }, 300);
    }
  }, [currentIndex]);

  // Handle status click - instant change for quick workflow
  const handleStatusClick = (status: OrderStatus, index: number) => {
    if (disabled || !onStatusChange) return;

    // Can only move forward or stay at current status
    if (index < currentIndex) {
      return; // Silently ignore - completed steps aren't clickable anyway
    }

    // If clicking current status, do nothing
    if (index === currentIndex) {
      return;
    }

    // Haptic feedback for better UX (optional, won't crash if permission denied)
    try {
      Vibration.vibrate(10);
    } catch (error) {
      // Silently ignore vibration errors (permission issues)
    }

    // Quick change - no confirmation needed
    onStatusChange(status);
  };

  if (isTerminalStatus) {
    // Show terminal status prominently
    const terminalStatus = TERMINAL_STATUSES.find(ts => ts.status === currentStatus);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Order Status</Text>
          <View style={[styles.statusChip, {backgroundColor: terminalStatus?.color || '#FF3B30'}]}>
            <MaterialIcons name={terminalStatus?.icon as any || 'error'} size={14} color="#FFFFFF" />
            <Text style={styles.statusChipText}>{terminalStatus?.label || currentStatus}</Text>
          </View>
        </View>

        <View style={styles.terminalStatusContainer}>
          <View style={[styles.terminalIconContainer, {backgroundColor: terminalStatus?.color || '#FF3B30'}]}>
            <MaterialIcons name={terminalStatus?.icon as any || 'error'} size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.terminalStatusText}>{terminalStatus?.label || currentStatus}</Text>
          <Text style={styles.terminalStatusDescription}>
            {currentStatus === 'REJECTED' && 'This order has been rejected and will not be processed.'}
            {currentStatus === 'CANCELLED' && 'This order has been cancelled.'}
            {currentStatus === 'FAILED' && 'This order has failed and requires attention.'}
          </Text>
        </View>
      </View>
    );
  }

  // Get next step
  const nextStepIndex = currentIndex + 1;
  const hasNextStep = nextStepIndex < flow.length;
  const nextStep = hasNextStep ? flow[nextStepIndex] : null;

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Status</Text>
        <View style={[styles.statusChip, {backgroundColor: getStatusColor(currentStatus)}]}>
          {disabled && <MaterialIcons name="sync" size={12} color="#FFFFFF" style={styles.loadingIcon} />}
          <Text style={styles.statusChipText}>{currentStatus}</Text>
        </View>
      </View>

      {/* Quick Next Button */}
      {!disabled && onStatusChange && nextStep && (
        <TouchableOpacity
          style={styles.quickNextStep}
          onPress={() => handleStatusClick(nextStep.status as OrderStatus, nextStepIndex)}
          activeOpacity={0.85}>
          <MaterialIcons name="flash-on" size={22} color="#FFFFFF" />
          <Text style={styles.quickNextStepText}>Quick: {nextStep.label}</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Progress Steps */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.progressContainer}>
        {flow.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isPending = index > currentIndex;
          const isClickable = !disabled && onStatusChange && isPending;

          const StepWrapper = isClickable ? TouchableOpacity : View;

          return (
            <React.Fragment key={step.status}>
              {/* Step */}
              <StepWrapper
                style={[
                  styles.stepContainer,
                  isClickable && styles.stepContainerClickable,
                ]}
                onPress={isClickable ? () => handleStatusClick(step.status as OrderStatus, index) : undefined}
                activeOpacity={0.8}>
                {/* Icon Circle */}
                <View
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isActive && {
                      backgroundColor: getStatusColor(currentStatus),
                      borderColor: getStatusColor(currentStatus),
                    },
                    isPending && styles.stepCirclePending,
                    isClickable && styles.stepCircleClickable,
                  ]}>
                  {isCompleted && (
                    <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  )}
                  {isActive && (
                    <MaterialIcons name={step.icon as any} size={18} color="#FFFFFF" />
                  )}
                  {isPending && (
                    <MaterialIcons name={step.icon as any} size={isClickable ? 18 : 16} color={isClickable ? "#007AFF" : "#C7C7CC"} />
                  )}
                </View>

                {/* Label */}
                <Text
                  style={[
                    styles.stepLabel,
                    isActive && styles.stepLabelActive,
                    isPending && styles.stepLabelPending,
                    isClickable && styles.stepLabelClickable,
                  ]}>
                  {step.label}
                </Text>

                {/* Tap Indicator for Clickable */}
                {isClickable && (
                  <View style={styles.tapIndicator}>
                    <MaterialIcons name="touch-app" size={12} color="#007AFF" />
                  </View>
                )}
              </StepWrapper>

              {/* Connector Line */}
              {index < flow.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    isCompleted && styles.connectorCompleted,
                    isActive && {backgroundColor: getStatusColor(currentStatus)},
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>

      {/* Current Status Info */}
      <View style={styles.currentStatusInfo}>
        <View style={styles.currentStatusIconContainer}>
          <MaterialIcons
            name="info-outline"
            size={20}
            color={getStatusColor(currentStatus)}
          />
        </View>
        <View style={styles.currentStatusTextContainer}>
          <Text style={styles.currentStatusTitle}>Current Status: {currentStatus}</Text>
          <Text style={styles.currentStatusDescription}>
            {getStatusDescription(currentStatus)}
          </Text>
        </View>
      </View>

      {/* Quick Tip for Admins */}
      {!disabled && onStatusChange && currentIndex < flow.length - 1 && (
        <View style={styles.tipContainer}>
          <MaterialIcons name="lightbulb-outline" size={16} color="#007AFF" />
          <Text style={styles.tipText}>
            💡 Tap any future step or use Quick Action for instant updates
          </Text>
        </View>
      )}
    </View>
  );
};

const getStatusDescription = (status: OrderStatus): string => {
  const descriptions: Record<OrderStatus, string> = {
    PLACED: 'Order has been placed and is awaiting acceptance from the kitchen.',
    SCHEDULED: 'Order is scheduled for a future date and will be placed automatically.',
    ACCEPTED: 'Kitchen has accepted the order and will begin preparation.',
    REJECTED: 'Order has been rejected by the kitchen.',
    PREPARING: 'Kitchen is currently preparing your order.',
    READY: 'Order is ready and awaiting pickup by delivery person.',
    PICKED_UP: 'Order has been picked up by the delivery person.',
    OUT_FOR_DELIVERY: 'Order is on its way to the customer.',
    DELIVERED: 'Order has been successfully delivered to the customer.',
    CANCELLED: 'Order has been cancelled.',
    FAILED: 'Order has failed and requires attention.',
  };
  return descriptions[status] || 'Status information not available.';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  loadingIcon: {
    marginRight: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  stepContainer: {
    alignItems: 'center',
    width: 80,
    marginHorizontal: 4,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  stepCirclePending: {
    backgroundColor: '#F2F2F7',
    borderColor: '#E5E5EA',
  },
  stepCircleClickable: {
    borderColor: '#007AFF',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 14,
  },
  stepLabelActive: {
    color: '#000000',
    fontWeight: '700',
  },
  stepLabelPending: {
    color: '#8E8E93',
    fontWeight: '500',
  },
  stepLabelClickable: {
    color: '#007AFF',
    fontWeight: '600',
  },
  connector: {
    height: 2,
    width: 30,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 4,
    marginBottom: 28,
  },
  connectorCompleted: {
    backgroundColor: '#34C759',
  },
  currentStatusInfo: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  currentStatusIconContainer: {
    marginTop: 2,
  },
  currentStatusTextContainer: {
    flex: 1,
  },
  currentStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  currentStatusDescription: {
    fontSize: 13,
    color: '#5C5C5C',
    lineHeight: 18,
  },
  quickNextStep: {
    backgroundColor: '#34C759',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 10,
    shadowColor: '#34C759',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  quickNextStepText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  stepContainerClickable: {
    transform: [{scale: 1.05}],
  },
  tapIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 3,
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#007AFF',
    lineHeight: 16,
    fontWeight: '500',
  },
  terminalStatusContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  terminalIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  terminalStatusText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  terminalStatusDescription: {
    fontSize: 14,
    color: '#5C5C5C',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default OrderStatusProgress;
