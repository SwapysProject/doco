/**
 * Medication interface for prescription items
 */
export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  strength: string;
  form:
    | "tablet"
    | "capsule"
    | "liquid"
    | "injection"
    | "cream"
    | "inhaler"
    | "drops";
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  refills: number;
  priority?: "critical" | "high" | "medium" | "low";
  cost?: number;
  contraindications?: string[];
  sideEffects?: string[];
}

/**
 * Prescription interface
 */
export interface Prescription {
  id: string;
  _id?: string; // MongoDB ObjectId
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  medications: Medication[];
  notes?: string;
  status: "active" | "completed" | "cancelled" | "expired";
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  isAiGenerated?: boolean;
  aiConfidence?: number;
}

/**
 * AI Prescription Request interface
 */
export interface AiPrescriptionRequest {
  patientId: string;
  symptoms: string[];
  diagnosis?: string;
  allergies?: string[];
  currentMedications?: string[];
  medicalHistory?: string[];
  age: number;
  weight?: number;
  gender: "male" | "female" | "other";
}

/**
 * AI Prescription Response interface
 */
export interface AiPrescriptionResponse {
  medications: Medication[];
  reasoning: string;
  fullReasoning?: string; // Full AI analysis (optional, for toggle display)
  confidence: number;
  warnings: string[];
  alternatives?: Medication[] | string[]; // Can be alternative medications or recommendation strings
}
