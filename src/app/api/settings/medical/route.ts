import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";

// GET user medical settings
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
        { projection: { medicalSettings: 1 } }
      );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const medicalSettings = user.medicalSettings || {
      appointmentDuration: 30,
      workingHours: {
        start: "09:00",
        end: "17:00",
      },
      enableAIPrescriptions: true,
      defaultPrescriptionTemplate: "standard",
      emergencyContactEnabled: true,
    };

    return NextResponse.json({ medicalSettings });
  } catch (error) {
    console.error("Error fetching medical settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update user medical settings
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
          medicalSettings: body.medicalSettings,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Medical settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating medical settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
