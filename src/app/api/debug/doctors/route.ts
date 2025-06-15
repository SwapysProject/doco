import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Debug endpoint to check doctors in database
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");
    const doctorsCollection = db.collection("doctors");

    // Get all doctors (including count and sample data)
    const totalCount = await doctorsCollection.countDocuments();
    const allDoctors = await doctorsCollection
      .find({}, { projection: { password: 0 } })
      .limit(10)
      .toArray();

    return NextResponse.json({
      success: true,
      totalCount,
      sampleDoctors: allDoctors,
      message: `Found ${totalCount} doctors in the database`,
    });
  } catch (error) {
    console.error("Error debugging doctors:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to debug doctors",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
