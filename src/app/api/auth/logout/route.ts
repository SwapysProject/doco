import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/jwt";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    // Get current user from JWT
    const currentUser = getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Connect to database and update online status
    const client = await clientPromise;
    const db = client.db("Patient");
    const doctorsCollection = db.collection("doctors");

    await doctorsCollection.updateOne(
      { _id: new ObjectId(currentUser.doctorId) },
      {
        $set: {
          isOnline: false,
          lastSeen: new Date(),
        },
      }
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });

    // Clear the auth cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
