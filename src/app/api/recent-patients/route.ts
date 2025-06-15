import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    // Get current user from JWT
    const currentUser = getCurrentUser(request);

    // If no user authentication, return demo data for development
    if (!currentUser) {
      console.log("No authenticated user, returning demo recent patients data");
      return NextResponse.json({
        success: true,
        data: [
          {
            _id: "demo1",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "+1-555-0100",
            lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            status: "Stable",
            condition: "Hypertension",
          },
          {
            _id: "demo2",
            firstName: "Sarah",
            lastName: "Johnson",
            email: "sarah.johnson@example.com",
            phone: "+1-555-0102",
            lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            status: "Monitoring",
            condition: "Asthma",
          },
          {
            _id: "demo3",
            firstName: "Robert",
            lastName: "Smith",
            email: "robert.smith@example.com",
            phone: "+1-555-0104",
            lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            status: "Critical",
            condition: "Arthritis",
          },
        ],
      });
    }

    const client = await clientPromise;
    const db = client.db("Patient");

    // Get recent patients assigned to the current doctor only
    const recentPatients = await db
      .collection("patients")
      .find({ doctorId: currentUser.doctorId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Transform the data to match the expected format
    const formattedPatients = recentPatients.map((patient) => ({
      id: patient._id.toString(),
      patientId: patient.patientId || patient.id || `P${Date.now()}`,
      name: patient.name,
      age: patient.age || "N/A",
      condition: patient.condition || "General checkup",
      lastVisit: patient.lastVisit || patient.createdAt,
      status: patient.status || "active",
      phone: patient.phone || "",
      email: patient.email || "",
      doctorId: patient.doctorId,
      doctorName: patient.doctorName,
    }));

    return NextResponse.json({
      success: true,
      patients: formattedPatients,
    });
  } catch (error) {
    console.error("Error fetching recent patients:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch recent patients",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
