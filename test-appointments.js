// Test script to check appointments API
const { MongoClient } = require("mongodb");

async function testAppointments() {
  const uri =
    "mongodb+srv://doc2025:4VyNMAvQtApjqJP7@doc.clwfyfj.mongodb.net/Patient?retryWrites=true&w=majority&appName=doc";

  const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("Patient");
    const appointmentsCollection = db.collection("appointments");

    // Check if appointments collection exists and has data
    const count = await appointmentsCollection.countDocuments();
    console.log(`Total appointments in database: ${count}`);

    // Get the latest 5 appointments
    const appointments = await appointmentsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    console.log("Latest appointments:");
    appointments.forEach((apt) => {
      console.log(
        `- ${apt.appointmentId}: ${apt.patientName} on ${apt.appointmentDate} at ${apt.appointmentTime}`
      );
    });

    // Test creating a new appointment
    const testAppointment = {
      appointmentId: `APT${String(count + 1).padStart(4, "0")}`,
      doctorId: "DOC001", // Test doctor ID
      patientId: "PAT001",
      patientName: "Test Patient",
      patientPhone: "123-456-7890",
      patientEmail: "test@example.com",
      appointmentDate: new Date(),
      appointmentTime: "10:00",
      type: "consultation",
      reason: "Test appointment",
      status: "scheduled",
      notes: "This is a test appointment",
      duration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await appointmentsCollection.insertOne(testAppointment);
    console.log(`\nTest appointment created with ID: ${result.insertedId}`);

    // Verify the appointment was saved
    const savedAppointment = await appointmentsCollection.findOne({
      _id: result.insertedId,
    });
    console.log("Saved appointment:", savedAppointment);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

testAppointments();
