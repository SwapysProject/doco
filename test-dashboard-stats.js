// Test script for dashboard stats API
const { MongoClient } = require("mongodb");

async function testDashboardStats() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("Patient");

    // Test doctor ID (you can change this to match your test data)
    const testDoctorId = "dr_123";

    // Get current date for today's calculations
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    console.log("Testing with doctorId:", testDoctorId);
    console.log("Today range:", todayStart, "to", todayEnd);

    // Test queries
    const totalPatients = await db.collection("patients").countDocuments({
      doctorId: testDoctorId,
      status: { $ne: "inactive" },
    });

    const todaysAppointments = await db
      .collection("appointments")
      .countDocuments({
        doctorId: testDoctorId,
        appointmentDate: {
          $gte: todayStart,
          $lt: todayEnd,
        },
      });

    const criticalPatients = await db.collection("patients").countDocuments({
      doctorId: testDoctorId,
      $or: [
        { condition: /critical|emergency|urgent/i },
        { status: "critical" },
      ],
    });

    const stablePatients = await db.collection("patients").countDocuments({
      doctorId: testDoctorId,
      $or: [{ condition: /stable|recovered|good/i }, { status: "stable" }],
    });

    console.log("\nResults:");
    console.log("Total Patients:", totalPatients);
    console.log("Today's Appointments:", todaysAppointments);
    console.log("Critical Patients:", criticalPatients);
    console.log("Stable Patients:", stablePatients);

    // Check what patients actually exist
    const allPatients = await db
      .collection("patients")
      .find({ doctorId: testDoctorId })
      .toArray();
    console.log("\nAll patients for this doctor:");
    allPatients.forEach((patient) => {
      console.log(
        `- ${patient.name} (${patient.email}) - Status: ${patient.status}, Condition: ${patient.condition}`
      );
    });

    const allAppointments = await db
      .collection("appointments")
      .find({ doctorId: testDoctorId })
      .toArray();
    console.log("\nAll appointments for this doctor:");
    allAppointments.forEach((appointment) => {
      console.log(
        `- ${appointment.patientName} on ${appointment.appointmentDate} - Status: ${appointment.status}`
      );
    });

    await client.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

testDashboardStats();
