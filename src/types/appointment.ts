export interface Appointment {
  _id?: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  appointmentDate: Date | string;
  appointmentTime: string;
  type:
    | "consultation"
    | "follow-up"
    | "checkup"
    | "emergency"
    | "surgery"
    | "other";
  reason?: string;
  status:
    | "scheduled"
    | "confirmed"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "no-show";
  notes?: string;
  duration?: number; // in minutes
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface AppointmentFormData {
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  appointmentDate: string;
  appointmentTime: string;
  type: Appointment["type"];
  reason?: string;
  status?: Appointment["status"];
  notes?: string;
  duration?: number;
}
