import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";

// Get patients assigned to the current doctor
export async function GET(request: NextRequest) {
  try {
    // Get current doctor from JWT
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");

    // Get patients assigned to this doctor
    const assignmentsCollection = db.collection("doctor_patient_assignments");
    const patientsCollection = db.collection("patients");

    // Find all patient assignments for this doctor
    const assignments = await assignmentsCollection
      .find({ doctorId: currentUser.doctorId })
      .toArray();

    const patientIds = assignments.map((assignment) => assignment.patientId);

    // Get patient details for assigned patients only
    const patients = await patientsCollection
      .find({
        $or: [
          { id: { $in: patientIds } },
          { _id: { $in: patientIds.map((id) => new ObjectId(id)) } },
        ],
      })
      .toArray();

    return NextResponse.json({
      success: true,
      patients: patients,
      totalAssigned: patients.length,
    });
  } catch (error) {
    console.error("Error fetching assigned patients:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

// Assign a patient to the current doctor
export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { patientId } = await request.json();

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: "Patient ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const assignmentsCollection = db.collection("doctor_patient_assignments");

    // Check if assignment already exists
    const existingAssignment = await assignmentsCollection.findOne({
      doctorId: currentUser.doctorId,
      patientId: patientId,
    });

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, message: "Patient already assigned to this doctor" },
        { status: 400 }
      );
    }

    // Create new assignment
    const assignment = {
      doctorId: currentUser.doctorId,
      patientId: patientId,
      assignedAt: new Date(),
      status: "active",
    };

    await assignmentsCollection.insertOne(assignment);

    return NextResponse.json({
      success: true,
      message: "Patient assigned successfully",
    });
  } catch (error) {
    console.error("Error assigning patient:", error);
    return NextResponse.json(
      { success: false, message: "Failed to assign patient" },
      { status: 500 }
    );
  }
}
