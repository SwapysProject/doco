import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = params;
    const updateData = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid patient ID format" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const collection = db.collection("patients");

    // Prepare update data with timestamp
    const updateFields = {
      ...updateData,
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 }
      );
    }

    // Fetch and return the updated patient
    const updatedPatient = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json(updatedPatient, { status: 200 });
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update patient" },
      { status: 500 }
    );
  }
}
