import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";

// GET all notifications for debugging (should be removed in production)
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");

    // Get all notifications
    const notifications = await db
      .collection("notifications")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      notifications: notifications.map((notification) => ({
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        doctorId: notification.doctorId,
        createdAt: notification.createdAt,
        isRead: notification.isRead,
        patientId: notification.patientId,
        appointmentId: notification.appointmentId,
        prescriptionId: notification.prescriptionId,
      })),
      count: notifications.length,
    });
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE demo notifications
export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");

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

    let totalDeleted = 0;

    for (const name of demoNames) {
      const result = await db.collection("notifications").deleteMany({
        message: { $regex: name, $options: "i" },
      });
      totalDeleted += result.deletedCount;
    }

    // Also delete any notifications with "undefined" in the message
    const undefinedResult = await db.collection("notifications").deleteMany({
      message: { $regex: "undefined", $options: "i" },
    });

    totalDeleted += undefinedResult.deletedCount;

    return NextResponse.json({
      message: `Deleted ${totalDeleted} demo notifications`,
      deletedCount: totalDeleted,
    });
  } catch (error) {
    console.error("Error deleting demo notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
