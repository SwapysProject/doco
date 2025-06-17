import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    // Get current user from JWT
    const currentUser = getCurrentUser(req);
    console.log("Current user from JWT:", currentUser);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const patientName = searchParams.get("patientName");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit; // First, get all patients assigned to this doctor
    const assignmentsCollection = db.collection("doctor_patient_assignments"); // Fixed collection name
    const assignments = await assignmentsCollection
      .find({ doctorId: currentUser.doctorId })
      .toArray();
    const assignedPatientIds = assignments.map(
      (assignment) => assignment.patientId
    );
    console.log("Doctor ID:", currentUser.doctorId);
    console.log("Assigned patient IDs:", assignedPatientIds);

    // Modified: Show all prescriptions for this doctor, even if no patient assignments exist
    // This is useful during development when patient assignments might not be set up
    const query: Record<string, unknown> = {
      $or: [
        // Prescriptions created by this doctor
        { doctorId: currentUser.doctorId },
        // Prescriptions for assigned patients (if any assignments exist)
        ...(assignedPatientIds.length > 0
          ? [{ patientId: { $in: assignedPatientIds } }]
          : []),
      ],
    }; // Add additional filters
    const finalQuery: Record<string, unknown> = { ...query };

    if (patientName || status) {
      finalQuery.$and = finalQuery.$and || [];
      const andArray = finalQuery.$and as Array<Record<string, unknown>>;

      if (patientName) {
        andArray.push({
          patientName: { $regex: patientName, $options: "i" },
        });
      }

      if (status) {
        andArray.push({ status });
      }
    } // Get prescriptions with pagination
    const prescriptionsCollection = db.collection("prescriptions");
    console.log("Query filter:", JSON.stringify(finalQuery, null, 2));

    const prescriptions = await prescriptionsCollection
      .find(finalQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    console.log("Found prescriptions:", prescriptions.length);

    // Get total count
    const totalCount = await prescriptionsCollection.countDocuments(finalQuery);

    // Transform data to ensure consistent format
    const formattedPrescriptions = prescriptions.map((prescription) => ({
      id: prescription._id.toString(),
      prescriptionId:
        prescription.prescriptionId || prescription.id || `RX${Date.now()}`,
      patientId: prescription.patientId,
      patientName: prescription.patientName,
      doctorId: prescription.doctorId || currentUser.doctorId,
      doctorName: prescription.doctorName || currentUser.name,
      date: prescription.date || prescription.createdAt,
      medications: prescription.medications || [],
      diagnosis: prescription.diagnosis || "",
      symptoms: prescription.symptoms || [],
      notes: prescription.notes || "",
      status: prescription.status || "active",
      duration: prescription.duration || "7 days",
      refills: prescription.refills || 0,
      createdAt: prescription.createdAt || new Date(),
      updatedAt: prescription.updatedAt || new Date(),
      isAiGenerated: prescription.isAiGenerated || false,
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
    console.error("[GET /my-prescriptions]", error);
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
