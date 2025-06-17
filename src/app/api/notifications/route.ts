import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";

// GET user notifications
export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeRead = searchParams.get("includeRead") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");

    const client = await clientPromise;
    const db = client.db("Patient"); // Build query based on parameters
    const query: { doctorId: string; isRead?: boolean } = {
      doctorId: currentUser.doctorId,
    };
    if (!includeRead) {
      query.isRead = false;
    }

    // Get notifications for the current doctor
    const notifications = await db
      .collection("notifications")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Get count of unread notifications
    const unreadCount = await db.collection("notifications").countDocuments({
      doctorId: currentUser.doctorId,
      isRead: false,
    });

    return NextResponse.json({
      notifications: notifications.map((notification) => ({
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt,
        isRead: notification.isRead,
        patientId: notification.patientId,
        appointmentId: notification.appointmentId,
        prescriptionId: notification.prescriptionId,
      })),
      count: notifications.length,
      unreadCount: unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST mark notification as read
export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId } = body;

    const client = await clientPromise;
    const db = client.db("Patient");

    await db.collection("notifications").updateOne(
      {
        _id: new ObjectId(notificationId),
        doctorId: currentUser.doctorId,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return NextResponse.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT mark all notifications as read
export async function PUT(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("Patient");

    await db.collection("notifications").updateMany(
      {
        doctorId: currentUser.doctorId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
