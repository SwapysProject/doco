import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
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
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

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
      // Total appointments
      db.collection("appointments").countDocuments({}),

      // Today's appointments
      db.collection("appointments").countDocuments({
        appointmentDate: {
          $gte: todayStart,
          $lt: todayEnd,
        },
      }),

      // This week's appointments
      db.collection("appointments").countDocuments({
        appointmentDate: { $gte: thisWeekStart },
      }),

      // This month's appointments
      db.collection("appointments").countDocuments({
        appointmentDate: { $gte: thisMonthStart },
      }),

      // Status counts
      db.collection("appointments").countDocuments({ status: "scheduled" }),
      db.collection("appointments").countDocuments({ status: "confirmed" }),
      db.collection("appointments").countDocuments({ status: "completed" }),
      db.collection("appointments").countDocuments({ status: "cancelled" }),

      // Type counts
      db.collection("appointments").countDocuments({ type: "consultation" }),
      db.collection("appointments").countDocuments({ type: "follow-up" }),
      db.collection("appointments").countDocuments({ type: "emergency" }),
      db.collection("appointments").countDocuments({ type: "surgery" }),
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
