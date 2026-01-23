import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Order } from '../../../types/api.types';
import { getAutoAcceptBadgeInfo } from '../../../utils/autoAccept';

interface AutoAcceptBadgeProps {
  order: Order;
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

const AutoAcceptBadge: React.FC<AutoAcceptBadgeProps> = ({
  order,
  size = 'small',
  showLabel = true,
}) => {
  const badgeInfo = getAutoAcceptBadgeInfo(order);

  // Don't render anything for manual orders
  if (!badgeInfo) {
    return null;
  }

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: `${badgeInfo.color}15` }, // 15 = 8% opacity
        isSmall && styles.containerSmall,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: badgeInfo.color },
          isSmall && styles.iconContainerSmall,
        ]}
      >
        <Icon
          name={badgeInfo.icon}
          size={isSmall ? 10 : 12}
          color="#FFFFFF"
        />
      </View>
      {showLabel && (
        <Text
          style={[
            styles.label,
            { color: badgeInfo.color },
            isSmall && styles.labelSmall,
          ]}
        >
          {badgeInfo.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  containerSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  iconContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default AutoAcceptBadge;
