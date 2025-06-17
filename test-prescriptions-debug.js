require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function testPrescriptions() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log("Using MongoDB URI:", uri ? "✅ Found" : "❌ Missing");

    if (!uri) {
      console.error("❌ MONGODB_URI not found in environment");
      return;
    }

    const client = new MongoClient(uri);
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("Patient");

    // Check all collections
    const collections = await db.listCollections().toArray();
    console.log(
      "📚 Available collections:",
      collections.map((c) => c.name)
    );

    // Check prescriptions specifically
    const prescriptionsCount = await db
      .collection("prescriptions")
      .countDocuments();
    console.log(`💊 Total prescriptions: ${prescriptionsCount}`);

    if (prescriptionsCount > 0) {
      // Get recent prescriptions
      const recentPrescriptions = await db
        .collection("prescriptions")
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();

      console.log("🔍 Recent prescriptions:");
      recentPrescriptions.forEach((p, i) => {
        console.log(`  ${i + 1}. ID: ${p._id}`);
        console.log(`     Patient: ${p.patientName} (${p.patientId})`);
        console.log(`     Doctor: ${p.doctorName} (${p.doctorId})`);
        console.log(`     Date: ${p.createdAt || p.date}`);
        console.log(`     Status: ${p.status}`);
        console.log("");
      });
    } else {
      console.log("📝 No prescriptions found in database");
    }

    // Check doctors
    const doctorsCount = await db.collection("doctors").countDocuments();
    console.log(`👨‍⚕️ Total doctors: ${doctorsCount}`);

    if (doctorsCount > 0) {
      const doctors = await db
        .collection("doctors")
        .find({})
        .limit(3)
        .toArray();
      console.log("🔍 Sample doctors:");
      doctors.forEach((d) => {
        console.log(`  - ${d.name} (ID: ${d._id}) - Email: ${d.email}`);
      });
    }

    // Check patient assignments
    const assignmentsCount = await db
      .collection("patient_assignments")
      .countDocuments();
    console.log(`🔗 Total patient assignments: ${assignmentsCount}`);

    if (assignmentsCount > 0) {
      const assignments = await db
        .collection("patient_assignments")
        .find({})
        .limit(5)
        .toArray();
      console.log("🔍 Sample assignments:");
      assignments.forEach((a) => {
        console.log(`  - Patient: ${a.patientId} → Doctor: ${a.doctorId}`);
      });
    }

    await client.close();
    console.log("✅ Database test completed");
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
  }
}

testPrescriptions();
