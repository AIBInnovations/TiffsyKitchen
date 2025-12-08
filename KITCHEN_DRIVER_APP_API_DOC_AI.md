# Kitchen Staff & Driver App - API Reference (AI-Optimized)

App Type: Unified app for Kitchen Staff and Drivers. Auth: Phone OTP via Firebase (backend-only registration). Business: Tiffin meal delivery with subscription plans.

## Business Rules

**Order Cutoffs**: Lunch cutoff is 11:00 AM, Dinner cutoff is 9:00 PM. After cutoff, orders apply to next day.

**Subscription Plans**: 7-day plan has 14 vouchers, 14-day plan has 28 vouchers, 30-day plan has 60 vouchers. All plans provide 2 vouchers per day (lunch + dinner). All vouchers expire 3 months from purchase date.

**Voucher Rules**: 1 voucher = 1 meal. Unused vouchers can be saved until expiry. Vouchers cannot be used for addons (addons require separate payment).

## User Roles

**Kitchen Staff Permissions**: view_orders, update_order_status, manage_menu_items, manage_addons, view_subscriptions, view_voucher_usage, manage_daily_menu, view_analytics, assign_driver.

**Driver Permissions**: view_assigned_deliveries, update_delivery_status, view_customer_details, view_delivery_route, mark_delivered, contact_customer.

## Authentication Flow

On app launch, check Firebase auth state. If not logged in, show LoginScreen for phone input, send OTP via Firebase, verify on OTP screen. If logged in, call GET /api/auth/staff/profile. Based on role (KITCHEN_STAFF or DRIVER), route to appropriate dashboard.

**Auth Errors**: STAFF_NOT_FOUND shows "Contact admin for registration". STAFF_INACTIVE shows "Account suspended". INVALID_OTP allows retry (max 3 attempts).

## Navigation Structure

**AuthStack** (unauthenticated): LoginScreen, OTPVerificationScreen.

**KitchenStack** (KITCHEN_STAFF role) uses DrawerNavigator with: Dashboard (default), Orders, Menu Management, Subscriptions, Users, Deliveries, Analytics, Settings. Modal screens: OrderDetailModal, AddMenuItemModal, EditMenuItemModal, AddAddonModal, AssignDriverModal, UserDetailModal.

**DriverStack** (DRIVER role) uses TabNavigator with: Deliveries (default), Earnings, Profile. Modal screens: DeliveryDetailModal, CustomerContactModal, DeliveryCompleteModal.

## Folder Structure

screens/auth/: LoginScreen.tsx, OTPVerificationScreen.tsx.
screens/kitchen/: DashboardScreen, OrdersScreen, OrderDetailScreen, MenuManagementScreen, AddonsScreen, SubscriptionsScreen, UsersScreen, UserDetailScreen, DeliveriesScreen, AnalyticsScreen, SettingsScreen.
screens/driver/: DeliveriesScreen, DeliveryDetailScreen, EarningsScreen, ProfileScreen.
components/common/: Button, Input, Card, Badge, Avatar, LoadingSpinner.
components/kitchen/: OrderCard, MenuItemCard, AddonCard, UserCard, StatsCard, DeliveryCard.
components/driver/: DeliveryCard, RouteMap, EarningsCard.
components/modals/: OrderDetailModal, AddMenuItemModal, EditMenuItemModal, AddAddonModal, AssignDriverModal, ConfirmationModal, DeliveryCompleteModal.
context/: AuthContext, OrderContext, NotificationContext.
services/: api.service, auth.service, order.service, menu.service, delivery.service, notification.service.
hooks/: useOrders, useDeliveries, useRealtime, useNotifications.
types/: navigation, order, menu, user, delivery.
utils/: dateUtils, formatters, validators.

## Kitchen Staff Screens

**Dashboard (/kitchen/dashboard)**: Shows StatsCards (today_orders_count, pending_orders, active_deliveries, revenue_today), QuickActions (view_pending_orders, manage_menu, view_deliveries), RecentOrders (5 most recent with quick status update), MealSlotIndicator (current slot, cutoff countdown, orders for slot). Features: real-time order updates, pull to refresh, auto-refresh every 30s.

**Orders (/kitchen/orders)**: Tabs: Pending, Preparing, Ready, Out for Delivery, Delivered, Cancelled. Filters: meal_type, date_range, order_type, payment_status. OrderCard shows: order_id, customer_name, items_summary, total_amount, order_time, delivery_address_preview, status_badge, voucher_indicator. Actions: view_details, update_status, assign_driver, print_order, cancel_order. Bulk actions: mark_multiple_preparing, mark_multiple_ready, assign_driver_bulk.

**Order Detail Modal**: Sections include OrderHeader (order_id, status, created_at, meal_type), CustomerInfo (name, phone with tap-to-call, delivery_address, special_instructions), OrderItems (main items with voucher indicator, addons with price, quantities), PaymentInfo (subtotal, tax, discount, vouchers_used, addon_charges, total, payment_method, payment_status), DeliveryInfo (assigned_driver, estimated_time, delivery_otp), StatusTimeline (all status timestamps). Actions: update_status_dropdown, assign_driver_button, cancel_order_button, print_button, contact_customer_button.

**Menu Management (/kitchen/menu)**: Tabs: Main Items, Addons. Main items show image, name, description, price, availability_toggle, meal_type_tags, food_type. Actions: add_item, edit_item, toggle_availability, delete_item. Filters: meal_type, food_type, availability. Addons show image, name, price, availability_toggle, compatible_items. Actions: add_addon, edit_addon, toggle_availability, delete_addon.

**Add/Edit Menu Item Modal**: Fields: image (required, max 5MB), name (required, max 100), description (required, max 500), price (required, >0), meal_type (multiselect, at least 1), food_type (VEG/NON_VEG/VEGAN), is_jain_friendly, spice_level (LOW/MEDIUM/HIGH), is_available (default true), preparation_time_mins.

**Add/Edit Addon Modal**: Fields: image (required), name (required), description, price (required, >0), is_available, compatible_meals (all or specific).

**Subscriptions (/kitchen/subscriptions)**: Tabs: Active, Expiring Soon (<7 days), Expired. Card shows: customer_name, phone, plan_type, purchase_date, expiry_date, vouchers_remaining, vouchers_used, auto_order_status, status_badge. Filters: plan_type, status, expiry_range. Details modal shows: customer_info, plan_details, voucher_usage_history, upcoming_scheduled_meals, dietary_preferences.

**Users (/kitchen/users)**: Tabs: Customers, Drivers. Customer list searchable by name/phone/email with filters for has_active_subscription, dietary_preference, registration_date. Customer card shows name, phone, subscription_status, total_orders, last_order_date. Driver card shows name, phone, status (online/offline/on_delivery), active_deliveries_count, today_completed, rating. Actions: view_customer_details, view_driver_details, toggle_driver_status.

**User Detail**: Customer detail shows profile_info, subscription_info, address_list, order_history (paginated), voucher_history. Driver detail shows profile_info, status_toggle, today_stats (deliveries_completed, earnings, average_delivery_time), delivery_history, ratings_breakdown.

**Deliveries (/kitchen/deliveries)**: Tabs: Unassigned, In Progress, Completed. Card shows order_id, customer_name, address_preview, meal_type, driver_name (if assigned), estimated_time, status. Actions: assign_driver, view_details, contact_driver, contact_customer. Map view toggle shows all active deliveries and real-time driver locations.

**Assign Driver Modal**: Shows order_summary and available_drivers_list (driver_name, current_status, distance_from_kitchen, active_deliveries_count, rating). Has auto_assign_button (nearest available).

**Analytics (/kitchen/analytics)**: Date range selector: today, this_week, this_month, custom_range. Stats cards: total_orders, total_revenue, average_order_value, vouchers_redeemed, addon_revenue, new_subscriptions. Charts: orders_by_meal_type, daily_orders_trend, revenue_trend, popular_items, popular_addons, peak_order_times. Data tables: top_customers, subscription_breakdown, voucher_usage_summary.

**Settings (/kitchen/settings)**: Profile (view_name, view_phone, change_language), Notifications (new_order_sound, order_ready_alert, delivery_updates), App (auto_refresh_interval, dark_mode, print_settings), About (app_version, contact_support), logout_button.

## Driver Screens

**Deliveries (/driver/deliveries)**: Tabs: Assigned (pending pickup), In Progress, Completed Today. Card shows order_id, customer_name, address_preview, meal_type_badge, items_count, estimated_distance, priority_indicator. Actions: start_delivery, view_route, contact_customer, mark_delivered. Empty state shows no_deliveries_assigned with pull to refresh.

**Delivery Detail**: Sections include OrderInfo (order_id, meal_type, items_list, special_instructions), CustomerInfo (name, phone tap-to-call, address_full, delivery_notes), DeliveryOTP (otp_display, verify_otp_input on delivery), NavigationSection (open_in_maps_button, estimated_time, distance). Actions: mark_picked_up, start_navigation, contact_customer, mark_delivered (with OTP verification), report_issue. Status flow: ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED.

**Delivery Complete Modal**: Form requires otp_input (4 digits), optional delivery_photo and notes. OTP must match order.delivery_otp. On success: show_success_animation, auto_navigate_to_next_delivery, update_earnings.

**Earnings (/driver/earnings)**: Summary card shows today_earnings, today_deliveries, today_tips. Tabs: Today, This Week, This Month. Earnings list shows delivery_card with order_id, delivery_time, base_pay, tip, total. Stats: total_earnings, total_deliveries, average_per_delivery, best_day.

**Profile (/driver/profile)**: Profile info (name, phone, photo, rating, member_since), stats (total_deliveries, average_rating, on_time_percentage), settings (notification_preferences, language), documents (view uploaded docs), logout_button.

## API Endpoints

Base URL: Production https://api.tiffin-delivery.com, Development http://192.168.29.105:3000

### Authentication
POST /api/auth/staff/send-otp - Send OTP to staff phone. Request: {phone}. Response: {success, message, confirmationId}.
POST /api/auth/staff/verify-otp - Verify OTP. Request: {phone, otp, firebaseToken}. Response: {success, token, user}.
GET /api/auth/staff/profile - Get staff profile. Response: {user: StaffProfile}.
POST /api/auth/staff/logout - Logout. Response: {success}.

### Orders (Kitchen)
GET /api/kitchen/orders - List orders. Query: status, mealType, date, page, limit. Response: {orders[], pagination}.
GET /api/kitchen/orders/:id - Order details. Response: {order: OrderDetail}.
PATCH /api/kitchen/orders/:id/status - Update status. Request: {status}. Response: {order}.
POST /api/kitchen/orders/:id/assign - Assign driver. Request: {driverId}. Response: {order}.
POST /api/kitchen/orders/:id/cancel - Cancel order. Request: {reason}. Response: {order}.
PATCH /api/kitchen/orders/bulk-status - Bulk update. Request: {orderIds[], status}. Response: {updated[]}.
GET /api/kitchen/orders/stats - Order stats. Query: date. Response: {stats}.

### Menu Management
GET /api/kitchen/menu-items - List items. Query: mealType, foodType, available. Response: {items[]}.
POST /api/kitchen/menu-items - Create item. Request: FormData. Response: {item}.
GET /api/kitchen/menu-items/:id - Item details. Response: {item}.
PUT /api/kitchen/menu-items/:id - Update item. Request: FormData. Response: {item}.
DELETE /api/kitchen/menu-items/:id - Delete item. Response: {success}.
PATCH /api/kitchen/menu-items/:id/availability - Toggle availability. Request: {available}. Response: {item}.

### Addons Management
GET /api/kitchen/addons - List addons. Query: available. Response: {addons[]}.
POST /api/kitchen/addons - Create addon. Request: FormData. Response: {addon}.
PUT /api/kitchen/addons/:id - Update addon. Request: FormData. Response: {addon}.
DELETE /api/kitchen/addons/:id - Delete addon. Response: {success}.
PATCH /api/kitchen/addons/:id/availability - Toggle availability. Request: {available}. Response: {addon}.

### Users Management
GET /api/kitchen/customers - List customers. Query: search, hasSubscription, page. Response: {customers[], pagination}.
GET /api/kitchen/customers/:id - Customer details. Response: {customer}.
GET /api/kitchen/customers/:id/orders - Customer orders. Query: page, limit. Response: {orders[]}.
GET /api/kitchen/customers/:id/vouchers - Voucher history. Response: {vouchers[]}.
GET /api/kitchen/drivers - List drivers. Query: status. Response: {drivers[]}.
GET /api/kitchen/drivers/:id - Driver details. Response: {driver}.
PATCH /api/kitchen/drivers/:id/status - Toggle status. Request: {status}. Response: {driver}.

### Subscriptions
GET /api/kitchen/subscriptions - List subscriptions. Query: status, planType, page. Response: {subscriptions[]}.
GET /api/kitchen/subscriptions/:id - Subscription details. Response: {subscription}.
GET /api/kitchen/subscriptions/stats - Subscription stats. Response: {stats}.

### Deliveries (Kitchen)
GET /api/kitchen/deliveries - List deliveries. Query: status, date. Response: {deliveries[]}.
POST /api/kitchen/deliveries/:id/assign - Assign driver. Request: {driverId}. Response: {delivery}.
GET /api/kitchen/deliveries/available-drivers - Get available drivers. Response: {drivers[]}.

### Analytics
GET /api/kitchen/analytics/overview - Overview stats. Query: startDate, endDate. Response: {stats}.
GET /api/kitchen/analytics/orders - Order analytics. Query: startDate, endDate. Response: {data}.
GET /api/kitchen/analytics/revenue - Revenue analytics. Query: startDate, endDate. Response: {data}.
GET /api/kitchen/analytics/popular-items - Popular items. Query: startDate, endDate. Response: {items[]}.

### Driver Endpoints
GET /api/driver/deliveries - My deliveries. Query: status, date. Response: {deliveries[]}.
GET /api/driver/deliveries/:id - Delivery detail. Response: {delivery}.
POST /api/driver/deliveries/:id/pickup - Mark picked up. Response: {delivery}.
POST /api/driver/deliveries/:id/complete - Mark delivered. Request: {otp, photo?, notes?}. Response: {delivery}.
POST /api/driver/deliveries/:id/issue - Report issue. Request: {issue, description}. Response: {success}.
GET /api/driver/earnings - My earnings. Query: startDate, endDate. Response: {earnings}.
GET /api/driver/profile - My profile. Response: {profile}.
POST /api/driver/location - Update location. Request: {lat, lng}. Response: {success}.
PATCH /api/driver/status - Toggle online status. Request: {online}. Response: {status}.

## Data Models

**StaffProfile**: id (string), name (string), phone (string), email (string, optional), role (KITCHEN_STAFF | DRIVER), status (ACTIVE | INACTIVE), createdAt (Date), updatedAt (Date).

**Order**: id, orderNumber, customerId, customer (CustomerSummary), items (OrderItem[]), addons (OrderAddon[]), mealType (LUNCH | DINNER), subtotal, tax, discount, addonTotal, total, vouchersUsed, subscriptionId (optional), status (OrderStatus), deliveryAddress (Address), deliveryOtp, deliveryInstructions (optional), driverId (optional), driver (DriverSummary, optional), paymentMethod (PaymentMethod), paymentStatus (PENDING | PAID | FAILED), statusHistory (StatusHistoryItem[]), createdAt, updatedAt.

**OrderStatus enum**: PENDING, CONFIRMED, PREPARING, READY, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED.

**OrderItem**: id, menuItemId, name, quantity, price, isVoucherApplied.

**OrderAddon**: id, addonId, name, quantity, price.

**MenuItem**: id, name, description, price, image, mealTypes (LUNCH | DINNER array), foodType (VEG | NON_VEG | VEGAN), isJainFriendly, spiceLevel (LOW | MEDIUM | HIGH), isAvailable, preparationTime (minutes), createdAt, updatedAt.

**Addon**: id, name, description (optional), price, image, isAvailable, compatibleMenuItems (string[] | 'ALL'), createdAt, updatedAt.

**Customer**: id, name, phone, email (optional), dietaryPreferences (foodType, isEggetarian, isJainFriendly, dabbaType: DISPOSABLE | STEEL_DABBA, spiceLevel), addresses (Address[]), activeSubscription (SubscriptionSummary, optional), totalOrders, lastOrderDate (optional), createdAt.

**Subscription**: id, customerId, customer (CustomerSummary), planType (7D | 14D | 30D), purchaseDate, expiryDate (3 months from purchase), totalVouchers, vouchersUsed, vouchersRemaining, autoOrderLunch, autoOrderDinner, status (ACTIVE | EXPIRED | EXHAUSTED), createdAt.

**VoucherUsage**: id, subscriptionId, orderId, mealType (LUNCH | DINNER), usedAt.

**Driver** (extends StaffProfile): role is DRIVER, isOnline, currentLocation (lat, lng, updatedAt - optional), activeDeliveries, todayCompleted, rating, totalDeliveries, totalEarnings.

**Delivery**: id, orderId, order (OrderSummary), driverId (optional), driver (DriverSummary, optional), status (DeliveryStatus), pickupTime (optional), deliveredTime (optional), customerOtp, deliveryPhoto (optional), deliveryNotes (optional), estimatedTime (minutes), distance (km), issue (type, description, reportedAt - optional).

**DeliveryStatus enum**: UNASSIGNED, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, FAILED.

## State Management

**AuthState**: user (StaffProfile | null), isLoading, isAuthenticated, role (KITCHEN_STAFF | DRIVER | null).
**AuthActions**: login(phone), verifyOtp(otp), logout(), refreshProfile().

**OrderState**: orders (Order[]), selectedOrder (Order | null), filters (OrderFilters), pagination (Pagination), stats (OrderStats), isLoading.
**OrderActions**: fetchOrders(filters?), fetchOrderDetail(id), updateOrderStatus(id, status), assignDriver(orderId, driverId), cancelOrder(id, reason).

**DeliveryState**: deliveries (Delivery[]), activeDelivery (Delivery | null), todayStats (completed, earnings), isOnline.
**DeliveryActions**: fetchDeliveries(), markPickedUp(id), markDelivered(id, otp), reportIssue(id, issue), toggleOnlineStatus(), updateLocation(lat, lng).

## Real-time Features

**WebSocket Kitchen Events**: order:new (Order), order:updated (orderId, status), order:cancelled (orderId, reason), delivery:status (deliveryId, status), driver:location (driverId, lat, lng).

**WebSocket Driver Events**: delivery:assigned (Delivery), delivery:unassigned (deliveryId), order:cancelled (orderId, reason).

Connect socket on auth with token. Kitchen subscribes to order:new, order:updated. Driver subscribes to delivery:assigned.

## Notifications

**NotificationPayload**: type, title, body, data.
**Kitchen Notifications**: NEW_ORDER, ORDER_CANCELLED, DRIVER_ARRIVED, DELIVERY_COMPLETED, DELIVERY_ISSUE.
**Driver Notifications**: DELIVERY_ASSIGNED, ORDER_CANCELLED, CUSTOMER_MESSAGE.

Register FCM token with registerPushToken(fcmToken, staffId, role). Handle foreground with messaging().onMessage(). Handle background with messaging().setBackgroundMessageHandler().

## Order Status Flow

Customer places order → PENDING. Kitchen confirms → CONFIRMED. Kitchen starts preparing → PREPARING. Kitchen marks ready → READY (assign driver here). Driver picks up → PICKED_UP. Driver en route → IN_TRANSIT. OTP verified and delivered → DELIVERED. Orders can be CANCELLED from PENDING, CONFIRMED, or PREPARING states.

## Cutoff Time Logic

CUTOFF constants: LUNCH is 11:00, DINNER is 21:00. canOrderForMeal(mealType) returns true if current time is before cutoff. getAvailableOrderDate(mealType) returns today if before cutoff, otherwise tomorrow.

## Status Badges

Order Status colors: PENDING (Yellow, clock), CONFIRMED (Blue, check), PREPARING (Orange, cooking), READY (Green, package), PICKED_UP (Purple, bike), IN_TRANSIT (Blue, navigation), DELIVERED (Green, check-circle), CANCELLED (Red, x-circle).

Meal Type colors: LUNCH (Orange, sun), DINNER (Indigo, moon).

Food Type colors: VEG (Green, leaf), NON_VEG (Red, drumstick), VEGAN (Emerald, sprout).

## Error Codes

AUTH_001: Phone not registered - Contact admin.
AUTH_002: Account inactive - Contact admin.
AUTH_003: Invalid OTP - Retry or resend.
ORDER_001: Order not found - Refresh.
ORDER_002: Invalid status transition - Check current status.
ORDER_003: Driver already assigned - Refresh order.
DELIVERY_001: Invalid OTP - Customer provides correct OTP.
DELIVERY_002: Delivery already completed - Refresh.
MENU_001: Item name exists - Use different name.
MENU_002: Image upload failed - Retry.
