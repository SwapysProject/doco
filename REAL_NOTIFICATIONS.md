# Real Notification System Documentation

## Overview

The doctor care system now includes a comprehensive real-time notification system that automatically creates notifications for various medical events. This replaces the previous hardcoded notifications with dynamic, event-driven notifications stored in the database.

## Notification Types

### 1. **Patient Added** (`patient_added`)

- **Trigger**: When a new patient is added to the system
- **API**: `POST /api/patients-data`
- **Icon**: 👤
- **Color**: Blue
- **Example**: "John Doe has been added to your patient list"

### 2. **Patient Assigned** (`patient_assigned`)

- **Trigger**: When a patient is reassigned to a doctor
- **API**: `POST /api/patient-assignment`
- **Icon**: 📋
- **Color**: Green
- **Example**: "Jane Smith has been assigned to your care"

### 3. **Prescription Created** (`prescription_created`)

- **Trigger**: When a new prescription is created
- **API**: `POST /api/prescriptions`
- **Icon**: 💊
- **Color**: Purple
- **Example**: "Prescription created for John Doe - Lisinopril, Metformin"

### 4. **Prescription Renewal** (`prescription_renewal`)

- **Trigger**: When a prescription is renewed
- **API**: `POST /api/prescription-renewal`
- **Icon**: 🔄
- **Color**: Orange
- **Example**: "Prescription renewed for Jane Smith - Blood pressure medications"

### 5. **Appointment Scheduled** (`appointment_scheduled`)

- **Trigger**: When a new appointment is created
- **API**: `POST /api/appointments`
- **Icon**: 📅
- **Color**: Indigo
- **Example**: "Appointment with John Doe scheduled for 12/17/2025 at 10:00 AM"

### 6. **Appointment Cancelled** (`appointment_cancelled`)

- **Trigger**: When an appointment status is changed to 'cancelled'
- **API**: `PUT /api/appointments`
- **Icon**: ❌
- **Color**: Red
- **Example**: "Appointment with Jane Smith on 12/18/2025 has been cancelled"

### 7. **Lab Results** (`lab_results`)

- **Trigger**: When lab results are added
- **API**: `POST /api/lab-results`
- **Icon**: 🧪
- **Color**: Yellow
- **Example**: "Complete Blood Count results for John Doe are ready for review"

## Technical Implementation

### Backend Components

1. **Notification Utility** (`src/lib/notifications.ts`)

   - `createNotification()`: Creates new notifications in database
   - `getNotificationCount()`: Gets unread notification count
   - `getNotificationIcon()`: Returns appropriate icon for notification type
   - `getNotificationColor()`: Returns appropriate color for notification type

2. **Notification API** (`src/app/api/notifications/route.ts`)

   - `GET`: Fetch notifications for the current doctor
   - `POST`: Mark specific notification as read
   - `PUT`: Mark all notifications as read

3. **Event Integration**: All relevant APIs now include notification creation:
   - Patient management APIs
   - Appointment APIs
   - Prescription APIs
   - Lab results APIs
   - Patient assignment APIs

### Frontend Components

1. **Notification Hook** (`src/hooks/useNotifications.ts`)

   - Manages notification state
   - Handles fetching, marking as read
   - Provides real-time polling (every 30 seconds)

2. **Dashboard Header** (`src/components/dashboard/dashboard-header.tsx`)
   - Displays notification bell with count
   - Shows notification dropdown
   - Handles mark as read actions

## Database Schema

### Notifications Collection (`notifications`)

```javascript
{
  _id: ObjectId,
  doctorId: String,           // ID of the doctor receiving the notification
  type: String,               // One of the notification types above
  title: String,              // Short title (e.g., "New Patient Added")
  message: String,            // Detailed message
  patientId: String,          // Optional: Related patient ID
  appointmentId: String,      // Optional: Related appointment ID
  prescriptionId: String,     // Optional: Related prescription ID
  isRead: Boolean,            // Whether the notification has been read
  createdAt: Date,            // When the notification was created
  updatedAt: Date             // When the notification was last updated
}
```

## Usage Examples

### Creating a New Patient (Automatic Notification)

```javascript
// POST /api/patients-data
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0123",
  // ... other patient data
}

// Automatically creates notification:
// "John Doe has been added to your patient list"
```

### Scheduling an Appointment (Automatic Notification)

```javascript
// POST /api/appointments
{
  "patientId": "P001",
  "patientName": "John Doe",
  "appointmentDate": "2025-06-18",
  "appointmentTime": "10:00",
  "type": "consultation"
}

// Automatically creates notification:
// "Appointment with John Doe scheduled for 6/18/2025 at 10:00"
```

### Fetching Notifications

```javascript
// GET /api/notifications
// Returns array of unread notifications for the current doctor
```

### Marking Notification as Read

```javascript
// POST /api/notifications
{
  "notificationId": "notification_id_here"
}
```

## Testing

Use the provided test script (`test-notifications.js`) to verify the notification system:

1. Load the script in your browser console or run with Node.js
2. Call `testNotifications()` to simulate various events
3. Check the dashboard header for new notifications
4. Verify notifications appear in the dropdown

## Real-time Features

- **Automatic Creation**: Notifications are created automatically when events occur
- **Polling**: Frontend polls for new notifications every 30 seconds
- **Visual Indicators**: Bell icon shows count of unread notifications
- **Categorization**: Different icons and colors for different types
- **Persistence**: All notifications are stored in the database
- **User Actions**: Users can mark individual notifications or all notifications as read

## Benefits

1. **Real-time Awareness**: Doctors are immediately notified of important events
2. **Audit Trail**: All notifications are stored and can be reviewed
3. **Customizable**: Easy to add new notification types
4. **Professional**: Replaces hardcoded demo data with real, relevant information
5. **User Experience**: Clear, organized notifications improve workflow

## Future Enhancements

- Push notifications for critical events
- Email notifications for important alerts
- Notification preferences and filtering
- Notification scheduling and reminders
- Integration with external systems
- Mobile app notifications
