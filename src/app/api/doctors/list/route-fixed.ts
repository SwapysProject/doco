import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";

// Get all doctors except current user for messaging
export async function GET(request: NextRequest) {
  try {
    console.log("=== DOCTORS LIST API CALLED ===");

    const currentUser = getCurrentUser(request);
    console.log("Current user from JWT:", currentUser);

    if (!currentUser) {
      console.log("❌ No current user found - returning 401");
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    console.log("✅ User authenticated:", currentUser.name, currentUser.email);

    const client = await clientPromise;
    const db = client.db("Patient");
    const doctorsCollection = db.collection("doctors");

    // Get all doctors first
    console.log("📊 Fetching all doctors from database...");
    const allDoctors = await doctorsCollection
      .find(
        {},
        {
          projection: {
            password: 0, // Don't return password
            _id: 1,
            name: 1,
            email: 1,
            specialization: 1,
            isOnline: 1,
            lastSeen: 1,
          },
        }
      )
      .toArray();

    console.log(`📊 Total doctors in DB: ${allDoctors.length}`);
    if (allDoctors.length > 0) {
      console.log(
        "All doctors:",
        allDoctors.map((d) => ({
          _id: d._id.toString(),
          name: d.name,
          email: d.email,
        }))
      );
    }

    let filteredDoctors = allDoctors;

    // Only filter out current user if we have a valid doctorId
    if (currentUser.doctorId) {
      try {
        console.log(
          "🔍 Attempting to filter out current user:",
          currentUser.doctorId
        );
        const currentDoctorObjectId = new ObjectId(currentUser.doctorId);
        console.log(
          "🔍 Current user ObjectId:",
          currentDoctorObjectId.toString()
        );

        filteredDoctors = allDoctors.filter((doctor) => {
          const isCurrentUser = doctor._id.equals(currentDoctorObjectId);
          console.log(
            `Doctor ${
              doctor.name
            } (${doctor._id.toString()}) === current user? ${isCurrentUser}`
          );
          return !isCurrentUser;
        });

        console.log(
          `✂️ After filtering out current user: ${filteredDoctors.length} doctors remaining`
        );
      } catch (err) {
        console.log("⚠️ Error filtering current user:", err);
        console.log("⚠️ Returning all doctors instead");
        filteredDoctors = allDoctors;
      }
    } else {
      console.log(
        "⚠️ No doctorId found in current user, returning all doctors"
      );
    }

    console.log("🎯 Final doctors list count:", filteredDoctors.length);
    if (filteredDoctors.length > 0) {
      console.log(
        "🎯 Final doctors:",
        filteredDoctors.map((d) => ({
          _id: d._id.toString(),
          name: d.name,
          email: d.email,
        }))
      );
    }
    console.log("=== END DOCTORS LIST API ===");

    return NextResponse.json({
      success: true,
      doctors: filteredDoctors,
    });
  } catch (error) {
    console.error("💥 FATAL ERROR in doctors list API:", error);
    console.error(
      "💥 Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch doctors",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
