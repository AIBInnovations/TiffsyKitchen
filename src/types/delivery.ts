export interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  driverId?: string;
  driverName?: string;
  status: DeliveryStatus;
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  deliveryInstructions?: string;
  estimatedPickupTime?: string;
  actualPickupTime?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  distance?: number; // in km
  deliveryFee: number;
  driverEarnings: number;
  proofOfDelivery?: {
    imageUrl: string;
    signature?: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type DeliveryStatus =
  | 'pending'
  | 'assigned'
  | 'accepted'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface DeliveryStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  inProgressDeliveries: number;
  completedDeliveries: number;
  averageDeliveryTime: number; // in minutes
  onTimeDeliveryRate: number; // percentage
}

export interface DriverEarnings {
  period: string;
  totalEarnings: number;
  deliveriesCount: number;
  averagePerDelivery: number;
  tips: number;
  bonuses: number;
}
