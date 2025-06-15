import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    // Get current user from JWT
    const currentUser = getCurrentUser(request);

    // If no user authentication, return demo data for development
    if (!currentUser) {
      console.log("No authenticated user, returning demo appointments data");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      return NextResponse.json({
        success: true,
        data: [
          {
            _id: "demo-apt1",
            patientName: "John Doe",
            appointmentDate: tomorrow,
            timeSlot: "10:00 AM",
            type: "Regular Checkup",
            status: "scheduled",
            reason: "Annual physical examination",
          },
          {
            _id: "demo-apt2",
            patientName: "Sarah Johnson",
            appointmentDate: nextWeek,
            timeSlot: "2:00 PM",
            type: "Follow-up",
            status: "scheduled",
            reason: "Asthma follow-up",
          },
        ],
      });
    }

    const client = await clientPromise;
    const db = client.db("Patient");

    // Get current date
    const now = new Date();

    // Get upcoming appointments for current doctor only (next 10 appointments)
    const upcomingAppointments = await db
      .collection("appointments")
      .find({
        doctorId: currentUser.doctorId,
        appointmentDate: { $gte: now },
        status: { $in: ["scheduled", "confirmed"] },
      })
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(10)
      .toArray();

    // Transform the data to match the expected format
    const formattedAppointments = upcomingAppointments.map((appointment) => ({
      id: appointment._id.toString(),
      appointmentId: appointment.appointmentId || `A${Date.now()}`,
      patientName: appointment.patientName,
      patientId: appointment.patientId,
      date: appointment.appointmentDate,
      time: appointment.appointmentTime,
      type: appointment.type || "consultation",
      status: appointment.status,
      reason: appointment.reason || "",
      patientPhone: appointment.patientPhone || "",
      patientEmail: appointment.patientEmail || "",
    }));

    return NextResponse.json({
      success: true,
      appointments: formattedAppointments,
    });
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch upcoming appointments",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
