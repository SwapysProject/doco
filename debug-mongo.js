// Test MongoDB Atlas connection and check patient data
require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

async function debugDatabase() {
  if (!uri) {
    console.error("❌ MONGODB_URI not found in environment");
    return;
  }

  console.log("🔗 Connecting to MongoDB Atlas...");
  console.log("📍 Database: Patient");

  const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  });

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("Patient");

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log("\n📋 Available collections:");
    collections.forEach((col) => console.log(`  - ${col.name}`));

    // Check patients collection
    const patientsCollection = db.collection("patients");
    const patientCount = await patientsCollection.countDocuments();
    console.log(`\n👥 Total patients in collection: ${patientCount}`);

    if (patientCount > 0) {
      console.log("\n📄 Sample patients:");
      const samplePatients = await patientsCollection
        .find({})
        .limit(5)
        .toArray();
      samplePatients.forEach((patient, index) => {
        console.log(`\nPatient ${index + 1}:`);
        console.log(`  ID: ${patient._id}`);
        console.log(
          `  Name: ${patient.firstName} ${patient.lastName} (${patient.name || "no name field"})`
        );
        console.log(`  Phone: ${patient.phone || "no phone"}`);
        console.log(`  Email: ${patient.email || "no email"}`);
        console.log(`  Doctor ID: ${patient.doctorId || "not assigned"}`);
      });
    }

    // Check doctor_patient_assignments collection
    const assignmentsCollection = db.collection("doctor_patient_assignments");
    const assignmentCount = await assignmentsCollection.countDocuments();
    console.log(`\n🔗 Total doctor-patient assignments: ${assignmentCount}`);

    if (assignmentCount > 0) {
      console.log("\n📄 Sample assignments:");
      const sampleAssignments = await assignmentsCollection
        .find({})
        .limit(5)
        .toArray();
      sampleAssignments.forEach((assignment, index) => {
        console.log(`\nAssignment ${index + 1}:`);
        console.log(`  Doctor ID: ${assignment.doctorId}`);
        console.log(`  Patient ID: ${assignment.patientId}`);
        console.log(`  Assigned Date: ${assignment.assignedDate}`);
      });
    }

    // Check doctors collection
    const doctorsCollection = db.collection("doctors");
    const doctorCount = await doctorsCollection.countDocuments();
    console.log(`\n👨‍⚕️ Total doctors: ${doctorCount}`);

    if (doctorCount > 0) {
      console.log("\n📄 Sample doctors:");
      const sampleDoctors = await doctorsCollection.find({}).limit(3).toArray();
      sampleDoctors.forEach((doctor, index) => {
        console.log(`\nDoctor ${index + 1}:`);
        console.log(`  ID: ${doctor._id}`);
        console.log(`  Doctor ID: ${doctor.doctorId || "no doctorId"}`);
        console.log(`  Name: ${doctor.name || "no name"}`);
        console.log(`  Email: ${doctor.email || "no email"}`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

debugDatabase();
