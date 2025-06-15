const { MongoClient } = require("mongodb");

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

async function checkDoctors() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("Patient"); // Using existing database name "Patient"
    const doctorsCollection = db.collection("doctors");

    // Check existing doctors
    const existingDoctors = await doctorsCollection
      .find({}, { projection: { password: 0 } })
      .toArray();

    console.log(
      `\nFound ${existingDoctors.length} doctors in the "Patient" database:`
    );
    existingDoctors.forEach((doctor, index) => {
      console.log(
        `${index + 1}. Name: ${doctor.name || doctor.firstName + " " + doctor.lastName || "No name"}`
      );
      console.log(`   Email: ${doctor.email}`);
      console.log(
        `   Specialization: ${doctor.specialization || "Not specified"}`
      );
      console.log(`   ID: ${doctor._id}`);
      console.log(`   Created: ${doctor.createdAt || "Not specified"}`);
      console.log(`   Active: ${doctor.isActive !== false}`);
      console.log("---");
    });

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("Error checking doctors:", error);
    process.exit(1);
  }
}

checkDoctors();
