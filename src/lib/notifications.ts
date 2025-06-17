import clientPromise from "@/lib/mongodb";

export interface NotificationData {
  doctorId: string;
  type:
    | "patient_added"
    | "patient_assigned"
    | "prescription_created"
    | "appointment_scheduled"
    | "appointment_cancelled"
    | "lab_results"
    | "prescription_renewal";
  title: string;
  message: string;
  patientId?: string;
  appointmentId?: string;
  prescriptionId?: string;
}

export async function createNotification(data: NotificationData) {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");

    const notification = {
      ...data,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("notifications").insertOne(notification);

    return {
      success: true,
      notificationId: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    return {
      success: false,
      error: "Failed to create notification",
    };
  }
}

export async function getNotificationCount(doctorId: string): Promise<number> {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");

    const count = await db.collection("notifications").countDocuments({
      doctorId,
      isRead: false,
    });

    return count;
  } catch (error) {
    console.error("Error getting notification count:", error);
    return 0;
  }
}

export function getNotificationIcon(type: string): string {
  switch (type) {
    case "patient_added":
      return "👤";
    case "patient_assigned":
      return "📋";
    case "prescription_created":
      return "💊";
    case "appointment_scheduled":
      return "📅";
    case "appointment_cancelled":
      return "❌";
    case "lab_results":
      return "🧪";
    case "prescription_renewal":
      return "🔄";
    default:
      return "🔔";
  }
}

export function getNotificationColor(type: string): string {
  switch (type) {
    case "patient_added":
      return "bg-blue-500";
    case "patient_assigned":
      return "bg-green-500";
    case "prescription_created":
      return "bg-purple-500";
    case "appointment_scheduled":
      return "bg-indigo-500";
    case "appointment_cancelled":
      return "bg-red-500";
    case "lab_results":
      return "bg-yellow-500";
    case "prescription_renewal":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
}
