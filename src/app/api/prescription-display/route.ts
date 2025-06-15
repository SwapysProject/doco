import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { prescriptionId } = await request.json();

    if (!prescriptionId) {
      return NextResponse.json(
        { success: false, message: "Prescription ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");

    // Get prescription details
    const prescriptionsCollection = db.collection("prescriptions");

    // Validate prescriptionId format before using it
    if (!/^[0-9a-fA-F]{24}$/.test(prescriptionId)) {
      return NextResponse.json(
        { success: false, message: "Invalid prescription ID format" },
        { status: 400 }
      );
    }

    const prescription = await prescriptionsCollection.findOne({
      _id: new ObjectId(prescriptionId),
    });

    if (!prescription) {
      return NextResponse.json(
        { success: false, message: "Prescription not found" },
        { status: 404 }
      );
    }

    // Get doctor details
    const doctorsCollection = db.collection("doctors");
    const doctor = await doctorsCollection.findOne({
      _id: new ObjectId(currentUser.doctorId),
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    // Prepare prescription data for display/download only
    const prescriptionData = {
      prescriptionId: prescription._id,
      patientName: prescription.patientName,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization || "General Medicine",
      diagnosis: prescription.diagnosis,
      dateIssued: new Date(
        prescription.date || prescription.createdAt
      ).toLocaleDateString(),
      medications: prescription.medications || [],
      notes: [
        "Please take medications exactly as prescribed",
        "Complete the full course of treatment even if you feel better",
        "Contact us immediately if you experience any adverse reactions",
        "Store medications in a cool, dry place away from children",
      ],
    };

    // Return prescription data for display/print only (no email functionality)
    return NextResponse.json({
      success: true,
      message: "Prescription data retrieved successfully",
      prescriptionData,
      action: "display", // Indicates this is for display/print only
    });
  } catch (error) {
    console.error("Error retrieving prescription:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve prescription" },
      { status: 500 }
    );
  }
}
