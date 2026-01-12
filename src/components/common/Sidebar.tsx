import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, ScreenName } from '../../context/NavigationContext';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  screen: ScreenName;
}

const menuItems: MenuItem[] = [
  { id: '1', label: 'Dashboard', icon: 'dashboard', screen: 'Dashboard' },
  { id: '2', label: 'Orders', icon: 'inventory-2', screen: 'Orders' },
  { id: '3', label: 'Kitchens', icon: 'restaurant', screen: 'Kitchens' },
  { id: '4', label: 'Zones', icon: 'location-on', screen: 'Zones' },
  { id: '5', label: 'Menu Management', icon: 'restaurant-menu', screen: 'MenuManagement' },
  { id: '6', label: 'Subscriptions', icon: 'credit-card', screen: 'Subscriptions' },
  { id: '7', label: 'Users', icon: 'people', screen: 'Users' },
];

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onLogout?: () => void | Promise<void>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  visible,
  onClose,
  onLogout,
}) => {
  const insets = useSafeAreaInsets();
  const { user, logout: authLogout } = useAuth();
  const { currentScreen, navigate } = useNavigation();
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleLogout = async () => {
    onClose();

    // If parent provided onLogout, use it (for App.tsx logout flow)
    // Otherwise fall back to AuthContext logout
    if (onLogout) {
      await onLogout();
    } else {
      await authLogout();
    }
  };

  const handleMenuPress = (screen: ScreenName) => {
    navigate(screen);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        {/* Sidebar */}
        <Animated.View
          style={[
            {
              width: SIDEBAR_WIDTH,
              transform: [{ translateX: slideAnim }],
              paddingTop: insets.top,
            },
          ]}
          className="bg-white h-full shadow-2xl"
        >
          {/* User Profile Section */}
          <View className="bg-orange-500 px-4 py-6">
            <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-3">
              <Icon name="person" size={40} color="rgba(245, 107, 76, 1)" />
            </View>
            <Text className="text-white font-bold text-lg">
              {user?.fullName || 'Admin'}
            </Text>
            <Text className="text-orange-100 text-sm">
              {user?.role === 'ADMIN' || user?.role === 'admin' ? 'Admin' : user?.role || 'Admin'}
            </Text>
          </View>

          {/* Menu Items */}
          <ScrollView className="flex-1">
            <View className="py-2">
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleMenuPress(item.screen)}
                  className={`flex-row items-center px-4 py-4 ${
                    currentScreen === item.screen ? 'bg-orange-50' : ''
                  }`}
                >
                  <Icon
                    name={item.icon}
                    size={24}
                    color="rgba(245, 107, 76, 1)"
                    style={{ marginRight: 16 }}
                  />
                  <Text
                    className={`text-base ${
                      currentScreen === item.screen
                        ? 'text-orange-600 font-semibold'
                        : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Text>
                  {currentScreen === item.screen && (
                    <View className="absolute right-0 w-1 h-8 bg-orange-500 rounded-l-full" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Logout Button */}
          <View className="border-t border-gray-200 p-4" style={{ paddingBottom: insets.bottom + 16 }}>
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center py-3"
            >
              <Icon name="logout" size={24} color="rgba(245, 107, 76, 1)" style={{ marginRight: 16 }} />
              <Text className="text-red-500 font-medium text-base">Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Overlay */}
        <Pressable
          onPress={onClose}
          className="flex-1 bg-black/50"
        />
      </View>
    </Modal>
  );
};
