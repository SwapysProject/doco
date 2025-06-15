const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

async function createSpecificDoctors() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("Patient");
    const doctorsCollection = db.collection("doctors");

    // Clear existing doctors
    console.log("Clearing existing doctors...");
    await doctorsCollection.deleteMany({});

    // Create the two specific doctors you mentioned
    console.log("Creating doctors 'swaps' and 'swasthik mohanty'...");

    const specificDoctors = [
      {
        firstName: "Swaps",
        lastName: "",
        name: "Dr. Swaps",
        email: "swaps@hospital.com",
        password: await bcrypt.hash("password123", 10),
        specialization: "General Medicine",
        role: "doctor",
        isActive: true,
        isOnline: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Swasthik",
        lastName: "Mohanty",
        name: "Dr. Swasthik Mohanty",
        email: "swasthik.mohanty@hospital.com",
        password: await bcrypt.hash("password123", 10),
        specialization: "General Medicine",
        role: "doctor",
        isActive: true,
        isOnline: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = await doctorsCollection.insertMany(specificDoctors);
    console.log(`Successfully created ${result.insertedCount} doctors`);

    // Show the created doctors
    const allDoctors = await doctorsCollection
      .find({}, { projection: { password: 0 } })
      .toArray();

    console.log("\nCurrent doctors in database:");
    allDoctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name} - ${doctor.email}`);
    });

    await client.close();
  } catch (error) {
    console.error("Error creating doctors:", error);
  }
}

createSpecificDoctors();
