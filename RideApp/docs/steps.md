# Step-by-Step Implementation Guide for Driver System

Based on your complete backend documentation, here's the implementation roadmap for the driver system.

## 🔧 Backend Updates Required

### 1. Update Network Configuration
✅ **DONE** - IP address updated to `192.168.96.247:3000`

### 2. Missing Driver Endpoints to Implement

Your documentation shows these endpoints, but they need to be created in your backend:

#### **Required Routes to Add:**

1. **`GET /driver/stats`** - Driver statistics
   ```javascript
   // Response format your frontend expects:
   {
     "success": true,
     "data": {
       "totalRides": 150,
       "todayRides": 5,
       "todayEarnings": 1250,
       "weeklyRides": 23,
       "weeklyEarnings": 5750,
       "monthlyEarnings": 18500,
       "rating": 4.7
     }
   }
   ```

2. **`GET /driver/profile`** - Driver profile
   ```javascript
   // Response format:
   {
     "success": true,
     "data": {
       "_id": "driver_id",
       "name": "Dr. John EMT",
       "email": "john.emt@hospital.com",
       "phone": "+1234567890",
       "role": "driver",
       "isOnline": true,
       "vehicle": {
         "type": "advancedAmbulance",
         "plateNumber": "AMB123",
         "model": "Mercedes Sprinter",
         "licenseNumber": "EMT-123456",
         "certificationLevel": "EMT-Paramedic"
       },
       "createdAt": "2021-07-21T10:30:00.000Z"
     }
   }
   ```

3. **`PUT /driver/online-status`** - Update driver availability
   ```javascript
   // Request body:
   { "isOnline": true }
   
   // Response:
   {
     "success": true,
     "message": "Driver is now online",
     "data": { "isOnline": true }
   }
   ```

### 3. Backend Implementation Steps

1. **Create `routes/driver.js`** file using the code provided in `docs/backend-driver-routes.js`

2. **Add to your main app.js**:
   ```javascript
   const driverRoutes = require('./routes/driver');
   app.use('/driver', driverRoutes);
   ```

3. **Ensure your models have required fields**:
   - **User Model**: `name`, `email`, `phone`, `role`, `isOnline`, `vehicle`
   - **Ride Model**: `driver`, `fare`, `status`, `rating`, `createdAt`

## 📱 Frontend Implementation Plan

### Phase 1: Driver Authentication & Profile Setup

1. **Create Driver Login Flow**
   - Phone number input
   - Role selection (driver)
   - JWT token storage

2. **Create Driver Profile Form**
   - Personal information (name, email)
   - Vehicle information (type, plate, model)
   - EMT certification details

3. **Create Profile Completion Flow**
   - Step-by-step form wizard
   - Validation for all fields
   - Profile submission

### Phase 2: Driver Dashboard Integration

1. **Real Data Integration**
   - Connect to `/driver/stats` endpoint
   - Connect to `/driver/profile` endpoint
   - Connect to `/driver/online-status` endpoint

2. **Dashboard Features**
   - Statistics display
   - Online/offline toggle
   - Profile management

### Phase 3: Driver Operations

1. **Available Rides System**
   - Connect to `/ride/driverrides` endpoint
   - Real-time ride offers
   - Accept/decline functionality

2. **Active Ride Management**
   - Status updates via `/ride/update/:rideId`
   - Real-time location tracking
   - Ride completion flow

## 🔄 Current vs Required State

### ✅ **What You Already Have:**
- Authentication system (`/auth/signin`, `/auth/profile`)
- Ride management system (`/ride/*` endpoints)
- Real-time Socket.IO communication
- User model with vehicle information
- Ride model with all required fields

### ❌ **What You Need to Add:**
- Driver statistics aggregation (`/driver/stats`)
- Driver-specific profile endpoint (`/driver/profile`)
- Online status management (`/driver/online-status`)

## 🎯 **Immediate Next Steps:**

1. **Backend**: Implement the 3 missing driver endpoints
2. **Frontend**: Create driver login and profile forms
3. **Testing**: Test the complete driver flow
4. **Integration**: Connect dashboard to real APIs

## 📝 **Validation Rules for Driver Profile:**

- **Name**: Required, minimum 2 characters
- **Email**: Valid email format (optional)
- **Phone**: Required, valid phone format
- **Vehicle Type**: Must be one of: `basicAmbulance`, `advancedAmbulance`, `icuAmbulance`, `airAmbulance`
- **Plate Number**: Required, 3-15 characters
- **License Number**: Required EMT license
- **Certification**: Must be one of: `EMT-Basic`, `EMT-Intermediate`, `EMT-Paramedic`, `Critical Care`

## 🔐 **Security Considerations:**

- All driver endpoints require JWT authentication
- Role-based access (only drivers can access `/driver/*` endpoints)
- Input validation and sanitization
- Secure token storage in frontend

## 📊 **Data Flow:**

```
1. Driver registers with phone + role="driver"
2. Driver completes profile with vehicle/certification info
3. Driver accesses dashboard with real statistics
4. Driver toggles online status
5. Driver receives ride offers
6. Driver accepts and manages rides
```

This guide will be updated as we implement each phase.



featured hospital, independent driver and hospital registered driver their fare will be calculated diffeently, als, bls, cct, auto ambulance, bike safety unit, area wise ambulance availability,