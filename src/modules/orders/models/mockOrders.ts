import {
  Order,
  OrderStatus,
  PaymentStatus,
  DeliveryStatus,
  MealType,
  PackagingType,
  SubscriptionPlan,
  Kitchen,
  DeliveryPartner,
  DeliverySlot,
  UserSummary,
  DeliveryAddress,
  Subscription,
  Voucher,
  OrderItem,
  PricingBreakdown,
  Payment,
  DeliveryAssignment,
  AuditLogEntry,
  CustomerFeedback,
  LinkedTicket,
  Refund,
} from './types';

// Helper functions
const daysAgo = (days: number, hours = 12): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
};

const hoursAgo = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

const generateOrderNumber = (index: number): string => {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return `ORD-${dateStr}-${String(index).padStart(3, '0')}`;
};

// Mock Kitchens
const mockKitchens: Kitchen[] = [
  { id: 'kit-001', name: 'Gurgaon Central Kitchen', city: 'Gurgaon', zone: 'Sector 15-30', address: '123 Industrial Area, Sector 18, Gurgaon' },
  { id: 'kit-002', name: 'Noida Hub Kitchen', city: 'Noida', zone: 'Sector 50-70', address: '456 Food Park, Sector 62, Noida' },
  { id: 'kit-003', name: 'Delhi South Kitchen', city: 'Delhi', zone: 'South Delhi', address: '789 Saket, New Delhi' },
];

// Mock Delivery Partners
const mockDeliveryPartners: DeliveryPartner[] = [
  { id: 'dp-001', name: 'Raju Verma', phone: '+91 98765 11111', vehicleType: 'BIKE', vehicleNumber: 'HR26AB1234', zone: 'Sector 15-30', rating: 4.7, onTimePercentage: 92, totalDeliveries: 520, isOnline: true },
  { id: 'dp-002', name: 'Suresh Yadav', phone: '+91 98765 22222', vehicleType: 'SCOOTER', vehicleNumber: 'UP16CD5678', zone: 'Sector 50-70', rating: 4.5, onTimePercentage: 88, totalDeliveries: 280, isOnline: true },
  { id: 'dp-003', name: 'Amit Kumar', phone: '+91 98765 33333', vehicleType: 'BIKE', vehicleNumber: 'DL4CAF9012', zone: 'South Delhi', rating: 4.8, onTimePercentage: 95, totalDeliveries: 650, isOnline: true },
  { id: 'dp-004', name: 'Vikram Singh', phone: '+91 98765 44444', vehicleType: 'BICYCLE', vehicleNumber: '', zone: 'Sector 15-30', rating: 4.3, onTimePercentage: 85, totalDeliveries: 150, isOnline: false },
];

// Mock Delivery Slots
const lunchSlots: DeliverySlot[] = [
  { id: 'slot-l1', mealType: 'lunch', startTime: '12:00', endTime: '13:00', label: '12:00 PM - 1:00 PM' },
  { id: 'slot-l2', mealType: 'lunch', startTime: '13:00', endTime: '14:00', label: '1:00 PM - 2:00 PM' },
];

const dinnerSlots: DeliverySlot[] = [
  { id: 'slot-d1', mealType: 'dinner', startTime: '19:00', endTime: '20:00', label: '7:00 PM - 8:00 PM' },
  { id: 'slot-d2', mealType: 'dinner', startTime: '20:00', endTime: '21:00', label: '8:00 PM - 9:00 PM' },
];

// Mock Addresses
const mockAddresses: DeliveryAddress[] = [
  { id: 'addr-001', label: 'Home', line1: '123 Main Street', line2: 'Sector 15', city: 'Gurgaon', state: 'Haryana', pincode: '122001', landmark: 'Near Metro Station' },
  { id: 'addr-002', label: 'Office', line1: '456 Business Park', line2: 'Cyber City', city: 'Gurgaon', state: 'Haryana', pincode: '122002', landmark: 'Tower B' },
  { id: 'addr-003', label: 'Home', line1: '789 Green Valley', line2: 'Sector 62', city: 'Noida', state: 'UP', pincode: '201309', landmark: 'Near Park' },
  { id: 'addr-004', label: 'Home', line1: '321 Rose Garden', line2: 'Saket', city: 'Delhi', state: 'Delhi', pincode: '110017', landmark: 'Near Mall' },
  { id: 'addr-005', label: 'Home', line1: '555 Lake View', line2: 'Sector 45', city: 'Noida', state: 'UP', pincode: '201301', landmark: 'Gate 2' },
];

// Mock Customers
const mockCustomers: UserSummary[] = [
  { id: 'cust-001', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul.sharma@email.com', address: mockAddresses[0], dietaryPreferences: ['VEG'], totalOrders: 45, memberSince: daysAgo(90) },
  { id: 'cust-002', name: 'Priya Patel', phone: '+91 98765 43211', email: 'priya.patel@email.com', address: mockAddresses[1], dietaryPreferences: ['VEG', 'JAIN'], totalOrders: 28, memberSince: daysAgo(60) },
  { id: 'cust-003', name: 'Amit Kumar', phone: '+91 98765 43212', email: 'amit.kumar@email.com', address: mockAddresses[2], dietaryPreferences: ['NON_VEG'], totalOrders: 12, memberSince: daysAgo(120) },
  { id: 'cust-004', name: 'Sneha Reddy', phone: '+91 98765 43213', email: 'sneha.reddy@email.com', address: mockAddresses[3], dietaryPreferences: ['VEGAN'], totalOrders: 35, memberSince: daysAgo(80) },
  { id: 'cust-005', name: 'Karan Malhotra', phone: '+91 98765 43214', email: 'karan.malhotra@email.com', address: mockAddresses[4], dietaryPreferences: ['VEG'], totalOrders: 56, memberSince: daysAgo(150) },
  { id: 'cust-006', name: 'Neha Joshi', phone: '+91 98765 43215', email: 'neha.joshi@email.com', address: mockAddresses[0], dietaryPreferences: ['VEG', 'JAIN'], totalOrders: 22, memberSince: daysAgo(45) },
  { id: 'cust-007', name: 'Vikram Singh', phone: '+91 98765 43216', email: 'vikram.singh@email.com', address: mockAddresses[2], dietaryPreferences: ['NON_VEG', 'EGGETARIAN'], totalOrders: 18, memberSince: daysAgo(30) },
];

// Mock Menu Items
const mockDishes = [
  { id: 'dish-001', name: 'Dal Makhani', price: 80, dietaryTags: ['Veg', 'Rich'] },
  { id: 'dish-002', name: 'Paneer Butter Masala', price: 120, dietaryTags: ['Veg', 'Rich'] },
  { id: 'dish-003', name: 'Jeera Rice', price: 60, dietaryTags: ['Veg'] },
  { id: 'dish-004', name: 'Roti (4 pcs)', price: 40, dietaryTags: ['Veg'] },
  { id: 'dish-005', name: 'Mixed Veg Curry', price: 70, dietaryTags: ['Veg', 'Healthy'] },
  { id: 'dish-006', name: 'Chicken Curry', price: 150, dietaryTags: ['Non-Veg'] },
  { id: 'dish-007', name: 'Egg Bhurji', price: 80, dietaryTags: ['Egg'] },
  { id: 'dish-008', name: 'Salad', price: 40, dietaryTags: ['Veg', 'Healthy'] },
  { id: 'dish-009', name: 'Raita', price: 30, dietaryTags: ['Veg'] },
  { id: 'dish-010', name: 'Gulab Jamun (2 pcs)', price: 50, dietaryTags: ['Veg', 'Sweet'] },
];

// Helper to generate order items
const generateOrderItems = (mealType: MealType, isNonVeg: boolean): OrderItem[] => {
  const items: OrderItem[] = [];
  const baseItems = isNonVeg
    ? [mockDishes[5], mockDishes[2], mockDishes[3]]
    : [mockDishes[0], mockDishes[2], mockDishes[3]];

  baseItems.forEach((dish, index) => {
    items.push({
      id: `item-${Date.now()}-${index}`,
      dishId: dish.id,
      dishName: dish.name,
      quantity: 1,
      unitPrice: dish.price,
      subtotal: dish.price,
      mealType,
      dietaryTags: dish.dietaryTags,
      isAddon: false,
    });
  });

  // Add random addon
  if (Math.random() > 0.5) {
    const addon = mockDishes[9];
    items.push({
      id: `item-addon-${Date.now()}`,
      dishId: addon.id,
      dishName: addon.name,
      quantity: 1,
      unitPrice: addon.price,
      subtotal: addon.price,
      mealType,
      dietaryTags: addon.dietaryTags,
      isAddon: true,
    });
  }

  return items;
};

// Helper to generate pricing
const generatePricing = (items: OrderItem[], packagingType: PackagingType, hasDiscount: boolean): PricingBreakdown => {
  const itemsSubtotal = items.filter(i => !i.isAddon).reduce((sum, i) => sum + i.subtotal, 0);
  const addonsTotal = items.filter(i => i.isAddon).reduce((sum, i) => sum + i.subtotal, 0);
  const packagingFee = packagingType === 'STEEL_DABBA' ? 0 : 10;
  const deliveryFee = 0;
  const discount = hasDiscount ? Math.round((itemsSubtotal + addonsTotal) * 0.1) : 0;
  const subtotalAfterDiscount = itemsSubtotal + addonsTotal + packagingFee + deliveryFee - discount;
  const taxRate = 5;
  const tax = Math.round(subtotalAfterDiscount * (taxRate / 100));
  const finalTotal = subtotalAfterDiscount + tax;

  return {
    itemsSubtotal,
    addonsTotal,
    packagingFee,
    deliveryFee,
    discount,
    discountCode: hasDiscount ? 'SAVE10' : undefined,
    tax,
    taxRate,
    finalTotal,
  };
};

// Helper to generate audit log
const generateAuditLog = (orderId: string, status: OrderStatus, createdAt: string): AuditLogEntry[] => {
  const logs: AuditLogEntry[] = [
    {
      id: `log-${orderId}-1`,
      orderId,
      timestamp: createdAt,
      actor: 'CUSTOMER',
      actorName: 'Customer',
      action: 'ORDER_CREATED',
      description: 'Order placed by customer',
    },
    {
      id: `log-${orderId}-2`,
      orderId,
      timestamp: new Date(new Date(createdAt).getTime() + 60000).toISOString(),
      actor: 'SYSTEM',
      action: 'PAYMENT_PROCESSED',
      description: 'Payment processed successfully',
    },
  ];

  if (['PREPARING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'].includes(status)) {
    logs.push({
      id: `log-${orderId}-3`,
      orderId,
      timestamp: new Date(new Date(createdAt).getTime() + 120000).toISOString(),
      actor: 'KITCHEN',
      actorName: 'Kitchen Staff',
      action: 'STATUS_CHANGED',
      description: 'Order moved to Preparing',
      previousValue: 'CONFIRMED',
      newValue: 'PREPARING',
    });
  }

  if (['PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'].includes(status)) {
    logs.push({
      id: `log-${orderId}-4`,
      orderId,
      timestamp: new Date(new Date(createdAt).getTime() + 3600000).toISOString(),
      actor: 'KITCHEN',
      actorName: 'Kitchen Staff',
      action: 'STATUS_CHANGED',
      description: 'Order packed and ready for pickup',
      previousValue: 'PREPARING',
      newValue: 'PACKED',
    });
  }

  if (['OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'].includes(status)) {
    logs.push({
      id: `log-${orderId}-5`,
      orderId,
      timestamp: new Date(new Date(createdAt).getTime() + 4800000).toISOString(),
      actor: 'DELIVERY_PARTNER',
      actorName: 'Raju Verma',
      action: 'STATUS_CHANGED',
      description: 'Order picked up, out for delivery',
      previousValue: 'PACKED',
      newValue: 'OUT_FOR_DELIVERY',
    });
  }

  if (status === 'DELIVERED') {
    logs.push({
      id: `log-${orderId}-6`,
      orderId,
      timestamp: new Date(new Date(createdAt).getTime() + 6000000).toISOString(),
      actor: 'DELIVERY_PARTNER',
      actorName: 'Raju Verma',
      action: 'STATUS_CHANGED',
      description: 'Order delivered successfully',
      previousValue: 'OUT_FOR_DELIVERY',
      newValue: 'DELIVERED',
    });
  }

  if (status === 'FAILED') {
    logs.push({
      id: `log-${orderId}-7`,
      orderId,
      timestamp: new Date(new Date(createdAt).getTime() + 6000000).toISOString(),
      actor: 'DELIVERY_PARTNER',
      actorName: 'Raju Verma',
      action: 'DELIVERY_FAILED',
      description: 'Delivery failed - Customer not reachable',
      previousValue: 'OUT_FOR_DELIVERY',
      newValue: 'FAILED',
    });
  }

  if (status === 'REFUNDED') {
    logs.push({
      id: `log-${orderId}-8`,
      orderId,
      timestamp: new Date(new Date(createdAt).getTime() + 7200000).toISOString(),
      actor: 'ADMIN',
      actorName: 'Admin User',
      action: 'REFUND_INITIATED',
      description: 'Refund initiated due to delivery failure',
    });
  }

  return logs;
};

// Generate status history
const generateStatusHistory = (status: OrderStatus, createdAt: string) => {
  const history = [{ status: 'PENDING' as OrderStatus, timestamp: createdAt }];
  const baseTime = new Date(createdAt).getTime();

  if (['CONFIRMED', 'PREPARING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'REFUNDED'].includes(status)) {
    history.push({ status: 'CONFIRMED', timestamp: new Date(baseTime + 30000).toISOString() });
  }
  if (['PREPARING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'].includes(status)) {
    history.push({ status: 'PREPARING', timestamp: new Date(baseTime + 120000).toISOString() });
  }
  if (['PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'].includes(status)) {
    history.push({ status: 'PACKED', timestamp: new Date(baseTime + 3600000).toISOString() });
  }
  if (['OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'].includes(status)) {
    history.push({ status: 'OUT_FOR_DELIVERY', timestamp: new Date(baseTime + 4800000).toISOString() });
  }
  if (status === 'DELIVERED') {
    history.push({ status: 'DELIVERED', timestamp: new Date(baseTime + 6000000).toISOString() });
  }
  if (status === 'FAILED') {
    history.push({ status: 'FAILED', timestamp: new Date(baseTime + 6000000).toISOString(), note: 'Customer not reachable' });
  }
  if (status === 'REFUNDED') {
    history.push({ status: 'REFUNDED', timestamp: new Date(baseTime + 7200000).toISOString() });
  }

  return history;
};

// Generate mock orders
const createOrder = (
  index: number,
  status: OrderStatus,
  mealType: MealType,
  plan: SubscriptionPlan,
  packagingType: PackagingType,
  customer: UserSummary,
  kitchen: Kitchen,
  daysAgoCreated: number,
  hoursOffset: number = 0
): Order => {
  const orderId = `order-${String(index).padStart(3, '0')}`;
  const orderNumber = generateOrderNumber(index);
  const createdAt = daysAgo(daysAgoCreated, mealType === 'lunch' ? 10 + hoursOffset : 17 + hoursOffset);
  const isNonVeg = customer.dietaryPreferences.includes('NON_VEG');
  const items = generateOrderItems(mealType, isNonVeg);
  const hasDiscount = Math.random() > 0.7;
  const pricing = generatePricing(items, packagingType, hasDiscount);
  const deliverySlot = mealType === 'lunch' ? lunchSlots[0] : dinnerSlots[0];
  const deliveryPartner = mockDeliveryPartners[index % mockDeliveryPartners.length];

  const planDisplayNames: Record<SubscriptionPlan, string> = {
    BASIC_SAVER: 'Basic Saver',
    BALANCED_DAILY: 'Balanced Daily',
    PREMIUM_COMBO: 'Premium Combo',
  };

  const subscription: Subscription = {
    id: `sub-${customer.id}`,
    planName: plan,
    planDisplayName: planDisplayNames[plan],
    startDate: daysAgo(30),
    endDate: daysAgo(-30),
    totalVouchers: 30,
    usedVouchers: 12 + index,
    remainingVouchers: 30 - (12 + index),
    mealType: 'both',
    status: 'ACTIVE',
  };

  const voucher: Voucher = {
    id: `voucher-${orderId}`,
    subscriptionId: subscription.id,
    sequenceNumber: subscription.usedVouchers,
    redeemedAt: createdAt,
    status: 'REDEEMED',
    ruleExplanation: 'Order placed before cut-off time, voucher redeemed automatically.',
  };

  const payment: Payment = {
    id: `pay-${orderId}`,
    orderId,
    amount: pricing.finalTotal,
    status: status === 'REFUNDED' ? 'REFUNDED' : 'PAID',
    method: ['UPI', 'CARD', 'WALLET'][index % 3] as Payment['method'],
    transactionRef: `TXN${Date.now()}${index}`,
    paidAt: createdAt,
  };

  let refund: Refund | undefined;
  if (status === 'REFUNDED') {
    refund = {
      id: `refund-${orderId}`,
      orderId,
      paymentId: payment.id,
      amount: pricing.finalTotal,
      reason: 'DELIVERY_FAILURE',
      reasonText: 'Customer not reachable after multiple attempts',
      refundRef: `REF${Date.now()}${index}`,
      processedAt: new Date(new Date(createdAt).getTime() + 7200000).toISOString(),
      processedBy: 'Admin User',
    };
  }

  let deliveryAssignment: DeliveryAssignment | undefined;
  if (['PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'].includes(status)) {
    deliveryAssignment = {
      id: `delivery-${orderId}`,
      orderId,
      partnerId: deliveryPartner.id,
      partner: deliveryPartner,
      status: status === 'DELIVERED' ? 'DELIVERED' : status === 'FAILED' ? 'FAILED' : 'IN_TRANSIT',
      assignedAt: new Date(new Date(createdAt).getTime() + 3600000).toISOString(),
      pickedUpAt: new Date(new Date(createdAt).getTime() + 4800000).toISOString(),
      deliveredAt: status === 'DELIVERED' ? new Date(new Date(createdAt).getTime() + 6000000).toISOString() : undefined,
      failedAt: status === 'FAILED' ? new Date(new Date(createdAt).getTime() + 6000000).toISOString() : undefined,
      failureReason: status === 'FAILED' ? 'Customer not reachable' : undefined,
      deliveryInstructions: ['Leave at door', 'Do not ring bell'],
      estimatedDeliveryTime: deliverySlot.startTime,
    };
  }

  let feedback: CustomerFeedback | undefined;
  if (status === 'DELIVERED' && Math.random() > 0.4) {
    feedback = {
      id: `feedback-${orderId}`,
      orderId,
      rating: Math.floor(Math.random() * 2) + 4,
      tags: ['Tasty', 'On time', 'Good packaging'].slice(0, Math.floor(Math.random() * 3) + 1),
      comment: Math.random() > 0.5 ? 'Great food, loved the taste!' : undefined,
      createdAt: new Date(new Date(createdAt).getTime() + 7200000).toISOString(),
    };
  }

  const linkedTickets: LinkedTicket[] = [];
  if (status === 'FAILED' && Math.random() > 0.5) {
    linkedTickets.push({
      id: `ticket-${orderId}`,
      ticketNumber: `TKT-${Date.now()}`,
      title: 'Delivery issue reported',
      status: 'OPEN',
      createdAt: new Date(new Date(createdAt).getTime() + 7200000).toISOString(),
    });
  }

  return {
    id: orderId,
    orderNumber,
    createdAt,
    updatedAt: new Date().toISOString(),
    status,
    statusHistory: generateStatusHistory(status, createdAt),
    customer,
    mealType,
    items,
    packagingType,
    pricing,
    subscription,
    voucher,
    payment,
    refund,
    deliverySlot,
    deliveryAssignment,
    deliveryAddress: customer.address,
    kitchen,
    feedback,
    linkedTickets,
    auditLog: generateAuditLog(orderId, status, createdAt),
    failureReason: status === 'FAILED' ? 'Customer not reachable after multiple delivery attempts' : undefined,
    failureBanner: status === 'FAILED' ? 'Delivery failed due to customer being unreachable. Voucher restored.' : undefined,
  };
};

// Generate 28 diverse orders
export const mockOrders: Order[] = [
  // Today's orders
  createOrder(1, 'PREPARING', 'lunch', 'BALANCED_DAILY', 'DISPOSABLE', mockCustomers[0], mockKitchens[0], 0, 0),
  createOrder(2, 'PREPARING', 'lunch', 'PREMIUM_COMBO', 'STEEL_DABBA', mockCustomers[1], mockKitchens[0], 0, 0),
  createOrder(3, 'PACKED', 'lunch', 'BASIC_SAVER', 'DISPOSABLE', mockCustomers[2], mockKitchens[1], 0, 0),
  createOrder(4, 'OUT_FOR_DELIVERY', 'lunch', 'BALANCED_DAILY', 'STEEL_DABBA', mockCustomers[3], mockKitchens[2], 0, 0),
  createOrder(5, 'PENDING', 'dinner', 'PREMIUM_COMBO', 'DISPOSABLE', mockCustomers[4], mockKitchens[0], 0, 0),
  createOrder(6, 'CONFIRMED', 'dinner', 'BASIC_SAVER', 'STEEL_DABBA', mockCustomers[5], mockKitchens[1], 0, 0),

  // Yesterday's orders
  createOrder(7, 'DELIVERED', 'lunch', 'BALANCED_DAILY', 'DISPOSABLE', mockCustomers[0], mockKitchens[0], 1, 0),
  createOrder(8, 'DELIVERED', 'lunch', 'PREMIUM_COMBO', 'STEEL_DABBA', mockCustomers[1], mockKitchens[0], 1, 1),
  createOrder(9, 'DELIVERED', 'dinner', 'BASIC_SAVER', 'DISPOSABLE', mockCustomers[2], mockKitchens[1], 1, 0),
  createOrder(10, 'FAILED', 'dinner', 'BALANCED_DAILY', 'STEEL_DABBA', mockCustomers[3], mockKitchens[2], 1, 1),
  createOrder(11, 'DELIVERED', 'lunch', 'PREMIUM_COMBO', 'DISPOSABLE', mockCustomers[4], mockKitchens[0], 1, 2),

  // 2 days ago
  createOrder(12, 'DELIVERED', 'lunch', 'BASIC_SAVER', 'STEEL_DABBA', mockCustomers[5], mockKitchens[1], 2, 0),
  createOrder(13, 'DELIVERED', 'dinner', 'BALANCED_DAILY', 'DISPOSABLE', mockCustomers[6], mockKitchens[2], 2, 0),
  createOrder(14, 'REFUNDED', 'lunch', 'PREMIUM_COMBO', 'STEEL_DABBA', mockCustomers[0], mockKitchens[0], 2, 1),
  createOrder(15, 'DELIVERED', 'dinner', 'BASIC_SAVER', 'DISPOSABLE', mockCustomers[1], mockKitchens[1], 2, 1),

  // 3 days ago
  createOrder(16, 'DELIVERED', 'lunch', 'BALANCED_DAILY', 'STEEL_DABBA', mockCustomers[2], mockKitchens[0], 3, 0),
  createOrder(17, 'DELIVERED', 'lunch', 'PREMIUM_COMBO', 'DISPOSABLE', mockCustomers[3], mockKitchens[1], 3, 1),
  createOrder(18, 'DELIVERED', 'dinner', 'BASIC_SAVER', 'STEEL_DABBA', mockCustomers[4], mockKitchens[2], 3, 0),

  // 4 days ago
  createOrder(19, 'DELIVERED', 'lunch', 'BALANCED_DAILY', 'DISPOSABLE', mockCustomers[5], mockKitchens[0], 4, 0),
  createOrder(20, 'FAILED', 'dinner', 'PREMIUM_COMBO', 'STEEL_DABBA', mockCustomers[6], mockKitchens[1], 4, 0),
  createOrder(21, 'DELIVERED', 'lunch', 'BASIC_SAVER', 'DISPOSABLE', mockCustomers[0], mockKitchens[2], 4, 1),

  // 5 days ago
  createOrder(22, 'DELIVERED', 'dinner', 'BALANCED_DAILY', 'STEEL_DABBA', mockCustomers[1], mockKitchens[0], 5, 0),
  createOrder(23, 'DELIVERED', 'lunch', 'PREMIUM_COMBO', 'DISPOSABLE', mockCustomers[2], mockKitchens[1], 5, 0),

  // 6 days ago
  createOrder(24, 'DELIVERED', 'lunch', 'BASIC_SAVER', 'STEEL_DABBA', mockCustomers[3], mockKitchens[2], 6, 0),
  createOrder(25, 'DELIVERED', 'dinner', 'BALANCED_DAILY', 'DISPOSABLE', mockCustomers[4], mockKitchens[0], 6, 0),
  createOrder(26, 'REFUNDED', 'lunch', 'PREMIUM_COMBO', 'STEEL_DABBA', mockCustomers[5], mockKitchens[1], 6, 1),

  // 7 days ago
  createOrder(27, 'DELIVERED', 'lunch', 'BASIC_SAVER', 'DISPOSABLE', mockCustomers[6], mockKitchens[2], 7, 0),
  createOrder(28, 'DELIVERED', 'dinner', 'BALANCED_DAILY', 'STEEL_DABBA', mockCustomers[0], mockKitchens[0], 7, 0),
];

// Available cities
export const availableCities = ['Gurgaon', 'Noida', 'Delhi'];

// Available kitchens
export const availableKitchens = mockKitchens;

// Available zones
export const availableZones = ['Sector 15-30', 'Sector 50-70', 'South Delhi'];
