// Clear hardcoded demo notifications
import clientPromise from "./src/lib/mongodb.js";

async function clearDemoNotifications() {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");

    // Find and display all notifications first
    const allNotifications = await db
      .collection("notifications")
      .find({})
      .toArray();
    console.log("Found notifications:", allNotifications.length);

    // Delete notifications that contain demo names
    const demoNames = [
      "John Doe",
      "Sarah Johnson",
      "Michael Chen",
      "Emily Davis",
      "Robert Smith",
      "Lisa Anderson",
      "David Wilson",
      "Jennifer Brown",
    ];

    const deletePromises = demoNames.map((name) =>
      db.collection("notifications").deleteMany({
        message: { $regex: name, $options: "i" },
      })
    );

    const results = await Promise.all(deletePromises);
    const totalDeleted = results.reduce(
      (sum, result) => sum + result.deletedCount,
      0
    );

    console.log(`Deleted ${totalDeleted} demo notifications`);

    // Also delete any notifications with "undefined" in the message
    const undefinedResult = await db.collection("notifications").deleteMany({
      message: { $regex: "undefined", $options: "i" },
    });

    console.log(
      `Deleted ${undefinedResult.deletedCount} notifications with 'undefined'`
    );

    // Show remaining notifications
    const remaining = await db.collection("notifications").find({}).toArray();
    console.log(`Remaining notifications: ${remaining.length}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

clearDemoNotifications();
