import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";

// GET: Fetch appointments for the current doctor
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
    const appointmentsCollection = db.collection("appointments");

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const patientName = searchParams.get("patientName"); // Build query
    const query: {
      doctorId: string;
      status?: string;
      appointmentDate?: { $gte: Date; $lte: Date };
      patientName?: { $regex: string; $options: string };
    } = {
      doctorId: currentUser.doctorId,
    };

    if (status && status !== "all") {
      query.status = status;
    }

    if (date) {
      // Filter by specific date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.appointmentDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    if (patientName) {
      query.patientName = { $regex: patientName, $options: "i" };
    }

    const appointments = await appointmentsCollection
      .find(query)
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .toArray();

    return NextResponse.json(
      {
        success: true,
        appointments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST: Create new appointment
export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const appointmentData = await request.json();

    // Validate required fields
    const requiredFields = [
      "patientId",
      "patientName",
      "appointmentDate",
      "appointmentTime",
      "type",
    ];
    for (const field of requiredFields) {
      if (!appointmentData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const appointmentsCollection = db.collection("appointments");

    // Generate appointment ID
    const count = await appointmentsCollection.countDocuments();
    const appointmentId = `APT${String(count + 1).padStart(4, "0")}`;

    // Create appointment object
    const appointment = {
      appointmentId,
      doctorId: currentUser.doctorId,
      patientId: appointmentData.patientId,
      patientName: appointmentData.patientName,
      patientPhone: appointmentData.patientPhone || "",
      patientEmail: appointmentData.patientEmail || "",
      appointmentDate: new Date(appointmentData.appointmentDate),
      appointmentTime: appointmentData.appointmentTime,
      type: appointmentData.type,
      reason: appointmentData.reason || "",
      status: appointmentData.status || "scheduled",
      notes: appointmentData.notes || "",
      duration: appointmentData.duration || 30, // default 30 minutes
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await appointmentsCollection.insertOne(appointment);

    return NextResponse.json(
      {
        success: true,
        message: "Appointment created successfully",
        appointmentId: result.insertedId,
        appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

// PUT: Update appointment
export async function PUT(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { appointmentId, ...updateData } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const appointmentsCollection = db.collection("appointments");

    // Prepare update data
    const updateFields = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Update the appointment
    const result = await appointmentsCollection.updateOne(
      {
        _id: new ObjectId(appointmentId),
        doctorId: currentUser.doctorId, // Ensure doctor can only update their own appointments
      },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Appointment updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// DELETE: Delete appointment
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const appointmentsCollection = db.collection("appointments");

    // Delete the appointment
    const result = await appointmentsCollection.deleteOne({
      _id: new ObjectId(appointmentId),
      doctorId: currentUser.doctorId, // Ensure doctor can only delete their own appointments
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Appointment deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
