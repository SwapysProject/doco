import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";

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

    // Get current date for calculations
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Get this week's start (Monday)
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay() + 1);

    // Get this month's start
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1); // Base query filter for this doctor
    const doctorFilter = { doctorId: currentUser.doctorId };

    // Debug: Let's see what appointments exist and their structure
    const allAppointments = await db
      .collection("appointments")
      .find({})
      .limit(5)
      .toArray();
    console.log("🔍 Debug - All appointments sample:", allAppointments);
    console.log("🔍 Debug - Looking for doctorId:", currentUser.doctorId);

    // Check if there are any appointments with this doctorId
    const doctorAppointments = await db
      .collection("appointments")
      .find(doctorFilter)
      .toArray();
    console.log("🔍 Debug - Doctor's appointments:", doctorAppointments);

    // Parallel count fetching for better performance
    const [
      totalAppointments,
      todaysAppointments,
      thisWeekAppointments,
      thisMonthAppointments,
      scheduledCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      consultationCount,
      followUpCount,
      emergencyCount,
      surgeryCount,
    ] = await Promise.all([
      // Total appointments for this doctor
      db.collection("appointments").countDocuments(doctorFilter),

      // Today's appointments for this doctor
      db.collection("appointments").countDocuments({
        ...doctorFilter,
        appointmentDate: {
          $gte: todayStart,
          $lt: todayEnd,
        },
      }), // This week's appointments for this doctor
      db.collection("appointments").countDocuments({
        ...doctorFilter,
        appointmentDate: { $gte: thisWeekStart },
      }),

      // This month's appointments for this doctor
      db.collection("appointments").countDocuments({
        ...doctorFilter,
        appointmentDate: { $gte: thisMonthStart },
      }),

      // Status counts for this doctor
      db
        .collection("appointments")
        .countDocuments({ ...doctorFilter, status: "scheduled" }),
      db
        .collection("appointments")
        .countDocuments({ ...doctorFilter, status: "confirmed" }),
      db
        .collection("appointments")
        .countDocuments({ ...doctorFilter, status: "completed" }),
      db
        .collection("appointments")
        .countDocuments({ ...doctorFilter, status: "cancelled" }),

      // Type counts for this doctor
      db
        .collection("appointments")
        .countDocuments({ ...doctorFilter, type: "consultation" }),
      db
        .collection("appointments")
        .countDocuments({ ...doctorFilter, type: "follow-up" }),
      db
        .collection("appointments")
        .countDocuments({ ...doctorFilter, type: "emergency" }),
      db
        .collection("appointments")
        .countDocuments({ ...doctorFilter, type: "surgery" }),
    ]);

    // Calculate pending appointments (scheduled + confirmed)
    const pendingCount = scheduledCount + confirmedCount;

    // Get yesterday's count for comparison
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);

    const yesterdayCount = await db.collection("appointments").countDocuments({
      appointmentDate: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    });

    const todayChange = todaysAppointments - yesterdayCount;

    // Get last week's count for comparison
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);

    const lastWeekCount = await db.collection("appointments").countDocuments({
      appointmentDate: {
        $gte: lastWeekStart,
        $lt: lastWeekEnd,
      },
    });

    const weekChange = thisWeekAppointments - lastWeekCount;

    const stats = {
      summary: {
        total: totalAppointments,
        today: todaysAppointments,
        thisWeek: thisWeekAppointments,
        thisMonth: thisMonthAppointments,
        pending: pendingCount,
        todayChange,
        weekChange,
      },
      byStatus: {
        scheduled: scheduledCount,
        confirmed: confirmedCount,
        completed: completedCount,
        cancelled: cancelledCount,
      },
      byType: {
        consultation: consultationCount,
        followUp: followUpCount,
        emergency: emergencyCount,
        surgery: surgeryCount,
      },
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching appointment statistics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch appointment statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
