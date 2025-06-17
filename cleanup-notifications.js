const { MongoClient } = require("mongodb");

async function cleanupNotifications() {
  try {
    // MongoDB URI
    const uri =
      "mongodb+srv://doc2025:4VyNMAvQtApjqJP7@doc.clwfyfj.mongodb.net/Patient?retryWrites=true&w=majority&appName=doc";

    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("Patient");
    const notifications = db.collection("notifications");

    // Find notifications with "undefined undefined" in the message
    const problematicNotifications = await notifications
      .find({
        message: { $regex: /undefined.*undefined/i },
      })
      .toArray();

    console.log(
      `Found ${problematicNotifications.length} problematic notifications`
    );

    if (problematicNotifications.length > 0) {
      console.log("Sample problematic notifications:");
      problematicNotifications.forEach((notif, index) => {
        console.log(
          `${index + 1}. ${notif.message} (Created: ${notif.createdAt})`
        );
      });

      // Delete the problematic notifications
      const deleteResult = await notifications.deleteMany({
        message: { $regex: /undefined.*undefined/i },
      });

      console.log(
        `Deleted ${deleteResult.deletedCount} problematic notifications`
      );
    }

    await client.close();
    console.log("Cleanup completed");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

cleanupNotifications();
