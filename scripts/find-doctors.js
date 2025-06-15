const { MongoClient } = require("mongodb");

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

async function checkAllDoctors() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("Patient");

    // Check what's in the doctors collection
    const doctorsCollection = db.collection("doctors");
    const allDoctors = await doctorsCollection.find({}).toArray();

    console.log(`Found ${allDoctors.length} doctors in the collection:`);

    if (allDoctors.length > 0) {
      allDoctors.forEach((doctor, index) => {
        console.log(`\nDoctor ${index + 1}:`);
        console.log(JSON.stringify(doctor, null, 2));
      });
    } else {
      console.log("No doctors found in the collection.");
    }

    await client.close();
  } catch (error) {
    console.error("Error checking doctors:", error);
  }
}

checkAllDoctors();
