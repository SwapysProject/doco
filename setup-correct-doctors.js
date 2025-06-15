const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

async function setupCorrectDoctors() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("Patient");
    const doctorsCollection = db.collection("doctors");

    // Clear existing doctors
    const deleteResult = await doctorsCollection.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing doctors`);

    // Create only the two specified doctors
    const correctDoctors = [
      {
        name: "Dr. Swaps",
        firstName: "Swaps",
        lastName: "",
        email: "swaps@doctorcare.com",
        password: await bcrypt.hash("password123", 10),
        specialization: "General Medicine",
        role: "doctor",
        isActive: true,
        isOnline: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Dr. Swasthik Mohanty",
        firstName: "Swasthik",
        lastName: "Mohanty",
        email: "swasthik.mohanty@doctorcare.com",
        password: await bcrypt.hash("password123", 10),
        specialization: "Internal Medicine",
        role: "doctor",
        isActive: true,
        isOnline: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const insertResult = await doctorsCollection.insertMany(correctDoctors);
    console.log(`Successfully created ${insertResult.insertedCount} doctors`);

    // Show the created doctors
    const allDoctors = await doctorsCollection
      .find({}, { projection: { password: 0 } })
      .toArray();
    console.log("\nCreated doctors:");
    allDoctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name} - ${doctor.email}`);
      console.log(`   Specialization: ${doctor.specialization}`);
      console.log(`   Login: ${doctor.email} / password123`);
      console.log("---");
    });

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("Error setting up doctors:", error);
    process.exit(1);
  }
}

setupCorrectDoctors();
