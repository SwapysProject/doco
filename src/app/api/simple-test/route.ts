import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    console.log("=== SIMPLE TEST API ===");

    // Test 1: Authentication
    const currentUser = getCurrentUser(request);
    console.log("Auth test result:", currentUser ? "✅ PASS" : "❌ FAIL");

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          test: "auth",
          result: "FAIL - Not authenticated",
        },
        { status: 401 }
      );
    }

    // Test 2: Database connection
    const client = await clientPromise;
    const db = client.db("Patient");
    console.log("Database connection test: ✅ PASS");

    // Test 3: Simple query
    const doctorsCollection = db.collection("doctors");
    const count = await doctorsCollection.countDocuments();
    console.log(`Doctors count test: ✅ PASS (${count} doctors)`);

    return NextResponse.json({
      success: true,
      tests: {
        auth: "PASS",
        database: "PASS",
        doctorsCount: count,
        currentUser: {
          name: currentUser.name,
          email: currentUser.email,
          doctorId: currentUser.doctorId,
        },
      },
    });
  } catch (error) {
    console.error("❌ Simple test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
