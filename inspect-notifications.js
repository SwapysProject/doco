// Script to inspect current notifications in the database
const { MongoClient } = require("mongodb");

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://mohan:mohan123@cluster0.3ikul.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function inspectNotifications() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("Patient");
    const notifications = await db
      .collection("notifications")
      .find({})
      .toArray();

    console.log("Current notifications in database:");
    console.log("Total notifications:", notifications.length);
    console.log("\nDetailed notifications:");

    notifications.forEach((notification, index) => {
      console.log(`\n${index + 1}. ID: ${notification._id}`);
      console.log(`   Type: ${notification.type}`);
      console.log(`   Title: ${notification.title}`);
      console.log(`   Message: ${notification.message}`);
      console.log(`   Doctor ID: ${notification.doctorId}`);
      console.log(`   Created: ${notification.createdAt}`);
      console.log(`   Is Read: ${notification.isRead}`);
      if (notification.patientId)
        console.log(`   Patient ID: ${notification.patientId}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

inspectNotifications();
