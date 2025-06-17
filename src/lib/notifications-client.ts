// Client-side notification utilities (no MongoDB imports)
import "client-only";

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
