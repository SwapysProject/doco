import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");
    const doctorId = searchParams.get("doctorId");
    const patientName = searchParams.get("patientName");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("Patient"); // Use consistent database name
    const collection = db.collection("prescriptions");

    // Build query filters
    interface QueryType {
      patientId?: string;
      status?: string;
      doctorId?: string;
      patientName?: { $regex: string; $options: string };
    }
    const query: QueryType = {};

    if (patientId) query.patientId = patientId;
    if (status) query.status = status;
    if (doctorId) query.doctorId = doctorId;
    if (patientName) query.patientName = { $regex: patientName, $options: "i" };

    // Get prescriptions with pagination
    const data = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count
    const totalCount = await collection.countDocuments(query);

    // Transform data to ensure consistent format
    const formattedPrescriptions = data.map((prescription) => ({
      id: prescription._id.toString(),
      prescriptionId:
        prescription.prescriptionId || prescription.id || `RX${Date.now()}`,
      patientId: prescription.patientId,
      patientName: prescription.patientName,
      doctorId: prescription.doctorId || "D001",
      doctorName: prescription.doctorName || "Dr. Smith",
      date: prescription.date || prescription.createdAt,
      medications: prescription.medications || [],
      diagnosis: prescription.diagnosis || "",
      notes: prescription.notes || "",
      status: prescription.status || "active",
      duration: prescription.duration || "7 days",
      refills: prescription.refills || 0,
      createdAt: prescription.createdAt || new Date(),
      updatedAt: prescription.updatedAt || new Date(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedPrescriptions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
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
    const db = client.db("Patient"); // Use consistent database name
    const collection = db.collection("prescriptions");

    // Add metadata
    const prescriptionData = {
      ...body,
      prescriptionId: body.prescriptionId || `RX${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
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
    const db = client.db("doctorcare"); // Use consistent database name
    const collection = db.collection("prescriptions");

    const updateData = {
      ...updates,
      updatedAt: new Date(),
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
    const db = client.db("doctorcare"); // Use consistent database name
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
