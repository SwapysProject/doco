import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/jwt";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    // Get current user from JWT
    const currentUser = getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch full doctor details from database
    const client = await clientPromise;
    const db = client.db("Patient");
    const doctorsCollection = db.collection("doctors");

    const doctor = await doctorsCollection.findOne(
      { _id: new ObjectId(currentUser.doctorId) },
      { projection: { password: 0 } } // Exclude password field
    );

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      user: {
        id: doctor._id.toString(),
        doctorId: currentUser.doctorId, // Include the doctorId from JWT
        email: doctor.email,
        name: doctor.name,
        role: doctor.role || "doctor",
        specialization: doctor.specialization,
        isOnline: doctor.isOnline,
        isActive: doctor.isActive,
      },
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
