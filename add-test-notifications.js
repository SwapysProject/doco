// Script to add some real notifications for testing
require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

async function addTestNotifications() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("Patient");
    const collection = db.collection("notifications"); // Use a real doctor ID from the system
    const doctorId = "684f02f3d49f51956fddec7f"; // Dr. Demo Doctor

    const testNotifications = [
      {
        doctorId: doctorId,
        type: "patient_added",
        title: "New Patient Added",
        message: "Alice Smith has been added to your patient list",
        patientId: "P001",
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        doctorId: doctorId,
        type: "lab_results",
        title: "Lab Results Available",
        message: "Blood work results for Bob Johnson are ready for review",
        patientId: "P002",
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        doctorId: doctorId,
        type: "appointment_scheduled",
        title: "Appointment Scheduled",
        message:
          "New appointment scheduled with Carol Wilson for tomorrow at 2:00 PM",
        patientId: "P003",
        appointmentId: "apt_001",
        isRead: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        updatedAt: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        doctorId: doctorId,
        type: "prescription_renewal",
        title: "Prescription Renewal Request",
        message:
          "David Brown has requested renewal for his blood pressure medication",
        patientId: "P004",
        prescriptionId: "rx_001",
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        doctorId: doctorId,
        type: "appointment_cancelled",
        title: "Appointment Cancelled",
        message: "Emma Davis has cancelled her appointment scheduled for today",
        patientId: "P005",
        appointmentId: "apt_002",
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        doctorId: doctorId,
        type: "patient_assigned",
        title: "Patient Assigned",
        message: "Frank Miller has been assigned to your care",
        patientId: "P006",
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ];

    const result = await collection.insertMany(testNotifications);
    console.log(
      `✅ Successfully added ${result.insertedCount} test notifications`
    );

    // Show the notifications
    const notifications = await collection
      .find({ doctorId: doctorId })
      .sort({ createdAt: -1 })
      .toArray();
    console.log("\n📋 Current notifications:");
    notifications.forEach((notif, index) => {
      console.log(
        `${index + 1}. ${notif.title} - ${notif.isRead ? "✅ Read" : "🔔 Unread"}`
      );
    });
  } catch (error) {
    console.error("❌ Error adding test notifications:", error);
  } finally {
    await client.close();
  }
}

addTestNotifications();
