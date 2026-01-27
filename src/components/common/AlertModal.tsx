import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertConfig {
  type?: AlertType;
  title: string;
  message: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

interface AlertModalProps {
  visible: boolean;
  config: AlertConfig | null;
  onClose: () => void;
}

const getAlertIcon = (type: AlertType): { name: string; color: string; bgColor: string } => {
  switch (type) {
    case 'success':
      return { name: 'check-circle', color: colors.success, bgColor: colors.successLight };
    case 'error':
      return { name: 'error', color: colors.error, bgColor: colors.errorLight };
    case 'warning':
      return { name: 'warning', color: colors.warning, bgColor: colors.warningLight };
    case 'info':
      return { name: 'info', color: colors.info, bgColor: colors.infoLight };
    case 'confirm':
      return { name: 'help-outline', color: colors.primary, bgColor: colors.primaryLight };
    default:
      return { name: 'info', color: colors.info, bgColor: colors.infoLight };
  }
};

export const AlertModal: React.FC<AlertModalProps> = ({ visible, config, onClose }) => {
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!config) return null;

  const { type = 'info', title, message, buttons, onDismiss } = config;
  const icon = getAlertIcon(type);

  const handleClose = () => {
    onDismiss?.();
    onClose();
  };

  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.();
    onClose();
  };

  // Default buttons based on type
  const defaultButtons: AlertButton[] = type === 'confirm'
    ? [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: 'default' },
      ]
    : [{ text: 'OK', style: 'default' }];

  const alertButtons = buttons && buttons.length > 0 ? buttons : defaultButtons;

  const getButtonStyle = (style?: 'default' | 'cancel' | 'destructive', index?: number) => {
    if (style === 'destructive') {
      return 'bg-red-500';
    }
    if (style === 'cancel') {
      return 'bg-gray-200';
    }
    // Default style based on alert type
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      case 'confirm':
        return 'bg-primary';
      default:
        return 'bg-blue-500';
    }
  };

  const getButtonTextStyle = (style?: 'default' | 'cancel' | 'destructive') => {
    if (style === 'cancel') {
      return 'text-gray-700';
    }
    return 'text-white';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-6"
        onPress={handleClose}
      >
        <Animated.View
          style={{
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
            width: '100%',
            maxWidth: 340,
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-2xl overflow-hidden shadow-xl">
              {/* Icon Header */}
              <View className="items-center pt-6 pb-4">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: icon.bgColor }}
                >
                  <Icon name={icon.name} size={36} color={icon.color} />
                </View>
                <Text className="text-xl font-bold text-gray-900 text-center px-6">
                  {title}
                </Text>
              </View>

              {/* Message */}
              <View className="px-6 pb-6">
                <Text className="text-base text-gray-600 text-center leading-6">
                  {message}
                </Text>
              </View>

              {/* Buttons */}
              <View className="border-t border-gray-100 p-4">
                {alertButtons.length === 1 ? (
                  <TouchableOpacity
                    onPress={() => handleButtonPress(alertButtons[0])}
                    className={`py-3.5 rounded-xl ${getButtonStyle(alertButtons[0].style)}`}
                    style={
                      alertButtons[0].style !== 'cancel' && alertButtons[0].style !== 'destructive'
                        ? { backgroundColor: icon.color }
                        : undefined
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      className={`text-center font-semibold text-base ${getButtonTextStyle(alertButtons[0].style)}`}
                    >
                      {alertButtons[0].text}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="flex-row gap-3">
                    {alertButtons.map((button, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleButtonPress(button)}
                        className={`flex-1 py-3.5 rounded-xl ${getButtonStyle(button.style, index)}`}
                        style={
                          button.style !== 'cancel' && button.style !== 'destructive' && index === alertButtons.length - 1
                            ? { backgroundColor: icon.color }
                            : undefined
                        }
                        activeOpacity={0.8}
                      >
                        <Text
                          className={`text-center font-semibold text-base ${getButtonTextStyle(button.style)}`}
                        >
                          {button.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};
