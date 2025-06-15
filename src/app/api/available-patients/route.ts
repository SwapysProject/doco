import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";

// Get all patients that are not assigned to the current doctor
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

    const assignmentsCollection = db.collection("doctor_patient_assignments");
    const patientsCollection = db.collection("patients");

    // Get all patients assigned to this doctor
    const assignedPatients = await assignmentsCollection
      .find({ doctorId: currentUser.doctorId })
      .toArray();

    const assignedPatientIds = assignedPatients.map(
      (assignment) => assignment.patientId
    );

    // Get all patients not assigned to this doctor
    const availablePatients = await patientsCollection
      .find({
        $and: [
          { id: { $nin: assignedPatientIds } },
          { _id: { $nin: assignedPatientIds.map((id) => id) } },
        ],
      })
      .toArray();

    return NextResponse.json({
      success: true,
      patients: availablePatients,
      total: availablePatients.length,
    });
  } catch (error) {
    console.error("Error fetching available patients:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch available patients" },
      { status: 500 }
    );
  }
}
