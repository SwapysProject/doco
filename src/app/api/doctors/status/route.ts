import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Get all online doctors
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");
    const doctorsCollection = db.collection("doctors");

    const onlineDoctors = await doctorsCollection
      .find(
        { isOnline: true },
        {
          projection: {
            password: 0, // Don't return password
          },
        }
      )
      .toArray();

    return NextResponse.json({
      success: true,
      doctors: onlineDoctors,
      count: onlineDoctors.length,
    });
  } catch (error) {
    console.error("Error fetching online doctors:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update doctor online status
export async function POST(request: NextRequest) {
  try {
    const { doctorId, isOnline } = await request.json();

    if (!doctorId || typeof isOnline !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Doctor ID and online status are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const doctorsCollection = db.collection("doctors");
    const updateData: {
      isOnline: boolean;
      lastSeen: Date;
      lastLogin?: Date;
    } = {
      isOnline,
      lastSeen: new Date(),
    };

    if (isOnline) {
      updateData.lastLogin = new Date();
    }

    const result = await doctorsCollection.updateOne(
      { _id: new ObjectId(doctorId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Doctor status updated to ${isOnline ? "online" : "offline"}`,
    });
  } catch (error) {
    console.error("Error updating doctor status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
