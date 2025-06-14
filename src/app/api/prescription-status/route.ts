import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const collection = db.collection("prescriptions");

    // Check for active prescriptions
    const activePrescriptions = await collection
      .find({
        patientId,
        status: "active",
      })
      .toArray();

    // Get all prescriptions for history
    const allPrescriptions = await collection
      .find({ patientId })
      .sort({ createdAt: -1 })
      .toArray();

    // Check for recent prescriptions (within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPrescriptions = await collection
      .find({
        patientId,
        createdAt: { $gte: thirtyDaysAgo.toISOString() },
      })
      .toArray(); // Check for medication conflicts
    const currentMedications = activePrescriptions.flatMap(
      (p) => p.medications?.map((m: { name: string }) => m.name) || []
    );

    const hasActivePrescriptions = activePrescriptions.length > 0;
    const hasRecentPrescriptions = recentPrescriptions.length > 0;

    const warnings: string[] = [];
    const recommendations: string[] = [];

    const response = {
      success: true,
      data: {
        patientId,
        hasActivePrescriptions,
        hasRecentPrescriptions,
        activePrescriptionsCount: activePrescriptions.length,
        recentPrescriptionsCount: recentPrescriptions.length,
        totalPrescriptionsCount: allPrescriptions.length,
        activePrescriptions: activePrescriptions.map((p) => ({
          id: p.id || p._id,
          date: p.date || p.createdAt,
          diagnosis: p.diagnosis,
          medications: p.medications,
          doctorName: p.doctorName,
          status: p.status,
        })),
        recentPrescriptions: recentPrescriptions.map((p) => ({
          id: p.id || p._id,
          date: p.date || p.createdAt,
          diagnosis: p.diagnosis,
          medications: p.medications,
          doctorName: p.doctorName,
          status: p.status,
        })),
        currentMedications,
        warnings,
        recommendations,
      },
    };

    // Add warnings based on prescription status
    if (hasActivePrescriptions) {
      warnings.push("Patient has active prescriptions");
      recommendations.push(
        "Review existing prescriptions before issuing new ones"
      );
    }

    if (hasRecentPrescriptions && !hasActivePrescriptions) {
      warnings.push("Patient has recent prescriptions within 30 days");
      recommendations.push("Consider if new prescription is necessary");
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /prescription-status]", error);
    return NextResponse.json(
      { success: false, error: "Check failed" },
      { status: 500 }
    );
  }
}
