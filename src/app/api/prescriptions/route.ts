import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");
    const doctorId = searchParams.get("doctorId");

    const client = await clientPromise;
    const db = client.db("Patient");
    const collection = db.collection("prescriptions"); // Build query filters
    const query: Record<string, string> = {};
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;
    if (doctorId) query.doctorId = doctorId;

    const data = await collection.find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /prescriptions]", error);
    return NextResponse.json(
      { success: false, error: "Fetch failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("Patient");
    const collection = db.collection("prescriptions");

    // Add metadata
    const prescriptionData = {
      ...body,
      id: `RX${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: body.status || "active",
    };

    const result = await collection.insertOne(prescriptionData);
    return NextResponse.json({
      success: true,
      insertedId: result.insertedId,
      prescription: prescriptionData,
    });
  } catch (error) {
    console.error("[POST /prescriptions]", error);
    return NextResponse.json(
      { success: false, error: "Create failed" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { _id, updates } = await req.json();
    if (!_id || typeof _id !== "string" || !updates) {
      return NextResponse.json(
        { success: false, error: "Invalid _id or updates" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const collection = db.collection("prescriptions");

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("[PUT /prescriptions]", error);
    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing prescription ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const collection = db.collection("prescriptions");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("[DELETE /prescriptions]", error);
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}
