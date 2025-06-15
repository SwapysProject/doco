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
    const doctorsCollection = db.collection("doctors"); // Get all doctors first
    console.log("📊 Fetching all doctors from database...");
    const allDoctors = await doctorsCollection
      .find(
        {},
        {
          projection: {
            // Only include the fields we want (don't mix inclusion/exclusion)
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

    let filteredDoctors = allDoctors; // Only filter out current user if we have a valid doctorId
    if (currentUser.doctorId) {
      try {
        console.log(
          "🔍 Attempting to filter out current user:",
          currentUser.doctorId
        );
        console.log("🔍 Type of doctorId:", typeof currentUser.doctorId);

        // Try to create ObjectId - this might fail if doctorId is not a valid ObjectId format
        const currentDoctorObjectId = new ObjectId(currentUser.doctorId);
        console.log(
          "🔍 Current user ObjectId created successfully:",
          currentDoctorObjectId.toString()
        );

        const beforeFilter = allDoctors.length;
        filteredDoctors = allDoctors.filter((doctor) => {
          const doctorIdStr = doctor._id.toString();
          const currentUserIdStr = currentDoctorObjectId.toString();
          const isCurrentUser = doctorIdStr === currentUserIdStr;
          console.log(
            `🔍 Comparing: Doctor ${
              doctor.name
            } (${doctorIdStr}) vs Current User (${currentUserIdStr}) = ${
              isCurrentUser ? "MATCH (filter out)" : "DIFFERENT (keep)"
            }`
          );
          return !isCurrentUser;
        });

        console.log(
          `✂️ Filtering complete: ${beforeFilter} -> ${filteredDoctors.length} doctors`
        );
      } catch (err) {
        console.error("⚠️ Error with ObjectId conversion:", err);
        console.log("⚠️ Falling back to string comparison");

        // Fallback: try string comparison
        filteredDoctors = allDoctors.filter((doctor) => {
          const doctorIdStr = doctor._id.toString();
          const isCurrentUser = doctorIdStr === currentUser.doctorId;
          console.log(
            `🔍 String compare: Doctor ${
              doctor.name
            } (${doctorIdStr}) vs Current User (${currentUser.doctorId}) = ${
              isCurrentUser ? "MATCH (filter out)" : "DIFFERENT (keep)"
            }`
          );
          return !isCurrentUser;
        });
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
