# API Response Debugging Guide

## Current Error
```
Query data cannot be undefined. Please make sure to return a value other than undefined from your query function.
Affected query key: ["order","6963b6c35eef8e3f62d4ff23"]
```

## What This Means
The API endpoint `/api/orders/6963b6c35eef8e3f62d4ff23` is either:
1. Not returning any data
2. Returning data in an unexpected format
3. Returning an error response
4. The order doesn't exist

## Solution Implemented

### 1. Enhanced Error Handling ✅
Added comprehensive logging and error handling in `orders.service.ts`:

```typescript
async getOrderById(orderId: string): Promise<Order> {
  try {
    const response = await apiService.get<any>(`/api/orders/${orderId}`);

    console.log('🔍 getOrderById Response:', JSON.stringify(response, null, 2));

    // Handle different response structures
    if (response.data?.order) {
      return response.data.order;
    } else if (response.data) {
      return response.data;
    } else if (response.order) {
      return response.order;
    } else if (response.error) {
      // Backend might return data in 'error' field
      return response.error;
    }

    throw new Error('Invalid order response structure');
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    throw error;
  }
}
```

### 2. Better UI Error Display ✅
Enhanced the error screen to show:
- Error icon
- Clear error message
- Order ID being fetched
- Specific error details
- Retry button
- Back to orders button

## How to Debug

### Step 1: Check Console Logs
After clicking an order, look in the console for:

```
📥 Fetching order: 6963b6c35eef8e3f62d4ff23
🔍 getOrderById Response: { ... }
```

### Step 2: Identify Response Structure
The log will show the actual API response. Common structures:

**Structure 1: Nested data.order**
```json
{
  "success": true,
  "data": {
    "order": { "_id": "...", "orderNumber": "..." }
  }
}
```

**Structure 2: Direct data**
```json
{
  "success": true,
  "data": { "_id": "...", "orderNumber": "..." }
}
```

**Structure 3: Error field (like getOrders)**
```json
{
  "message": true,
  "data": "string",
  "error": { "_id": "...", "orderNumber": "..." }
}
```

**Structure 4: API Error**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Order not found"
  }
}
```

### Step 3: Common Issues & Fixes

#### Issue 1: Order Not Found (404)
**Symptom:** Console shows 404 or "Order not found"

**Possible Causes:**
- Order ID is invalid
- Order was deleted
- Wrong API endpoint

**Fix:**
- Verify order exists in database
- Check order ID is correct
- Try with a different order

#### Issue 2: Authentication Error (401)
**Symptom:** Console shows 401 or "Unauthorized"

**Possible Causes:**
- Token expired
- Missing Authorization header
- Wrong token

**Fix:**
```bash
# Check token in AsyncStorage
# Logout and login again
```

#### Issue 3: Response Structure Mismatch
**Symptom:** Console shows the response but app still crashes

**Possible Causes:**
- Backend uses different response format
- Response is wrapped differently

**Fix:** The code now handles multiple formats automatically!

#### Issue 4: Network Error
**Symptom:** Console shows network timeout or connection refused

**Possible Causes:**
- Backend server not running
- Wrong API URL
- Network connectivity

**Fix:**
- Check backend is running
- Verify API URL in config
- Check device/emulator network

### Step 4: Test with Different Orders

Try clicking different orders to see if:
- All orders fail (API issue)
- Only specific orders fail (data issue)
- Older orders work but new ones don't (schema change)

## API Endpoint Reference

According to the API docs, the endpoint should be:

```
GET /api/orders/:id

Response (200):
{
  "success": true,
  "data": {
    "order": {
      "_id": "6789ord123abc456789ab001",
      "orderNumber": "ORD-20250110-A2B3C",
      "userId": { ... },
      "kitchenId": { ... },
      // ... more order fields
    }
  }
}
```

## Backend Verification

To verify the backend is working correctly:

### 1. Test with curl
```bash
curl -X GET "http://your-api-url/api/orders/6963b6c35eef8e3f62d4ff23" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Test with Postman
1. Open Postman
2. GET `http://your-api-url/api/orders/6963b6c35eef8e3f62d4ff23`
3. Add Header: `Authorization: Bearer YOUR_TOKEN`
4. Send request
5. Check response structure

### 3. Check Backend Logs
Look at your backend console for:
- Incoming request logged
- SQL/MongoDB query
- Response being sent
- Any errors

## Quick Fixes

### If Backend Returns Different Structure:
Update `orders.service.ts` line 69-78 to match your backend's actual response structure.

### If Order IDs are Wrong:
Check `OrderCardAdmin.tsx` to ensure it's passing the correct `_id` field when clicking.

### If API URL is Wrong:
Check `api.service.ts` or `api.enhanced.service.ts` for the base URL configuration.

## Expected Behavior After Fix

1. Click any order in the list
2. Console shows: `📥 Fetching order: [id]`
3. Console shows: `🔍 getOrderById Response: {...}`
4. Console shows: `✅ Order fetched successfully: [id]`
5. Order detail screen opens with data
6. Action buttons appear based on status

## Still Having Issues?

If you still see `undefined` error after implementing the fixes:

1. **Share the console output** - The `🔍 getOrderById Response` log will show the exact issue
2. **Check backend response** - Use curl/Postman to verify backend is working
3. **Verify order exists** - Check database to confirm order ID is valid
4. **Check network** - Ensure app can reach the backend API

## Summary

✅ **Enhanced error handling** - Multiple response formats supported
✅ **Better logging** - Console shows exact API response
✅ **Improved UI** - Clear error messages with retry/back options
✅ **Auto-detection** - Code now handles different response structures

The app will now show you exactly what's wrong and give you options to retry or go back!
