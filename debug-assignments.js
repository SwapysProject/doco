// Check doctor ID mismatch issue
require("dotenv").config({ path: ".env.local" });
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI;

async function checkDoctorAssignments() {
  const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  });

  try {
    await client.connect();
    const db = client.db("Patient");

    // Get all doctors
    const doctors = await db.collection("doctors").find({}).toArray();
    console.log("👨‍⚕️ Doctors in database:");
    doctors.forEach((doc) => {
      console.log(`  - _id: ${doc._id}`);
      console.log(`    doctorId: ${doc.doctorId}`);
      console.log(`    name: ${doc.name}`);
      console.log(`    email: ${doc.email}`);
      console.log("");
    });

    // Get all assignments
    const assignments = await db
      .collection("doctor_patient_assignments")
      .find({})
      .toArray();
    console.log("🔗 Doctor-Patient Assignments:");
    assignments.forEach((assignment) => {
      console.log(`  - doctorId: ${assignment.doctorId}`);
      console.log(`    patientId: ${assignment.patientId}`);
      console.log("");
    });

    // Check if assignment doctorIds match doctor _ids or doctorIds
    console.log("🔍 ID Matching Analysis:");
    assignments.forEach((assignment, index) => {
      const matchingDoctor = doctors.find(
        (doc) =>
          doc._id.toString() === assignment.doctorId ||
          doc.doctorId === assignment.doctorId
      );

      console.log(`Assignment ${index + 1}:`);
      console.log(`  doctorId in assignment: ${assignment.doctorId}`);
      console.log(
        `  matching doctor: ${matchingDoctor ? matchingDoctor.name : "NOT FOUND"}`
      );

      if (matchingDoctor) {
        console.log(`  doctor._id: ${matchingDoctor._id}`);
        console.log(`  doctor.doctorId: ${matchingDoctor.doctorId}`);
      }
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

checkDoctorAssignments();
