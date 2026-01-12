# Order Status Colors Reference Guide

## Quick Visual Reference

This guide shows all order status colors used in the Tiffsy Kitchen Admin app for consistent UI design.

---

## Status Colors

### 🔵 **PLACED**
- **Color**: Blue
- **Hex**: `#007AFF`
- **Meaning**: Order has been placed by customer, awaiting kitchen action
- **Next Steps**: Accept or Reject

### 🔷 **ACCEPTED**
- **Color**: Cyan/Teal
- **Hex**: `#00C7BE`
- **Meaning**: Kitchen has accepted the order and will prepare it
- **Next Steps**: Start Preparing

### 🟡 **PREPARING**
- **Color**: Yellow
- **Hex**: `#FFCC00`
- **Meaning**: Kitchen is actively preparing the order
- **Next Steps**: Mark as Ready

### 🟠 **READY**
- **Color**: Orange
- **Hex**: `#FF9500`
- **Meaning**: Order is ready for pickup by delivery person
- **Next Steps**: Picked Up

### 🟣 **PICKED_UP**
- **Color**: Purple
- **Hex**: `#AF52DE`
- **Meaning**: Delivery person has picked up the order
- **Next Steps**: Out for Delivery

### 🟣 **OUT_FOR_DELIVERY**
- **Color**: Indigo
- **Hex**: `#5856D6`
- **Meaning**: Order is on the way to customer
- **Next Steps**: Mark as Delivered

### 🟢 **DELIVERED**
- **Color**: Green
- **Hex**: `#34C759`
- **Meaning**: Order successfully delivered to customer
- **Terminal Status**: ✅ Complete

### 🔴 **CANCELLED**
- **Color**: Red
- **Hex**: `#FF3B30`
- **Meaning**: Order was cancelled (by customer, kitchen, or admin)
- **Terminal Status**: ✅ Complete

### 🔴 **REJECTED**
- **Color**: Red
- **Hex**: `#FF3B30`
- **Meaning**: Kitchen rejected the order
- **Terminal Status**: ✅ Complete

### ⚫ **FAILED**
- **Color**: Dark Red
- **Hex**: `#8B0000`
- **Meaning**: Order failed due to payment, delivery, or system issues
- **Terminal Status**: ✅ Complete

---

## Usage in Code

### React Native StyleSheet

```typescript
const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    PLACED: '#007AFF',
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
```

### Usage Example

```typescript
<View style={{backgroundColor: getStatusColor(order.status)}}>
  <Text style={{color: '#FFFFFF'}}>{order.status}</Text>
</View>
```

---

## Status Flow Diagram

### Meal Menu Orders
```
PLACED → ACCEPTED → PREPARING → READY → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
   ↓        ↓           ↓          ↓
REJECTED  CANCELLED  CANCELLED  CANCELLED
```

### On-Demand Orders
```
PLACED → ACCEPTED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED
   ↓        ↓           ↓          ↓
REJECTED  CANCELLED  CANCELLED  CANCELLED
```

---

## Color Accessibility

All colors have been chosen to:
- ✅ Provide sufficient contrast against white backgrounds (WCAG AA compliant)
- ✅ Work well for colorblind users (distinct brightness levels)
- ✅ Match common color associations (red = stop/cancel, green = success)
- ✅ Be distinct from each other when shown together

---

## Design Principles

### Progressive Status Colors
- **Blue → Cyan**: Order received and accepted (cool colors, low urgency)
- **Yellow → Orange**: Active preparation (warm colors, medium urgency)
- **Purple → Indigo**: In transit (distinct from preparation phase)
- **Green**: Success (universal positive indicator)
- **Red**: Issues/Termination (universal warning/stop indicator)

### Visual Hierarchy
1. **Terminal Statuses** (Green/Red): Most visually distinct
2. **Active Statuses** (Yellow/Orange): Attention-grabbing warm colors
3. **Initial Statuses** (Blue/Cyan): Calm, informative colors
4. **Delivery Statuses** (Purple/Indigo): Distinct from kitchen operations

---

## Component Examples

### Status Badge
```typescript
<View style={{
  backgroundColor: getStatusColor(status),
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 12,
}}>
  <Text style={{
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  }}>
    {status}
  </Text>
</View>
```

### Timeline Dot
```typescript
<View style={{
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: getStatusColor(status),
  borderWidth: 2,
  borderColor: getStatusColor(status),
}} />
```

### Status Card Header
```typescript
<View style={{
  backgroundColor: getStatusColor(status),
  padding: 16,
}}>
  <Text style={{
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  }}>
    Order {status}
  </Text>
</View>
```

---

## Testing Colors

To test if colors are properly applied:

1. **Visual Test**: Create orders with each status and verify colors match this guide
2. **Accessibility Test**: Use accessibility scanner to verify contrast ratios
3. **Colorblind Test**: Use colorblind simulator to ensure colors are distinguishable
4. **Dark Mode Test**: If implementing dark mode, adjust colors for better visibility

---

## Notes

- All colors use **uppercase hex codes** for consistency
- Colors are defined in a **centralized function** to avoid duplication
- The same color function is used across all components for consistency
- **CANCELLED** and **REJECTED** share the same red color as they represent similar outcomes
- **PREPARING** uses yellow (not red) to avoid confusion with error states

---

## Updating Colors

If you need to change a status color:

1. Update the `getStatusColor()` function in the component
2. Test the change across all screens that display order statuses
3. Update this reference document
4. Verify accessibility compliance with the new color
5. Update any design files or mockups

---

**Last Updated**: January 2026
**Version**: 1.0
**Components Using This**: StatusTimeline, OrderStatusProgress, OrderCard, OrderDetailScreen
