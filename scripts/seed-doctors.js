const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

async function seedDoctors() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("Patient");
    const doctorsCollection = db.collection("doctors"); // Clear existing doctors for fresh seed
    await doctorsCollection.deleteMany({});
    console.log("Cleared existing doctors");

    // Check if doctors already exist
    const existingCount = await doctorsCollection.countDocuments();
    console.log(`Found ${existingCount} existing doctors in database`);

    if (existingCount === 0) {
      console.log("No doctors found. Seeding database with sample doctors...");
      const sampleDoctors = [
        {
          firstName: "John",
          lastName: "Smith",
          name: "Dr. John Smith",
          email: "john.smith@hospital.com",
          password: await bcrypt.hash("password123", 10),
          specialization: "Cardiology",
          role: "doctor",
          isActive: true,
          isOnline: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          firstName: "Sarah",
          lastName: "Johnson",
          name: "Dr. Sarah Johnson",
          email: "sarah.johnson@hospital.com",
          password: await bcrypt.hash("password123", 10),
          specialization: "Pediatrics",
          role: "doctor",
          isActive: true,
          isOnline: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          firstName: "Michael",
          lastName: "Chen",
          name: "Dr. Michael Chen",
          email: "michael.chen@hospital.com",
          password: await bcrypt.hash("password123", 10),
          specialization: "Neurology",
          role: "doctor",
          isActive: true,
          isOnline: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          firstName: "Emily",
          lastName: "Davis",
          name: "Dr. Emily Davis",
          email: "emily.davis@hospital.com",
          password: await bcrypt.hash("password123", 10),
          specialization: "Orthopedics",
          role: "doctor",
          isActive: true,
          isOnline: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          firstName: "David",
          lastName: "Wilson",
          name: "Dr. David Wilson",
          email: "david.wilson@hospital.com",
          password: await bcrypt.hash("password123", 10),
          specialization: "Emergency Medicine",
          role: "doctor",
          isActive: true,
          isOnline: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Demo doctor with easy credentials
        {
          firstName: "Demo",
          lastName: "Doctor",
          name: "Dr. Demo Doctor",
          email: "dr.demo@doctorcare.com",
          password: await bcrypt.hash("demo123", 10),
          specialization: "General Practice",
          role: "doctor",
          isActive: true,
          isOnline: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = await doctorsCollection.insertMany(sampleDoctors);
      console.log(`Successfully seeded ${result.insertedCount} doctors`);
    } else {
      console.log("Doctors already exist. Skipping seeding.");
    }

    // Show current doctors
    const allDoctors = await doctorsCollection
      .find({}, { projection: { password: 0 } })
      .toArray();
    console.log("\nCurrent doctors in database:");
    allDoctors.forEach((doctor, index) => {
      console.log(
        `${index + 1}. ${doctor.name} (${doctor.specialization}) - ${
          doctor.email
        }`
      );
    });

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding doctors:", error);
    process.exit(1);
  }
}

seedDoctors();
