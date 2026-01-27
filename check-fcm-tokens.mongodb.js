/**
 * MongoDB Script to Check FCM Token Registration
 *
 * Run this script in MongoDB Compass, Studio 3T, or mongosh to verify
 * that users have FCM tokens registered and can receive push notifications.
 *
 * Usage:
 * 1. Connect to your MongoDB database
 * 2. Run each section individually
 * 3. Review the results
 */

// ============================================
// 1. CHECK KITCHEN STAFF FCM TOKENS
// ============================================
print("========================================");
print("1. KITCHEN STAFF FCM TOKENS");
print("========================================");

db.users.find({
  role: "KITCHEN_STAFF",
  status: "ACTIVE"
}, {
  _id: 1,
  name: 1,
  phone: 1,
  kitchenId: 1,
  status: 1,
  fcmTokens: 1
}).forEach(function(user) {
  print("\n--- Kitchen Staff: " + user.name + " ---");
  print("ID: " + user._id);
  print("Phone: " + user.phone);
  print("Kitchen ID: " + user.kitchenId);
  print("Status: " + user.status);
  print("FCM Tokens Count: " + (user.fcmTokens ? user.fcmTokens.length : 0));

  if (user.fcmTokens && user.fcmTokens.length > 0) {
    user.fcmTokens.forEach(function(token, index) {
      print("  Token " + (index + 1) + ":");
      print("    - Device Type: " + token.deviceType);
      print("    - Token (first 30): " + token.token.substring(0, 30) + "...");
      print("    - Updated: " + token.updatedAt);
    });
    print("✅ Can receive notifications");
  } else {
    print("❌ NO FCM TOKENS - User needs to login");
  }
});

print("\n========================================\n");

// ============================================
// 2. CHECK ADMIN FCM TOKENS
// ============================================
print("========================================");
print("2. ADMIN FCM TOKENS");
print("========================================");

db.users.find({
  role: "ADMIN",
  status: "ACTIVE"
}, {
  _id: 1,
  name: 1,
  phone: 1,
  status: 1,
  fcmTokens: 1
}).forEach(function(user) {
  print("\n--- Admin: " + user.name + " ---");
  print("ID: " + user._id);
  print("Phone: " + user.phone);
  print("Status: " + user.status);
  print("FCM Tokens Count: " + (user.fcmTokens ? user.fcmTokens.length : 0));

  if (user.fcmTokens && user.fcmTokens.length > 0) {
    user.fcmTokens.forEach(function(token, index) {
      print("  Token " + (index + 1) + ":");
      print("    - Device Type: " + token.deviceType);
      print("    - Token (first 30): " + token.token.substring(0, 30) + "...");
      print("    - Updated: " + token.updatedAt);
    });
    print("✅ Can receive notifications");
  } else {
    print("❌ NO FCM TOKENS - User needs to login");
  }
});

print("\n========================================\n");

// ============================================
// 3. CHECK DRIVER FCM TOKENS
// ============================================
print("========================================");
print("3. DRIVER FCM TOKENS");
print("========================================");

db.users.find({
  role: "DRIVER",
  status: "ACTIVE",
  approvalStatus: "APPROVED"
}, {
  _id: 1,
  name: 1,
  phone: 1,
  status: 1,
  approvalStatus: 1,
  fcmTokens: 1
}).forEach(function(user) {
  print("\n--- Driver: " + user.name + " ---");
  print("ID: " + user._id);
  print("Phone: " + user.phone);
  print("Status: " + user.status);
  print("Approval: " + user.approvalStatus);
  print("FCM Tokens Count: " + (user.fcmTokens ? user.fcmTokens.length : 0));

  if (user.fcmTokens && user.fcmTokens.length > 0) {
    user.fcmTokens.forEach(function(token, index) {
      print("  Token " + (index + 1) + ":");
      print("    - Device Type: " + token.deviceType);
      print("    - Token (first 30): " + token.token.substring(0, 30) + "...");
      print("    - Updated: " + token.updatedAt);
    });
    print("✅ Can receive notifications");
  } else {
    print("❌ NO FCM TOKENS - User needs to login");
  }
});

print("\n========================================\n");

// ============================================
// 4. SUMMARY STATISTICS
// ============================================
print("========================================");
print("4. SUMMARY STATISTICS");
print("========================================");

var kitchenStaffCount = db.users.countDocuments({
  role: "KITCHEN_STAFF",
  status: "ACTIVE"
});

var kitchenStaffWithTokens = db.users.countDocuments({
  role: "KITCHEN_STAFF",
  status: "ACTIVE",
  "fcmTokens.0": { $exists: true }
});

var adminCount = db.users.countDocuments({
  role: "ADMIN",
  status: "ACTIVE"
});

var adminWithTokens = db.users.countDocuments({
  role: "ADMIN",
  status: "ACTIVE",
  "fcmTokens.0": { $exists: true }
});

var driverCount = db.users.countDocuments({
  role: "DRIVER",
  status: "ACTIVE",
  approvalStatus: "APPROVED"
});

var driverWithTokens = db.users.countDocuments({
  role: "DRIVER",
  status: "ACTIVE",
  approvalStatus: "APPROVED",
  "fcmTokens.0": { $exists: true }
});

print("\nKitchen Staff:");
print("  Total Active: " + kitchenStaffCount);
print("  With FCM Tokens: " + kitchenStaffWithTokens);
print("  Without Tokens: " + (kitchenStaffCount - kitchenStaffWithTokens));
print("  Coverage: " + ((kitchenStaffWithTokens / kitchenStaffCount * 100) || 0).toFixed(1) + "%");

print("\nAdmins:");
print("  Total Active: " + adminCount);
print("  With FCM Tokens: " + adminWithTokens);
print("  Without Tokens: " + (adminCount - adminWithTokens));
print("  Coverage: " + ((adminWithTokens / adminCount * 100) || 0).toFixed(1) + "%");

print("\nDrivers:");
print("  Total Active & Approved: " + driverCount);
print("  With FCM Tokens: " + driverWithTokens);
print("  Without Tokens: " + (driverCount - driverWithTokens));
print("  Coverage: " + ((driverWithTokens / driverCount * 100) || 0).toFixed(1) + "%");

print("\n========================================\n");

// ============================================
// 5. FIND USERS WITHOUT TOKENS (ACTION NEEDED)
// ============================================
print("========================================");
print("5. USERS NEEDING TOKEN REGISTRATION");
print("========================================");

print("\nKitchen Staff without tokens:");
db.users.find({
  role: "KITCHEN_STAFF",
  status: "ACTIVE",
  $or: [
    { fcmTokens: { $exists: false } },
    { fcmTokens: { $size: 0 } }
  ]
}, {
  name: 1,
  phone: 1,
  kitchenId: 1
}).forEach(function(user) {
  print("  - " + user.name + " (" + user.phone + ") - Kitchen: " + user.kitchenId);
});

print("\nAdmins without tokens:");
db.users.find({
  role: "ADMIN",
  status: "ACTIVE",
  $or: [
    { fcmTokens: { $exists: false } },
    { fcmTokens: { $size: 0 } }
  ]
}, {
  name: 1,
  phone: 1
}).forEach(function(user) {
  print("  - " + user.name + " (" + user.phone + ")");
});

print("\nDrivers without tokens:");
db.users.find({
  role: "DRIVER",
  status: "ACTIVE",
  approvalStatus: "APPROVED",
  $or: [
    { fcmTokens: { $exists: false } },
    { fcmTokens: { $size: 0 } }
  ]
}, {
  name: 1,
  phone: 1
}).forEach(function(user) {
  print("  - " + user.name + " (" + user.phone + ")");
});

print("\n========================================");
print("✅ VERIFICATION COMPLETE");
print("========================================\n");

print("Next Steps:");
print("1. Users without tokens should login to the mobile app");
print("2. Check app logs for FCM token registration");
print("3. Run this script again to verify tokens are registered");
print("4. Test notifications using the manual test endpoint");
print("\nSee NOTIFICATION_VERIFICATION_GUIDE.md for detailed testing\n");
