const { MongoClient } = require("mongodb");

async function testConnection() {
  try {
    const uri =
      "mongodb+srv://mohanvarma:Mohan123@cluster0.ik5xj.mongodb.net/Patient?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("Patient");

    // Check collections
    const collections = await db.listCollections().toArray();
    console.log(
      "📚 Available collections:",
      collections.map((c) => c.name)
    );

    // Check patients
    const patientsCount = await db.collection("patients").countDocuments();
    console.log(`👥 Total patients: ${patientsCount}`);

    if (patientsCount > 0) {
      const samplePatients = await db
        .collection("patients")
        .find({})
        .limit(3)
        .toArray();
      console.log("🔍 Sample patients:");
      samplePatients.forEach((patient) => {
        console.log(
          `  - ${patient.name} (ID: ${patient.patientId || patient.id}) - Doctor: ${patient.doctorId || "No doctor assigned"}`
        );
      });
    }

    // Check appointments
    const appointmentsCount = await db
      .collection("appointments")
      .countDocuments();
    console.log(`📅 Total appointments: ${appointmentsCount}`);

    if (appointmentsCount > 0) {
      const sampleAppointments = await db
        .collection("appointments")
        .find({})
        .limit(3)
        .toArray();
      console.log("🔍 Sample appointments:");
      sampleAppointments.forEach((appointment) => {
        console.log(
          `  - ${appointment.patientName} on ${appointment.appointmentDate} - Doctor: ${appointment.doctorId || "No doctor assigned"}`
        );
      });
    }

    await client.close();
    console.log("✅ Test completed successfully");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testConnection();
