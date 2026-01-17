# Driver Registration & Approval System - Admin UI Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Complete Workflow](#complete-workflow)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [UI Requirements](#ui-requirements)
6. [Error Handling](#error-handling)
7. [Testing Scenarios](#testing-scenarios)

---

## Overview

The backend implements a complete driver registration and approval workflow where:
1. **Drivers** self-register via mobile app with their credentials and documents
2. **System** sets their status to `PENDING` and prevents access to delivery features
3. **Admin** reviews pending registrations and approves/rejects with reasons
4. **Drivers** gain access only after approval, or are blocked if rejected

**Current Status:** Backend fully implemented ✅ | Admin UI integration needed ❌

---

## Complete Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: DRIVER SELF-REGISTRATION                               │
└─────────────────────────────────────────────────────────────────┘

Driver Mobile App:
1. Phone OTP verification (Firebase Auth)
2. Submit registration form with:
   - Personal details (name, email, photo)
   - License details (number, image, expiry)
   - Vehicle details (name, number, type)
   - Vehicle documents (RC, Insurance, PUC)

Backend Action:
✓ Creates User with role="DRIVER"
✓ Sets approvalStatus="PENDING"
✓ Sets status="ACTIVE"
✓ Stores all driverDetails
✓ Returns 201 with message: "Registration submitted for approval"

Driver State: CAN view profile, CANNOT accept deliveries


┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: ADMIN REVIEW (NEEDS UI INTEGRATION)                   │
└─────────────────────────────────────────────────────────────────┘

Admin Portal:
1. View list of pending driver registrations
2. Click on driver to see full details:
   - License image
   - Vehicle documents (RC, Insurance, PUC)
   - Registration date
3. Perform background verification
4. Decision:
   a) APPROVE → Driver gains full access
   b) REJECT → Driver blocked with reason

Backend Action:
✓ Updates approvalStatus
✓ Records admin ID, timestamp, reason (if rejected)
✓ Creates audit log entry
✓ Returns updated user object


┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: POST-DECISION                                          │
└─────────────────────────────────────────────────────────────────┘

If APPROVED:
✓ Driver can login
✓ Driver can accept delivery assignments
✓ Full access to driver features

If REJECTED:
✗ Driver cannot login
✗ Sees rejection reason on sync
✗ Must contact support or re-register
```

---

## API Endpoints

### Base URL
```
Production: https://your-api-domain.com/api
Development: http://localhost:4000/api
```

### Authentication
All admin endpoints require authentication:
- **Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Middleware:** `adminAuthMiddleware` + `adminMiddleware`

---

### 1. Get Pending Driver Registrations

**Endpoint:** `GET /api/admin/drivers/pending`

**Description:** Retrieves paginated list of drivers awaiting approval

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Request Example:**
```bash
GET /api/admin/drivers/pending?page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Pending drivers retrieved",
  "data": {
    "drivers": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "phone": "+919876543210",
        "name": "Rajesh Kumar",
        "email": "rajesh@example.com",
        "profileImage": "https://storage.googleapis.com/bucket/profiles/abc123.jpg",
        "role": "DRIVER",
        "status": "ACTIVE",
        "approvalStatus": "PENDING",
        "driverDetails": {
          "licenseNumber": "MH1220200012345",
          "licenseImageUrl": "https://storage.googleapis.com/bucket/licenses/xyz789.jpg",
          "licenseExpiryDate": "2027-06-15T00:00:00.000Z",
          "vehicleName": "Honda Activa",
          "vehicleNumber": "MH12AB1234",
          "vehicleType": "SCOOTER",
          "vehicleDocuments": [
            {
              "type": "RC",
              "imageUrl": "https://storage.googleapis.com/bucket/docs/rc_123.jpg",
              "expiryDate": "2028-03-20T00:00:00.000Z"
            },
            {
              "type": "INSURANCE",
              "imageUrl": "https://storage.googleapis.com/bucket/docs/ins_456.jpg",
              "expiryDate": "2026-12-31T00:00:00.000Z"
            },
            {
              "type": "PUC",
              "imageUrl": "https://storage.googleapis.com/bucket/docs/puc_789.jpg",
              "expiryDate": "2026-06-30T00:00:00.000Z"
            }
          ]
        },
        "createdAt": "2026-01-15T10:30:00.000Z",
        "updatedAt": "2026-01-15T10:30:00.000Z",
        "lastLoginAt": "2026-01-15T10:30:00.000Z"
      }
      // ... more drivers
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

**Error Responses:**
| Status | Message | Description |
|--------|---------|-------------|
| 401 | Unauthorized | Invalid or missing JWT token |
| 403 | Forbidden | User is not an admin |
| 500 | Failed to retrieve pending drivers | Server error |

---

### 2. Approve Driver Registration

**Endpoint:** `PATCH /api/admin/drivers/:id/approve`

**Description:** Approves a pending driver registration

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Driver's user ID (MongoDB ObjectId) |

**Request Example:**
```bash
PATCH /api/admin/drivers/507f1f77bcf86cd799439011/approve
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Driver approved successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "phone": "+919876543210",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "role": "DRIVER",
      "status": "ACTIVE",
      "approvalStatus": "APPROVED",
      "approvalDetails": {
        "approvedBy": "507f1f77bcf86cd799439022",
        "approvedAt": "2026-01-17T14:30:00.000Z"
      },
      "driverDetails": { /* ... */ },
      "createdAt": "2026-01-15T10:30:00.000Z",
      "updatedAt": "2026-01-17T14:30:00.000Z"
    }
  }
}
```

**Error Responses:**
| Status | Message | Description |
|--------|---------|-------------|
| 400 | User is not a driver | Target user is not a DRIVER role |
| 400 | Driver is already approved | Cannot approve already approved driver |
| 401 | Unauthorized | Invalid or missing JWT token |
| 403 | Forbidden | User is not an admin |
| 404 | User not found | Driver ID doesn't exist |
| 500 | Failed to approve driver | Server error |

**Side Effects:**
- ✓ User's `approvalStatus` changed to `"APPROVED"`
- ✓ `approvalDetails.approvedBy` set to admin's ID
- ✓ `approvalDetails.approvedAt` set to current timestamp
- ✓ Audit log created with action `"APPROVE_DRIVER"`
- ✓ Driver can now login and accept deliveries

---

### 3. Reject Driver Registration

**Endpoint:** `PATCH /api/admin/drivers/:id/reject`

**Description:** Rejects a pending driver registration with reason

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Driver's user ID (MongoDB ObjectId) |

**Request Body:**
```json
{
  "reason": "License document is unclear and unverifiable"
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reason` | string | ✓ Yes | Reason for rejection (shown to driver) |

**Request Example:**
```bash
PATCH /api/admin/drivers/507f1f77bcf86cd799439011/reject
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "Vehicle registration certificate has expired. Please upload a valid RC document."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Driver rejected",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "phone": "+919876543210",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "role": "DRIVER",
      "status": "ACTIVE",
      "approvalStatus": "REJECTED",
      "approvalDetails": {
        "rejectedBy": "507f1f77bcf86cd799439022",
        "rejectedAt": "2026-01-17T14:35:00.000Z",
        "rejectionReason": "Vehicle registration certificate has expired. Please upload a valid RC document."
      },
      "driverDetails": { /* ... */ },
      "createdAt": "2026-01-15T10:30:00.000Z",
      "updatedAt": "2026-01-17T14:35:00.000Z"
    }
  }
}
```

**Error Responses:**
| Status | Message | Description |
|--------|---------|-------------|
| 400 | Rejection reason is required | Missing `reason` in request body |
| 400 | User is not a driver | Target user is not a DRIVER role |
| 400 | Driver is already rejected | Cannot reject already rejected driver |
| 401 | Unauthorized | Invalid or missing JWT token |
| 403 | Forbidden | User is not an admin |
| 404 | User not found | Driver ID doesn't exist |
| 500 | Failed to reject driver | Server error |

**Side Effects:**
- ✓ User's `approvalStatus` changed to `"REJECTED"`
- ✓ `approvalDetails.rejectedBy` set to admin's ID
- ✓ `approvalDetails.rejectedAt` set to current timestamp
- ✓ `approvalDetails.rejectionReason` stores the reason
- ✓ Audit log created with action `"REJECT_DRIVER"`
- ✓ Driver CANNOT login (blocked with rejection message)

---

## Data Models

### User Model (Driver Role)

**Schema Location:** `schema/user.schema.js`

**Core Fields:**
```typescript
interface User {
  _id: ObjectId;
  phone: string;                    // Unique, required
  firebaseUid: string;              // Firebase UID
  role: "DRIVER" | "CUSTOMER" | "ADMIN";
  name?: string;
  email?: string;
  profileImage?: string;            // URL
  status: "ACTIVE" | "INACTIVE" | "DELETED";

  // Driver-specific fields
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";

  approvalDetails?: {
    approvedBy?: ObjectId;          // Reference to admin User
    approvedAt?: Date;
    rejectedBy?: ObjectId;          // Reference to admin User
    rejectedAt?: Date;
    rejectionReason?: string;
  };

  driverDetails?: {
    licenseNumber?: string;
    licenseImageUrl?: string;       // URL to license image
    licenseExpiryDate?: Date;
    vehicleName?: string;           // e.g., "Honda Activa"
    vehicleNumber?: string;         // e.g., "MH12AB1234"
    vehicleType?: "BIKE" | "SCOOTER" | "BICYCLE" | "OTHER";
    vehicleDocuments?: Array<{
      type: "RC" | "INSURANCE" | "PUC" | "OTHER";
      imageUrl: string;             // URL to document image
      expiryDate?: Date;
    }>;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}
```

**Approval Status Values:**
| Status | Description | Driver Access |
|--------|-------------|---------------|
| `PENDING` | Awaiting admin review | Can view profile only |
| `APPROVED` | Admin approved | Full access to app |
| `REJECTED` | Admin rejected | Cannot login |

**Vehicle Types:**
- `BIKE` - Motorcycle
- `SCOOTER` - Scooter/Scooty
- `BICYCLE` - Bicycle
- `OTHER` - Other vehicle types

**Vehicle Document Types:**
- `RC` - Registration Certificate
- `INSURANCE` - Vehicle Insurance
- `PUC` - Pollution Under Control Certificate
- `OTHER` - Other documents

---

### Validation Rules (Registration)

**Validation Schema:** `src/auth/auth.validation.js`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✓ | Min 2, max 100 chars |
| `email` | string | ✗ | Valid email format |
| `profileImage` | string | ✗ | Valid URL |
| `licenseNumber` | string | ✓ | Non-empty |
| `licenseImageUrl` | string | ✓ | Valid URL |
| `licenseExpiryDate` | date | ✗ | Must be future date |
| `vehicleName` | string | ✓ | Non-empty |
| `vehicleNumber` | string | ✓ | Format: `MH12AB1234` (2 letters + 1-2 digits + 0-3 letters + 4 digits) |
| `vehicleType` | enum | ✓ | BIKE, SCOOTER, BICYCLE, OTHER |
| `vehicleDocuments` | array | ✓ | Min 1 document required |
| `vehicleDocuments[].type` | enum | ✓ | RC, INSURANCE, PUC, OTHER |
| `vehicleDocuments[].imageUrl` | string | ✓ | Valid URL |
| `vehicleDocuments[].expiryDate` | date | ✗ | Optional |

---

## UI Requirements

### 1. Pending Drivers List Page

**Route:** `/admin/drivers/pending`

**Features Required:**
- ✓ Paginated table/list view
- ✓ Show key info: Name, Phone, Vehicle Type, Registration Date
- ✓ Badge showing "PENDING" status
- ✓ Search/filter by name or phone
- ✓ Sort by registration date (newest first by default)
- ✓ Click row to view full details

**Layout Example:**
```
┌─────────────────────────────────────────────────────────────┐
│  Pending Driver Approvals                          [Refresh] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [Search by name or phone...]                 Total: 45      │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Name         Phone          Vehicle      Registered      ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ Rajesh K.   +91 9876...   Scooter      Jan 15, 10:30    ││
│  │ Priya S.    +91 8765...   Bike         Jan 15, 11:45    ││
│  │ Amit P.     +91 7654...   Bicycle      Jan 14, 16:20    ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ← Previous    Page 1 of 3    Next →                         │
└─────────────────────────────────────────────────────────────┘
```

**API Call:**
```javascript
const fetchPendingDrivers = async (page = 1, limit = 20) => {
  const response = await fetch(
    `/api/admin/drivers/pending?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    }
  );
  const data = await response.json();
  return data;
};
```

---

### 2. Driver Detail Modal/Page

**Triggered:** When clicking on a pending driver

**Features Required:**
- ✓ Display all personal information
- ✓ Display license image (zoomable/expandable)
- ✓ Display all vehicle documents (zoomable/expandable)
- ✓ Show expiry dates with visual indicators (red if expired/expiring soon)
- ✓ Approve button (green)
- ✓ Reject button (red, opens rejection reason dialog)
- ✓ Close/Cancel button

**Information to Display:**

**Personal Info:**
- Name
- Phone number
- Email (if provided)
- Profile image
- Registration date

**License Details:**
- License number
- License image (clickable to enlarge)
- Expiry date (with warning if < 30 days)

**Vehicle Details:**
- Vehicle name
- Vehicle number
- Vehicle type

**Documents:**
For each document (RC, Insurance, PUC):
- Document type
- Document image (clickable to enlarge)
- Expiry date (with warning if < 30 days)

**Layout Example:**
```
┌──────────────────────────────────────────────────────────────┐
│  Driver Registration Details                         [Close] │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Personal Information                                          │
│  ├─ Name: Rajesh Kumar                                        │
│  ├─ Phone: +91 9876543210                                     │
│  ├─ Email: rajesh@example.com                                 │
│  └─ Registered: Jan 15, 2026 10:30 AM                        │
│                                                                │
│  License Details                                               │
│  ├─ Number: MH1220200012345                                   │
│  ├─ Expiry: Jun 15, 2027 ✓                                    │
│  └─ Image: [Click to view full size]                          │
│      [License Image Thumbnail]                                 │
│                                                                │
│  Vehicle Information                                           │
│  ├─ Name: Honda Activa                                        │
│  ├─ Number: MH12AB1234                                        │
│  └─ Type: Scooter                                             │
│                                                                │
│  Vehicle Documents                                             │
│  ├─ RC (Registration Certificate)                             │
│  │   Expiry: Mar 20, 2028 ✓                                   │
│  │   [Document Image]                                          │
│  │                                                             │
│  ├─ Insurance                                                  │
│  │   Expiry: Dec 31, 2026 ⚠ (Expiring in 11 months)          │
│  │   [Document Image]                                          │
│  │                                                             │
│  └─ PUC (Pollution Certificate)                               │
│      Expiry: Jun 30, 2026 ⚠ (Expiring in 5 months)           │
│      [Document Image]                                          │
│                                                                │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│      [Reject]                              [Approve Driver]   │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

### 3. Approve Action

**Trigger:** Click "Approve" button

**Flow:**
1. Show confirmation dialog: "Approve Rajesh Kumar as a driver?"
2. On confirm → Call API
3. Show loading state
4. On success:
   - Show success toast: "Driver approved successfully"
   - Remove from pending list
   - Close modal
5. On error:
   - Show error toast with message
   - Keep modal open

**API Call:**
```javascript
const approveDriver = async (driverId) => {
  try {
    const response = await fetch(
      `/api/admin/drivers/${driverId}/approve`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Approval failed:', error);
    throw error;
  }
};
```

---

### 4. Reject Action

**Trigger:** Click "Reject" button

**Flow:**
1. Show rejection reason dialog/modal
2. Require text input (min 10 chars)
3. Show examples: "License image is unclear", "Vehicle documents expired", etc.
4. On submit → Call API with reason
5. Show loading state
6. On success:
   - Show success toast: "Driver rejected"
   - Remove from pending list
   - Close modal
7. On error:
   - Show error toast with message
   - Keep dialog open

**Rejection Dialog Example:**
```
┌─────────────────────────────────────────────────────┐
│  Reject Driver Registration                         │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Please provide a reason for rejection:              │
│                                                       │
│  ┌─────────────────────────────────────────────────┐│
│  │                                                   ││
│  │  [Type rejection reason here...]                 ││
│  │                                                   ││
│  │  Min 10 characters                               ││
│  └─────────────────────────────────────────────────┘│
│                                                       │
│  Common reasons:                                      │
│  • License image is unclear or unverifiable          │
│  • Vehicle documents are expired                     │
│  • Information provided doesn't match documents      │
│  • Incomplete documentation                          │
│                                                       │
│  [Cancel]                          [Submit Rejection]│
│                                                       │
└─────────────────────────────────────────────────────┘
```

**API Call:**
```javascript
const rejectDriver = async (driverId, reason) => {
  try {
    const response = await fetch(
      `/api/admin/drivers/${driverId}/reject`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Rejection failed:', error);
    throw error;
  }
};
```

---

### 5. Image Viewer Component

**Required:** For viewing license and document images

**Features:**
- ✓ Thumbnail view in list/details
- ✓ Click to open full-size view
- ✓ Zoom in/out functionality
- ✓ Download option
- ✓ Close button
- ✓ Navigation between multiple images (if viewing documents)

**Example Library:** Use existing image viewer like `react-image-lightbox` or similar

---

### 6. Additional Nice-to-Have Features

**Statistics Dashboard:**
- Total pending approvals count (badge)
- Average approval time
- Today's approvals/rejections count

**Filters:**
- By vehicle type
- By registration date range
- By document expiry status

**Notifications:**
- Real-time notification when new driver registers
- Desktop notification support
- Badge count on sidebar menu

**Bulk Actions:**
- Select multiple drivers
- Bulk approve (with caution)
- Export pending list to CSV

---

## Error Handling

### Common Error Scenarios

**1. Network Errors**
```javascript
try {
  const data = await fetchPendingDrivers();
} catch (error) {
  if (error.message === 'Failed to fetch') {
    showToast('Network error. Please check your connection.', 'error');
  }
}
```

**2. Authentication Errors (401)**
```javascript
if (response.status === 401) {
  // Token expired or invalid
  showToast('Session expired. Please login again.', 'error');
  redirectToLogin();
}
```

**3. Authorization Errors (403)**
```javascript
if (response.status === 403) {
  showToast('You do not have permission to perform this action.', 'error');
}
```

**4. Validation Errors (400)**
```javascript
if (response.status === 400) {
  const error = await response.json();
  showToast(error.message, 'error');
  // e.g., "Rejection reason is required"
}
```

**5. Server Errors (500)**
```javascript
if (response.status === 500) {
  showToast('Server error. Please try again later.', 'error');
  logErrorToMonitoring(error);
}
```

---

## Testing Scenarios

### Manual Testing Checklist

#### Test 1: View Pending Drivers
- [ ] Navigate to pending drivers page
- [ ] Verify all pending drivers are displayed
- [ ] Check pagination works correctly
- [ ] Verify search/filter functionality
- [ ] Confirm data is properly formatted

#### Test 2: View Driver Details
- [ ] Click on a pending driver
- [ ] Verify all information is displayed
- [ ] Check license image loads and is viewable
- [ ] Verify all vehicle documents load
- [ ] Check expiry date warnings show correctly

#### Test 3: Approve Driver
- [ ] Click "Approve" button
- [ ] Verify confirmation dialog appears
- [ ] Confirm approval
- [ ] Check success message appears
- [ ] Verify driver removed from pending list
- [ ] Confirm driver can now login on mobile app

#### Test 4: Reject Driver
- [ ] Click "Reject" button
- [ ] Verify rejection reason dialog appears
- [ ] Try submitting without reason (should fail)
- [ ] Enter valid reason and submit
- [ ] Check success message appears
- [ ] Verify driver removed from pending list
- [ ] Confirm driver sees rejection reason on mobile app

#### Test 5: Error Scenarios
- [ ] Test with expired auth token (should redirect to login)
- [ ] Test approving already approved driver (should show error)
- [ ] Test rejecting already rejected driver (should show error)
- [ ] Test with invalid driver ID (should show error)
- [ ] Test network failure handling

#### Test 6: Edge Cases
- [ ] Driver with no email
- [ ] Driver with no profile image
- [ ] Driver with expired license
- [ ] Driver with expired vehicle documents
- [ ] Driver with minimum required documents (1 doc)
- [ ] Very long names/text fields
- [ ] Special characters in reason text

---

## Implementation Checklist

### Backend (Already Complete ✅)
- [x] Driver registration endpoint with validation
- [x] Approval status workflow in User model
- [x] Get pending drivers endpoint
- [x] Approve driver endpoint
- [x] Reject driver endpoint
- [x] Audit logging for all actions
- [x] Middleware checks for approval status
- [x] Proper error handling

### Frontend (Needs Implementation ❌)
- [ ] Pending drivers list page
- [ ] Driver details modal/page
- [ ] Image viewer component
- [ ] Approve confirmation dialog
- [ ] Reject reason dialog
- [ ] API integration functions
- [ ] Error handling and toasts
- [ ] Loading states
- [ ] Pagination controls
- [ ] Search/filter functionality
- [ ] Statistics dashboard (optional)
- [ ] Notifications (optional)

---

## Quick Start Integration Guide

### Step 1: Create API Service File
Create `src/services/driverApprovalService.js`:

```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export const driverApprovalService = {
  // Get pending drivers
  getPending: async (page = 1, limit = 20) => {
    const response = await fetch(
      `${API_BASE}/admin/drivers/pending?page=${page}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch pending drivers');
    }

    return response.json();
  },

  // Approve driver
  approve: async (driverId) => {
    const response = await fetch(
      `${API_BASE}/admin/drivers/${driverId}/approve`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve driver');
    }

    return response.json();
  },

  // Reject driver
  reject: async (driverId, reason) => {
    const response = await fetch(
      `${API_BASE}/admin/drivers/${driverId}/reject`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject driver');
    }

    return response.json();
  },
};
```

### Step 2: Create Pending Drivers Page
Create `src/pages/admin/PendingDrivers.jsx` with:
- List view using the service
- Pagination controls
- Click handler to open driver details

### Step 3: Create Driver Detail Modal
Create `src/components/admin/DriverDetailModal.jsx` with:
- Display all driver information
- Image viewer for documents
- Approve/Reject buttons with handlers

### Step 4: Add Route
Add to your admin routes:
```javascript
<Route path="/admin/drivers/pending" element={<PendingDrivers />} />
```

### Step 5: Add Navigation Link
Add to admin sidebar:
```javascript
<NavLink to="/admin/drivers/pending">
  Pending Approvals {pendingCount > 0 && <Badge>{pendingCount}</Badge>}
</NavLink>
```

---

## Support & Questions

**Backend Files Reference:**
- User Schema: [schema/user.schema.js](schema/user.schema.js)
- Auth Controller: [src/auth/auth.controller.js](src/auth/auth.controller.js:217-322)
- Admin Controller: [src/admin/admin.controller.js](src/admin/admin.controller.js:458-602)
- Admin Routes: [src/admin/admin.routes.js](src/admin/admin.routes.js:195-223)
- Auth Middleware: [middlewares/auth.middleware.js](middlewares/auth.middleware.js)

**Testing the API:**
You can test all endpoints using tools like:
- Postman
- cURL
- Insomnia
- REST Client (VS Code extension)

**Example cURL Commands:**

Get Pending Drivers:
```bash
curl -X GET "http://localhost:4000/api/admin/drivers/pending?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Approve Driver:
```bash
curl -X PATCH "http://localhost:4000/api/admin/drivers/DRIVER_ID/approve" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Reject Driver:
```bash
curl -X PATCH "http://localhost:4000/api/admin/drivers/DRIVER_ID/reject" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "License document is unclear"}'
```

---

## Document Version
- **Version:** 1.0
- **Last Updated:** January 17, 2026
- **Backend Status:** Fully Implemented ✅
- **Admin UI Status:** Needs Integration ❌

---

*This documentation covers the complete driver registration and approval workflow. All backend endpoints are fully functional and ready for frontend integration.*
