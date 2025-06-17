// Test script to demonstrate real notifications functionality
// Run this script to see how notifications are created for various events

const BASE_URL = "http://localhost:3000";

// Function to make authenticated requests (you'll need to replace with actual auth)
async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Add your authentication headers here
      ...options.headers,
    },
  });

  const data = await response.json();
  return { status: response.status, data };
}

// Test creating notifications through various actions
async function testNotifications() {
  console.log("🧪 Testing Real Notifications System");
  console.log("=====================================\n");

  try {
    // 1. Test adding a new patient (should create 'patient_added' notification)
    console.log("1️⃣ Adding a new patient...");
    const newPatient = {
      firstName: "John",
      lastName: "Doe",
      email: `john.doe.${Date.now()}@example.com`,
      phone: `+1-555-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      dateOfBirth: "1980-01-15",
      gender: "male",
      medicalHistory: ["Hypertension"],
      allergies: ["Penicillin"],
      status: "active",
    };

    const patientResult = await makeRequest("/api/patients-data", {
      method: "POST",
      body: JSON.stringify(newPatient),
    });

    if (patientResult.status === 201) {
      console.log("✅ Patient added successfully!");
      console.log(`   Patient ID: ${patientResult.data.patientId}`);
      console.log('   → This should create a "patient_added" notification\n');
    } else {
      console.log("❌ Failed to add patient:", patientResult.data.message);
    }

    // 2. Test creating a new appointment (should create 'appointment_scheduled' notification)
    console.log("2️⃣ Scheduling a new appointment...");
    const appointment = {
      patientId: patientResult.data.patientId || "P001",
      patientName: "John Doe",
      patientPhone: "+1-555-0123",
      patientEmail: "john.doe@example.com",
      appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // Tomorrow
      appointmentTime: "10:00",
      type: "consultation",
      reason: "Regular checkup",
      duration: 30,
    };

    const appointmentResult = await makeRequest("/api/appointments", {
      method: "POST",
      body: JSON.stringify(appointment),
    });

    if (appointmentResult.status === 201) {
      console.log("✅ Appointment scheduled successfully!");
      console.log(`   Appointment ID: ${appointmentResult.data.appointmentId}`);
      console.log(
        '   → This should create an "appointment_scheduled" notification\n'
      );
    } else {
      console.log(
        "❌ Failed to schedule appointment:",
        appointmentResult.data.message
      );
    }

    // 3. Test creating a prescription (should create 'prescription_created' notification)
    console.log("3️⃣ Creating a new prescription...");
    const prescription = {
      patientId: patientResult.data.patientId || "P001",
      patientName: "John Doe",
      medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          duration: "30 days",
        },
      ],
      diagnosis: "Hypertension management",
      notes: "Take with food",
      status: "active",
    };

    const prescriptionResult = await makeRequest("/api/prescriptions", {
      method: "POST",
      body: JSON.stringify(prescription),
    });

    if (prescriptionResult.status === 200) {
      console.log("✅ Prescription created successfully!");
      console.log(`   Prescription ID: ${prescriptionResult.data.insertedId}`);
      console.log(
        '   → This should create a "prescription_created" notification\n'
      );
    } else {
      console.log(
        "❌ Failed to create prescription:",
        prescriptionResult.data.error
      );
    }

    // 4. Test adding lab results (should create 'lab_results' notification)
    console.log("4️⃣ Adding lab results...");
    const labResults = {
      patientId: patientResult.data.patientId || "P001",
      patientName: "John Doe",
      testName: "Complete Blood Count",
      testType: "blood",
      results: "Within normal limits",
      normalRange: "4.5-11.0 x10³/µL",
      unit: "x10³/µL",
      priority: "normal",
      notes: "No abnormalities detected",
    };

    const labResult = await makeRequest("/api/lab-results", {
      method: "POST",
      body: JSON.stringify(labResults),
    });

    if (labResult.status === 201) {
      console.log("✅ Lab results added successfully!");
      console.log(`   Lab Result ID: ${labResult.data.labResultId}`);
      console.log('   → This should create a "lab_results" notification\n');
    } else {
      console.log("❌ Failed to add lab results:", labResult.data.message);
    }

    // 5. Check notifications
    console.log("5️⃣ Fetching notifications...");
    const notificationsResult = await makeRequest("/api/notifications");

    if (notificationsResult.status === 200) {
      console.log("✅ Notifications fetched successfully!");
      console.log(
        `   Total unread notifications: ${notificationsResult.data.notifications.length}`
      );

      if (notificationsResult.data.notifications.length > 0) {
        console.log("   Recent notifications:");
        notificationsResult.data.notifications
          .slice(0, 3)
          .forEach((notification, index) => {
            console.log(
              `     ${index + 1}. ${notification.title}: ${notification.message}`
            );
            console.log(
              `        Type: ${notification.type} | Created: ${new Date(notification.createdAt).toLocaleString()}`
            );
          });
      }
    } else {
      console.log(
        "❌ Failed to fetch notifications:",
        notificationsResult.data.message
      );
    }

    console.log("\n🎉 Notification testing completed!");
    console.log("💡 Check your dashboard header to see the new notifications.");
    console.log(
      "📱 The notification bell should show the count of unread notifications."
    );
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }
}

// Export for use in browser console or Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = { testNotifications };
} else {
  // Browser environment
  window.testNotifications = testNotifications;
}

console.log("🔧 Notification Test Script Loaded");
console.log("📞 Call testNotifications() to run the tests");
console.log(
  "⚠️  Make sure you are logged in and the server is running on localhost:3000"
);
