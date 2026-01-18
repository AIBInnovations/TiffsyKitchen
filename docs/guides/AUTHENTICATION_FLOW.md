# Authentication Flow Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP OPENS                                │
│                    (App.tsx renders)                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Firebase     │
                    │ Token Exists?│
                    └──────┬───────┘
                           │
                ┌──────────┴──────────┐
                │ NO                  │ YES
                ▼                     ▼
    ┌──────────────────────┐  ┌────────────────┐
    │ PhoneAuthScreen      │  │ AdminLogin     │
    │ (Phone Number Input) │  │ Screen         │
    └──────────┬───────────┘  └────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ User enters phone    │
    │ number (+91XXXXXXXXXX)│
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Validates:           │
    │ • 10 digits          │
    │ • Starts with 6-9    │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ User taps            │
    │ "Send OTP"           │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────────────────────────┐
    │         Firebase Authentication          │
    │  auth().signInWithPhoneNumber()          │
    │         (Sends OTP via SMS)              │
    └──────────┬───────────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ OTP Input Screen     │
    │ (6-digit code)       │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ User enters OTP      │
    │ (e.g., 123456)       │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────────────────────────┐
    │         Firebase Authentication          │
    │   confirmation.confirm(otpCode)          │
    │     (Verifies OTP with Firebase)         │
    └──────────┬───────────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ OTP Verification     │
    │ Success!             │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────────────────────────┐
    │   Get Firebase ID Token                  │
    │   userCredential.user.getIdToken()       │
    └──────────┬───────────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Store phone number   │
    │ in AsyncStorage      │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Call                 │
    │ onVerificationComplete│
    │ (firebaseToken)      │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────────────────────────┐
    │         App.tsx State Update             │
    │   setFirebaseToken(token)                │
    └──────────┬───────────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Navigate to          │
    │ AdminLoginScreen     │
    └──────────┬───────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│               ADMIN LOGIN SCREEN                                 │
│                                                                  │
│   ┌──────────────────────┐                                      │
│   │ User enters:         │                                      │
│   │ • Username           │                                      │
│   │ • Password           │                                      │
│   └──────────┬───────────┘                                      │
│              │                                                   │
│              ▼                                                   │
│   ┌──────────────────────┐                                      │
│   │ Form Validation      │                                      │
│   │ • Min 3 chars        │                                      │
│   │ • Min 6 chars        │                                      │
│   └──────────┬───────────┘                                      │
│              │                                                   │
│              ▼                                                   │
│   ┌──────────────────────┐                                      │
│   │ User taps            │                                      │
│   │ "Sign In"            │                                      │
│   └──────────┬───────────┘                                      │
└──────────────┼──────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│              BACKEND API CALL                                    │
│                                                                  │
│   POST https://tiffsy-backend.onrender.com/api/auth/admin/login │
│                                                                  │
│   Headers:                                                       │
│   ├─ Content-Type: application/json                             │
│   └─ Authorization: Bearer <firebase_token>                     │
│                                                                  │
│   Body:                                                          │
│   {                                                              │
│     "username": "admin_username",                                │
│     "password": "admin_password"                                 │
│   }                                                              │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Backend validates:   │
    │ • Username/Password  │
    │ • Firebase Token     │
    └──────────┬───────────┘
               │
      ┌────────┴────────┐
      │ SUCCESS         │ FAILURE
      ▼                 ▼
┌─────────────┐   ┌──────────────┐
│ Response:   │   │ Response:    │
│ {           │   │ {            │
│  success: ✓ │   │  success: ✗  │
│  token: xxx │   │  message: yyy│
│ }           │   │ }            │
└──────┬──────┘   └──────┬───────┘
       │                 │
       ▼                 ▼
┌─────────────┐   ┌──────────────┐
│ Store token │   │ Show error   │
│ in          │   │ message      │
│ AsyncStorage│   └──────────────┘
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Store       │
│ session if  │
│ remember me │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Navigate to │
│ DASHBOARD   │
└─────────────┘


═══════════════════════════════════════════════════════════════════
                       USER IS NOW LOGGED IN
═══════════════════════════════════════════════════════════════════
```

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                           App.tsx                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ State Management:                                           │ │
│  │ • firebaseToken: string | null                             │ │
│  │                                                             │ │
│  │ Functions:                                                  │ │
│  │ • handleVerificationComplete(token)                        │ │
│  │   └─> setFirebaseToken(token)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────┐    ┌──────────────────────────┐    │
│  │ Conditional Render:    │    │                          │    │
│  │                        │    │                          │    │
│  │ {!firebaseToken ?      │    │ {firebaseToken &&        │    │
│  │   <PhoneAuthScreen />  │───▶│   <AdminLoginScreen />}  │    │
│  │ }                      │    │                          │    │
│  └────────────────────────┘    └──────────────────────────┘    │
└────┬──────────────────────────────────────────────────┬─────────┘
     │                                                   │
     ▼                                                   ▼
┌─────────────────────────────────────┐  ┌─────────────────────────┐
│     PhoneAuthScreen.tsx             │  │  AdminLoginScreen.tsx   │
│                                     │  │                         │
│  Props:                             │  │  Props:                 │
│  • onVerificationComplete(token)    │  │  • firebaseToken        │
│                                     │  │                         │
│  Internal State:                    │  │  Internal State:        │
│  • phoneNumber: string              │  │  • username: string     │
│  • otp: string[]                    │  │  • password: string     │
│  • showOtpInput: boolean            │  │  • isSubmitting: bool   │
│  • confirmation: ConfirmationResult │  │  • errors: object       │
│                                     │  │                         │
│  Functions:                         │  │  Functions:             │
│  • handleSendOtp()                  │  │  • handleSignIn()       │
│  • handleVerifyOtp()                │  │  • validateForm()       │
│  • handleOtpChange()                │  │                         │
│  • validatePhoneNumber()            │  │  API Call:              │
│                                     │  │  POST /api/auth/admin/  │
│  Firebase Integration:              │  │  login                  │
│  • auth().signInWithPhoneNumber()   │  │  Headers:               │
│  • confirmation.confirm(otp)        │  │  • Authorization: Bearer│
│  • getIdToken()                     │  │    {firebaseToken}      │
└─────────────────────────────────────┘  └─────────────────────────┘
```

## Data Flow Diagram

```
┌────────────┐
│   User     │
└─────┬──────┘
      │
      ▼
┌────────────┐    Phone Number    ┌──────────────┐
│  Phone     │─────────────────────▶│   Firebase   │
│  Auth      │                      │   Auth       │
│  Screen    │◀─────────────────────│   Service    │
└────────────┘    OTP via SMS      └──────────────┘
      │
      │ User enters OTP
      ▼
┌────────────┐    Verify OTP      ┌──────────────┐
│  Phone     │─────────────────────▶│   Firebase   │
│  Auth      │                      │   Auth       │
│  Screen    │◀─────────────────────│   Service    │
└────────────┘    ID Token         └──────────────┘
      │
      │ onVerificationComplete(token)
      ▼
┌────────────┐
│  App.tsx   │
│  (State)   │
└─────┬──────┘
      │
      │ firebaseToken set
      ▼
┌────────────┐    Username/Password  ┌──────────────┐
│   Admin    │───────────────────────▶│   Backend    │
│   Login    │    + Firebase Token    │   API        │
│   Screen   │◀───────────────────────│   Server     │
└────────────┘    Auth Token         └──────────────┘
      │
      │ Store token
      ▼
┌────────────┐
│ AsyncStorage│
└────────────┘
      │
      │ Navigate
      ▼
┌────────────┐
│ Dashboard  │
└────────────┘
```

## Token Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      TOKEN LIFECYCLE                            │
└─────────────────────────────────────────────────────────────────┘

1. FIREBASE TOKEN GENERATION
   ┌──────────────────────────────────────────────┐
   │ Phone Number → Firebase → OTP → Verification │
   └───────────────────┬──────────────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │ Firebase ID Token    │
            │ (JWT)                │
            │ • Expires: 1 hour    │
            │ • Contains user ID   │
            │ • Contains phone     │
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │ Stored in App State  │
            │ (firebaseToken)      │
            └──────────┬───────────┘
                       │
                       ▼

2. BACKEND TOKEN REQUEST
   ┌──────────────────────────────────────────────┐
   │ Username + Password + Firebase Token         │
   │              ↓                               │
   │     Backend Validates Both                   │
   │              ↓                               │
   │     Generates Backend Auth Token             │
   └──────────────────┬─────────────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │ Backend Auth Token   │
            │ (JWT or session)     │
            │ • Longer expiry      │
            │ • Admin permissions  │
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │ Stored in            │
            │ AsyncStorage         │
            │ Key: 'authToken'     │
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │ Used for all         │
            │ subsequent API calls │
            └──────────────────────┘


3. SUBSEQUENT API CALLS
   ┌──────────────────────────────────────────────┐
   │ All API requests include:                    │
   │ Authorization: Bearer {backend_auth_token}   │
   └──────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                             │
└────────────────────────────────────────────────────────────────┘

Phone Auth Errors:
├─ Invalid Phone Number
│  └─> Show: "Please enter a valid 10-digit Indian phone number"
├─ Too Many Requests
│  └─> Show: "Too many requests. Please try again later"
├─ Network Error
│  └─> Show: "Failed to send OTP. Please try again"
└─ SMS Not Delivered
   └─> Allow: Resend OTP

OTP Verification Errors:
├─ Invalid Code
│  └─> Show: "Invalid OTP. Please check and try again"
├─ Expired Code
│  └─> Show: "OTP has expired. Please request a new one"
│  └─> Enable: Resend OTP button
└─ Network Error
   └─> Show: "Failed to verify OTP. Please try again"

Login Errors:
├─ Invalid Credentials
│  └─> Show: Backend error message
├─ Invalid Firebase Token
│  └─> Show: "Session expired. Please try again"
│  └─> Action: Restart phone auth flow
├─ Network Error
│  └─> Show: "Network error. Please check your connection"
└─ Server Error
   └─> Show: "Server error. Please try again later"
```

## State Management

```
┌────────────────────────────────────────────────────────────────┐
│                   APPLICATION STATE                            │
└────────────────────────────────────────────────────────────────┘

App.tsx Level:
┌──────────────────────────┐
│ firebaseToken: string?   │───▶ Determines which screen to show
└──────────────────────────┘

PhoneAuthScreen Level:
┌──────────────────────────┐
│ phoneNumber: string      │───▶ User input
│ otp: string[]            │───▶ 6-digit array
│ showOtpInput: boolean    │───▶ Toggle phone/OTP view
│ isSubmitting: boolean    │───▶ Loading state
│ errors: object           │───▶ Validation errors
│ confirmation: object     │───▶ Firebase confirmation result
└──────────────────────────┘

AdminLoginScreen Level:
┌──────────────────────────┐
│ username: string         │───▶ User input
│ password: string         │───▶ User input
│ rememberMe: boolean      │───▶ Session persistence
│ showPassword: boolean    │───▶ Toggle visibility
│ isLoggedIn: boolean      │───▶ Navigate to dashboard
│ isSubmitting: boolean    │───▶ Loading state
│ errors: object           │───▶ Validation errors
└──────────────────────────┘

AsyncStorage:
┌──────────────────────────────────────┐
│ '@admin_session_indicator'           │───▶ Session active flag
│ '@admin_remember_me'                 │───▶ Remember preference
│ 'authToken'                          │───▶ Backend auth token
│ 'userPhoneNumber'                    │───▶ User's phone
└──────────────────────────────────────┘
```

## Security Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                             │
└────────────────────────────────────────────────────────────────┘

Layer 1: Phone Verification
┌────────────────────────┐
│ • SMS OTP              │───▶ Proves phone ownership
│ • Firebase managed     │───▶ Industry standard
│ • Rate limited         │───▶ Prevents abuse
└────────────────────────┘

Layer 2: Firebase Token
┌────────────────────────┐
│ • JWT signed by Google │───▶ Cannot be forged
│ • 1-hour expiry        │───▶ Limited validity
│ • Contains user claims │───▶ Verifiable identity
└────────────────────────┘

Layer 3: Admin Credentials
┌────────────────────────┐
│ • Username/Password    │───▶ Admin-specific
│ • Backend validates    │───▶ Role verification
│ • Requires both layers │───▶ Two-factor approach
└────────────────────────┘

Layer 4: Backend Token
┌────────────────────────┐
│ • Generated post-auth  │───▶ Session management
│ • Stored securely      │───▶ AsyncStorage
│ • Used for API calls   │───▶ Authorization
└────────────────────────┘
```

---

**Note**: This is a high-level visual representation of the authentication flow. For implementation details, see the source code and other documentation files.
