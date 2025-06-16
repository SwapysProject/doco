const { MongoClient } = require("mongodb");

async function debugPatients() {
  const client = new MongoClient(
    "mongodb+srv://mohanreddy4480:mongodb%40123@cluster0.xvbnc.mongodb.net/Patient?retryWrites=true&w=majority"
  );

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("Patient");

    // Check patients collection
    const patientsCollection = db.collection("patients");
    const allPatients = await patientsCollection.find({}).toArray();
    console.log("\n=== ALL PATIENTS ===");
    console.log("Total patients:", allPatients.length);
    allPatients.forEach((patient, index) => {
      console.log(`Patient ${index + 1}:`, {
        _id: patient._id,
        name: patient.name,
        firstName: patient.firstName,
        lastName: patient.lastName,
        doctorId: patient.doctorId,
        email: patient.email,
        phone: patient.phone,
      });
    });

    // Check doctor-patient assignments
    const assignmentsCollection = db.collection("doctor_patient_assignments");
    const allAssignments = await assignmentsCollection.find({}).toArray();
    console.log("\n=== DOCTOR-PATIENT ASSIGNMENTS ===");
    console.log("Total assignments:", allAssignments.length);
    allAssignments.forEach((assignment, index) => {
      console.log(`Assignment ${index + 1}:`, {
        _id: assignment._id,
        doctorId: assignment.doctorId,
        patientId: assignment.patientId,
        assignedAt: assignment.assignedAt,
      });
    });

    // Check doctors collection
    const doctorsCollection = db.collection("doctors");
    const allDoctors = await doctorsCollection.find({}).toArray();
    console.log("\n=== ALL DOCTORS ===");
    console.log("Total doctors:", allDoctors.length);
    allDoctors.forEach((doctor, index) => {
      console.log(`Doctor ${index + 1}:`, {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        doctorId: doctor.doctorId,
      });
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

debugPatients();
