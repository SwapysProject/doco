import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const patientName = searchParams.get("patientName");
    const status = searchParams.get("status");
    const date = searchParams.get("date"); // Build query filter
    interface FilterType {
      patientName?: { $regex: string; $options: string };
      status?: string;
      date?: { $gte: Date; $lt: Date };
    }
    const filter: FilterType = {};

    if (patientName) {
      filter.patientName = { $regex: patientName, $options: "i" };
    }

    if (status) {
      filter.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    // Fetch prescriptions
    const prescriptions = await db
      .collection("prescriptions")
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalCount = await db
      .collection("prescriptions")
      .countDocuments(filter);

    // Transform data to match expected format
    const formattedPrescriptions = prescriptions.map((prescription) => ({
      id: prescription._id.toString(),
      prescriptionId: prescription.prescriptionId || `RX${Date.now()}`,
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
      prescriptions: formattedPrescriptions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch prescriptions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");

    const body = await request.json();

    // Generate prescription ID if not provided
    const prescriptionId = body.prescriptionId || `RX${Date.now()}`;

    const prescription = {
      ...body,
      prescriptionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("prescriptions").insertOne(prescription);

    return NextResponse.json({
      success: true,
      message: "Prescription created successfully",
      prescriptionId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating prescription:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create prescription",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");

    const body = await request.json();
    const { prescriptionId, ...updateData } = body;

    if (!prescriptionId) {
      return NextResponse.json(
        { success: false, message: "Prescription ID is required" },
        { status: 400 }
      );
    }

    const result = await db.collection("prescriptions").updateOne(
      { _id: prescriptionId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Prescription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Prescription updated successfully",
    });
  } catch (error) {
    console.error("Error updating prescription:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update prescription",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");

    const body = await request.json();
    const { prescriptionId } = body;

    if (!prescriptionId) {
      return NextResponse.json(
        { success: false, message: "Prescription ID is required" },
        { status: 400 }
      );
    }

    const result = await db
      .collection("prescriptions")
      .deleteOne({ _id: prescriptionId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Prescription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting prescription:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete prescription",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
