import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");

    // List all collections
    const collections = await db.listCollections().toArray();

    // Get counts from each collection
    const collectionInfo = await Promise.all(
      collections.map(async (col) => {
        const count = await db.collection(col.name).countDocuments();
        return {
          name: col.name,
          count,
        };
      })
    );

    // Get some sample data from doctors collection
    const doctorsCollection = db.collection("doctors");
    const sampleDoctors = await doctorsCollection.find({}).limit(5).toArray();

    return NextResponse.json({
      success: true,
      collections: collectionInfo,
      sampleDoctors: sampleDoctors.map((doc) => ({
        _id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        specialization: doc.specialization,
      })),
    });
  } catch (error) {
    console.error("Database debug error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
