import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";

// GET: Search patients by name for autocomplete
export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    const client = await clientPromise;
    const db = client.db("Patient");
    const patientsCollection = db.collection("patients");

    // Search patients by name (case-insensitive)
    const searchQuery = query
      ? {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { firstName: { $regex: query, $options: "i" } },
            { lastName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
            { phone: { $regex: query, $options: "i" } },
            { patientId: { $regex: query, $options: "i" } },
          ],
        }
      : {};
    const patients = await patientsCollection
      .find(searchQuery)
      .limit(limit)
      .project({
        _id: 1,
        patientId: 1,
        id: 1,
        name: 1,
        firstName: 1,
        lastName: 1,
        age: 1,
        gender: 1,
        email: 1,
        phone: 1,
        address: 1,
        dateOfBirth: 1,
        bloodType: 1,
        allergies: 1,
        condition: 1,
        status: 1,
      })
      .toArray();

    // Format the results for easier use
    const formattedPatients = patients.map((patient) => ({
      _id: patient._id,
      patientId: patient.patientId || patient.id,
      name:
        patient.name ||
        `${patient.firstName || ""} ${patient.lastName || ""}`.trim(),
      age: patient.age,
      gender: patient.gender,
      email: patient.email || "",
      phone: patient.phone || "",
      address: patient.address || "",
      dateOfBirth: patient.dateOfBirth,
      bloodType: patient.bloodType,
      allergies: patient.allergies || [],
      condition: patient.condition,
      status: patient.status,
    }));

    return NextResponse.json(
      {
        success: true,
        patients: formattedPatients,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error searching patients:", error);
    return NextResponse.json(
      { success: false, message: "Failed to search patients" },
      { status: 500 }
    );
  }
}
