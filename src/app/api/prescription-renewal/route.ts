import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";
import { createNotification } from "@/lib/notifications-server";

// POST: Renew a prescription
export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { prescriptionId, renewalDuration, notes } = await request.json();

    if (!prescriptionId) {
      return NextResponse.json(
        { success: false, message: "Prescription ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const prescriptionsCollection = db.collection("prescriptions");

    // Find the original prescription
    const originalPrescription = await prescriptionsCollection.findOne({
      _id: new ObjectId(prescriptionId),
      doctorId: currentUser.doctorId, // Ensure doctor can only renew their own prescriptions
    });

    if (!originalPrescription) {
      return NextResponse.json(
        { success: false, message: "Prescription not found or not authorized" },
        { status: 404 }
      );
    } // Create new prescription based on the original
    const renewedPrescription = {
      ...originalPrescription,
      _id: undefined, // Remove original ID to create new document
      prescriptionId: `RX${Date.now()}`, // Generate new prescription ID
      originalPrescriptionId: prescriptionId,
      duration: renewalDuration || originalPrescription.duration,
      notes:
        notes ||
        `Renewal of prescription ${originalPrescription.prescriptionId}`,
      status: "active",
      isRenewal: true,
      renewalDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert the renewed prescription
    const result = await prescriptionsCollection.insertOne(renewedPrescription);

    // Update the original prescription status to renewed
    await prescriptionsCollection.updateOne(
      { _id: new ObjectId(prescriptionId) },
      {
        $set: {
          status: "renewed",
          renewedPrescriptionId: result.insertedId.toString(),
          updatedAt: new Date(),
        },
      }
    );

    // Create notification for prescription renewal
    const medicationNames =
      originalPrescription.medications
        ?.map((med: { name: string }) => med.name)
        .join(", ") || "Multiple medications";
    await createNotification({
      doctorId: currentUser.doctorId,
      type: "prescription_renewal",
      title: "Prescription Renewed",
      message: `Prescription renewed for ${originalPrescription.patientName} - ${medicationNames}`,
      patientId: originalPrescription.patientId,
      prescriptionId: result.insertedId.toString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Prescription renewed successfully",
        renewedPrescriptionId: result.insertedId.toString(),
        originalPrescriptionId: prescriptionId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Prescription renewal error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to renew prescription" },
      { status: 500 }
    );
  }
}

// GET: Get prescriptions due for renewal
export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const prescriptionsCollection = db.collection("prescriptions");

    // Calculate date range for prescriptions due for renewal (next 7 days)
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    // Find active prescriptions by this doctor that might need renewal
    const prescriptionsDueForRenewal = await prescriptionsCollection
      .find({
        doctorId: currentUser.doctorId,
        status: "active",
        isRenewal: { $ne: true }, // Exclude renewals themselves
        createdAt: { $lte: today }, // Created before today
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Simple logic: consider prescriptions older than 30 days as potentially due for renewal
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const dueForRenewal = prescriptionsDueForRenewal.filter(
      (prescription) => new Date(prescription.createdAt) <= thirtyDaysAgo
    );

    return NextResponse.json(
      {
        success: true,
        prescriptions: dueForRenewal.map((prescription) => ({
          _id: prescription._id.toString(),
          prescriptionId: prescription.prescriptionId,
          patientId: prescription.patientId,
          patientName: prescription.patientName,
          medications: prescription.medications,
          createdAt: prescription.createdAt,
          duration: prescription.duration,
          daysSinceCreated: Math.floor(
            (today.getTime() - new Date(prescription.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get renewal candidates error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch renewal candidates" },
      { status: 500 }
    );
  }
}
