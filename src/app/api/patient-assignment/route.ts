import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";
import { createNotification } from "@/lib/notifications-server";

// POST: Assign a patient to the current doctor
export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { patientId } = await request.json();

    if (!patientId) {
      return NextResponse.json(
        { message: "Patient ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const patientsCollection = db.collection("patients");

    // Find the patient
    const patient = await patientsCollection.findOne({
      _id: new ObjectId(patientId),
    });

    if (!patient) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    // Check if patient is already assigned to this doctor
    if (patient.doctorId === currentUser.doctorId) {
      return NextResponse.json(
        { message: "Patient is already assigned to you" },
        { status: 400 }
      );
    }

    // Update patient assignment
    const result = await patientsCollection.updateOne(
      { _id: new ObjectId(patientId) },
      {
        $set: {
          doctorId: currentUser.doctorId,
          doctorName: currentUser.name,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Failed to assign patient" },
        { status: 500 }
      );
    } // Create notification for patient assignment
    await createNotification({
      doctorId: currentUser.doctorId,
      type: "patient_assigned",
      title: "Patient Assigned",
      message: `${patient.name} has been assigned to your care`,
      patientId: patientId,
    });

    return NextResponse.json(
      {
        message: "Patient assigned successfully",
        patientId: patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Assignment error:", error);
    return NextResponse.json(
      { message: "Failed to assign patient" },
      { status: 500 }
    );
  }
}

// GET: Get available patients for assignment (not assigned to current doctor)
export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const patientsCollection = db.collection("patients");

    // Find patients not assigned to current doctor
    const availablePatients = await patientsCollection
      .find({
        doctorId: { $ne: currentUser.doctorId },
      })
      .limit(50) // Limit to prevent large responses
      .toArray();

    return NextResponse.json(
      {
        patients: availablePatients.map((patient) => ({
          _id: patient._id.toString(),
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          currentDoctorId: patient.doctorId,
          currentDoctorName: patient.doctorName,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET available patients error:", error);
    return NextResponse.json(
      { message: "Failed to fetch available patients" },
      { status: 500 }
    );
  }
}
