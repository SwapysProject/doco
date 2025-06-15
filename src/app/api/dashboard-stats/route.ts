import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    // Get current user from JWT
    let currentUser = getCurrentUser(request);

    // If no user authentication, use demo doctor ID for development
    if (!currentUser) {
      console.log(
        "No authenticated user, using demo doctor ID for development"
      );
      currentUser = {
        doctorId: "dr_123",
        email: "demo@doctor.com",
        name: "Demo Doctor",
        role: "doctor" as const,
      };
    }
    const client = await clientPromise;
    const db = client.db("Patient");

    console.log("Fetching dashboard stats for doctor:", currentUser.doctorId);

    // Get current date for today's calculations
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Get this month's start
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    console.log("Date ranges - Today:", todayStart, "to", todayEnd);
    console.log("Month start:", monthStart);

    // Parallel data fetching for better performance
    const [
      totalPatients,
      todaysAppointments,
      criticalPatients,
      completedAppointments,
      stablePatients,
      monitoringPatients,
      activePatients,
      recentPatients,
    ] = await Promise.all([
      // Total active patients assigned to current doctor
      db.collection("patients").countDocuments({
        doctorId: currentUser.doctorId,
        status: { $ne: "inactive" },
      }),

      // Today's appointments for current doctor
      db.collection("appointments").countDocuments({
        doctorId: currentUser.doctorId,
        appointmentDate: {
          $gte: todayStart,
          $lt: todayEnd,
        },
      }),

      // Critical patients assigned to current doctor (based on condition or status)
      db.collection("patients").countDocuments({
        doctorId: currentUser.doctorId,
        $or: [
          { condition: /critical|emergency|urgent/i },
          { status: "critical" },
        ],
      }),

      // Completed appointments this month for current doctor for recovery rate calculation
      db.collection("appointments").countDocuments({
        doctorId: currentUser.doctorId,
        appointmentDate: { $gte: monthStart },
        status: "completed",
      }),
      // Patient status counts for current doctor
      db.collection("patients").countDocuments({
        doctorId: currentUser.doctorId,
        $or: [{ condition: /stable|recovered|good/i }, { status: "stable" }],
      }),

      db.collection("patients").countDocuments({
        doctorId: currentUser.doctorId,
        $or: [
          { condition: /monitoring|observation|follow/i },
          { status: "monitoring" },
        ],
      }),

      db.collection("patients").countDocuments({
        doctorId: currentUser.doctorId,
        status: { $in: ["active", "treatment"] },
      }),

      // Recent patients for current doctor (this month)
      db.collection("patients").countDocuments({
        doctorId: currentUser.doctorId,
        createdAt: { $gte: monthStart },
      }),
    ]);

    console.log("Raw counts:", {
      totalPatients,
      todaysAppointments,
      criticalPatients,
      completedAppointments,
      stablePatients,
      monitoringPatients,
      activePatients,
      recentPatients,
    });
    // Calculate recovery rate (completed appointments vs total appointments this month for current doctor)
    const totalMonthlyAppointments = await db
      .collection("appointments")
      .countDocuments({
        doctorId: currentUser.doctorId,
        appointmentDate: { $gte: monthStart },
      });

    const recoveryRate =
      totalMonthlyAppointments > 0
        ? ((completedAppointments / totalMonthlyAppointments) * 100).toFixed(1)
        : "0.0";

    // Calculate changes (you could implement historical comparison here)
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const lastMonthPatients = await db.collection("patients").countDocuments({
      doctorId: currentUser.doctorId,
      createdAt: {
        $gte: lastMonthStart,
        $lte: lastMonthEnd,
      },
    });

    const patientGrowth =
      lastMonthPatients > 0
        ? (
            ((recentPatients - lastMonthPatients) / lastMonthPatients) *
            100
          ).toFixed(1)
        : "0.0";

    // Get yesterday's appointments for comparison
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);
    const yesterdayAppointments = await db
      .collection("appointments")
      .countDocuments({
        doctorId: currentUser.doctorId,
        appointmentDate: {
          $gte: yesterdayStart,
          $lt: yesterdayEnd,
        },
      });

    const appointmentChange = todaysAppointments - yesterdayAppointments;

    const stats = {
      mainStats: [
        {
          title: "Total Patients",
          value: totalPatients.toString(),
          change: `+${patientGrowth}%`,
          changeType: parseFloat(patientGrowth) >= 0 ? "positive" : "negative",
          description: "Active patients this month",
        },
        {
          title: "Today's Appointments",
          value: todaysAppointments.toString(),
          change:
            appointmentChange >= 0
              ? `+${appointmentChange}`
              : appointmentChange.toString(),
          changeType: appointmentChange >= 0 ? "positive" : "negative",
          description: "Scheduled for today",
        },
        {
          title: "Critical Cases",
          value: criticalPatients.toString(),
          change: "0", // You could implement trend analysis here
          changeType: "neutral",
          description: "Requiring immediate attention",
        },
        {
          title: "Recovery Rate",
          value: `${recoveryRate}%`,
          change: "+1.8%", // You could calculate this from historical data
          changeType: "positive",
          description: "Patient recovery success rate",
        },
      ],
      quickStats: [
        {
          label: "Stable",
          value: stablePatients.toString(),
          color: "bg-green-500",
        },
        {
          label: "Monitoring",
          value: monitoringPatients.toString(),
          color: "bg-yellow-500",
        },
        {
          label: "Critical",
          value: criticalPatients.toString(),
          color: "bg-red-500",
        },
        {
          label: "Active",
          value: activePatients.toString(),
          color: "bg-blue-500",
        },
      ],
    };

    console.log("Final stats object:", JSON.stringify(stats, null, 2));

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
