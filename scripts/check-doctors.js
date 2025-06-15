const { MongoClient } = require("mongodb");

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

async function checkDoctors() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("Patient");
    const doctorsCollection = db.collection("doctors");

    // Get all doctors
    const allDoctors = await doctorsCollection
      .find({}, { projection: { password: 0 } })
      .toArray();

    console.log("\nCurrent doctors in database:");
    console.log(`Total count: ${allDoctors.length}`);
    allDoctors.forEach((doctor, index) => {
      console.log(
        `${index + 1}. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization}) - ${doctor.email}`
      );
    });

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("Error checking doctors:", error);
    process.exit(1);
  }
}

checkDoctors();
