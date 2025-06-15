const { MongoClient } = require("mongodb");

// Use the actual MongoDB URI from your .env.local
const uri =
  "mongodb+srv://doc2025:4VyNMAvQtApjqJP7@doc.clwfyfj.mongodb.net/Patient?retryWrites=true&w=majority&appName=doc";

async function listDoctorsFromAtlas() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB Atlas!");

    const db = client.db("Patient");

    // List all collections first
    const collections = await db.listCollections().toArray();
    console.log("\nCollections in the Patient database:");
    collections.forEach((collection) => {
      console.log(`- ${collection.name}`);
    });

    // Check the doctors collection
    const doctorsCollection = db.collection("doctors");
    const allDoctors = await doctorsCollection.find({}).toArray();

    console.log(`\nFound ${allDoctors.length} doctors in your Atlas database:`);

    if (allDoctors.length > 0) {
      allDoctors.forEach((doctor, index) => {
        console.log(`\n${index + 1}. Doctor:`);
        console.log(
          `   Name: ${doctor.name || doctor.firstName + " " + doctor.lastName}`
        );
        console.log(`   Email: ${doctor.email}`);
        console.log(`   ID: ${doctor._id}`);
        console.log(`   Specialization: ${doctor.specialization || "N/A"}`);
        console.log(`   Role: ${doctor.role || "doctor"}`);
        console.log(`   Active: ${doctor.isActive !== false ? "Yes" : "No"}`);
        console.log(`   Online: ${doctor.isOnline ? "Yes" : "No"}`);
      });
    } else {
      console.log("No doctors found in the Atlas database.");
    }

    await client.close();
    console.log("\nConnection closed.");
  } catch (error) {
    console.error("Error connecting to Atlas:", error);
  }
}

listDoctorsFromAtlas();
