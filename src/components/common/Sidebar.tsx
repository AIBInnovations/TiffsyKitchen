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
  { id: '3', label: 'Zones', icon: 'location-on', screen: 'Zones' },
  { id: '4', label: 'Users', icon: 'people', screen: 'Users' },
  { id: '5', label: 'Subscriptions', icon: 'credit-card', screen: 'Subscriptions' },
  { id: '6', label: 'Kitchen Approvals', icon: 'check-circle', screen: 'KitchenApprovals' },
  { id: '7', label: 'Kitchens', icon: 'restaurant', screen: 'Kitchens' },
  { id: '8', label: 'Menu Management', icon: 'restaurant-menu', screen: 'MenuManagement' },
  { id: '9', label: 'Batch Management', icon: 'local-shipping', screen: 'BatchManagement' },
  { id: '10', label: 'Driver Approvals', icon: 'verified-user', screen: 'DriverApprovals' },
  { id: '11', label: 'Driver Profile Management', icon: 'local-shipping', screen: 'DriverProfileManagement' },
  { id: '12', label: 'Drivers Order Management', icon: 'assignment', screen: 'DriverOrdersBatches' },
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
          <View className="bg-[#F56B4C] px-4 py-5">
            <Text className="text-white font-bold text-lg">
              {user?.fullName || 'Admin'}
            </Text>
            <Text className="text-orange-50 text-sm opacity-90">
              {user?.role === 'ADMIN' || user?.role === 'admin' ? 'Admin' : user?.role || 'Admin'}
            </Text>
          </View>

          {/* Menu Items */}
          <ScrollView className="flex-1">
            <View className="py-1">
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleMenuPress(item.screen)}
                  className={`flex-row items-center px-4 py-3 ${currentScreen === item.screen ? 'bg-[#FFF7F5]' : ''
                    }`}
                >
                  <Icon
                    name={item.icon}
                    size={24}
                    color="#F56B4C"
                    style={{ marginRight: 14 }}
                  />
                  <Text
                    className={`text-base ${currentScreen === item.screen
                      ? 'text-[#F56B4C] font-semibold'
                      : 'text-gray-700'
                      }`}
                  >
                    {item.label}
                  </Text>
                  {currentScreen === item.screen && (
                    <View className="absolute right-0 w-1 h-8 bg-[#F56B4C] rounded-l-full" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Logout Button */}
          <View className="border-t border-gray-200 px-4 py-3" style={{ paddingBottom: insets.bottom + 14 }}>
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center py-2"
            >
              <Icon name="logout" size={24} color="#F56B4C" style={{ marginRight: 16 }} />
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
