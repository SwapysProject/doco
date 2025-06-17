import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";

// GET user notification settings
export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("Patient");

    const user = await db
      .collection("doctors")
      .findOne(
        { _id: new ObjectId(currentUser.doctorId) },
        { projection: { notificationSettings: 1 } }
      );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notifications = user.notificationSettings || {
      appointments: true,
      criticalAlerts: true,
      patientUpdates: false,
      systemUpdates: true,
      emailNotifications: true,
      smsNotifications: false,
    };

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update user notification settings
export async function PUT(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();

    const client = await clientPromise;
    const db = client.db("Patient");

    const result = await db.collection("doctors").updateOne(
      { _id: new ObjectId(currentUser.doctorId) },
      {
        $set: {
          notificationSettings: body.notifications,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Notification settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
