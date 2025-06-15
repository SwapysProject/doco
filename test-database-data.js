const { MongoClient } = require("mongodb");

async function testDatabaseData() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("Patient");

    // Check patients
    const patientsCount = await db.collection("patients").countDocuments();
    const patients = await db
      .collection("patients")
      .find({})
      .limit(3)
      .toArray();
    console.log(`\n📊 PATIENTS DATA:`);
    console.log(`Total patients: ${patientsCount}`);
    console.log("Sample patients:", JSON.stringify(patients, null, 2));

    // Check appointments
    const appointmentsCount = await db
      .collection("appointments")
      .countDocuments();
    const appointments = await db
      .collection("appointments")
      .find({})
      .limit(3)
      .toArray();
    console.log(`\n📅 APPOINTMENTS DATA:`);
    console.log(`Total appointments: ${appointmentsCount}`);
    console.log("Sample appointments:", JSON.stringify(appointments, null, 2));

    // Check prescriptions
    const prescriptionsCount = await db
      .collection("prescriptions")
      .countDocuments();
    const prescriptions = await db
      .collection("prescriptions")
      .find({})
      .limit(3)
      .toArray();
    console.log(`\n💊 PRESCRIPTIONS DATA:`);
    console.log(`Total prescriptions: ${prescriptionsCount}`);
    console.log(
      "Sample prescriptions:",
      JSON.stringify(prescriptions, null, 2)
    );

    // Check messages
    const messagesCount = await db.collection("messages").countDocuments();
    console.log(`\n💬 MESSAGES: ${messagesCount}`);

    // Check notifications
    const notificationsCount = await db
      .collection("notifications")
      .countDocuments();
    console.log(`\n🔔 NOTIFICATIONS: ${notificationsCount}`);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(
      `\n📂 ALL COLLECTIONS:`,
      collections.map((c) => c.name)
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

testDatabaseData().catch(console.error);
