// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Content,
} from "@google/generative-ai";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyJWT } from "@/lib/jwt";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Type definitions
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  allergies?: string[];
  currentMedications?: string[];
  medicalHistory?: string[];
  status?: string;
}

interface Prescription {
  id: string;
  patientName: string;
  diagnosis: string;
  medications?: any[];
  date: string;
  status: string;
}

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

interface DoctorData {
  patients: Patient[];
  prescriptions: Prescription[];
  appointments: Appointment[];
  notifications: Notification[];
  medicalHistory: MedicalHistory[];
  labResults: LabResult[];
  medications: Medication[];
  messages: Message[];
  allergies: Allergy[];
  schedule: Schedule[];
  prescriptionRenewals: PrescriptionRenewal[];
}

// Helper functions for formatting common data queries
function formatPatientsTable(patients: Patient[]): string {
  if (patients.length === 0) return "No patients assigned.";

  const header =
    "| Name | Age | Gender | Status | Allergies | Current Medications |\n|------|-----|--------|--------|-----------|--------------------|\n";
  const rows = patients
    .map((p) => {
      const statusEmoji =
        p.status === "critical" ? "🔴" : p.status === "stable" ? "🟢" : "🟡";
      const allergies = p.allergies?.join(", ") || "None";
      const medications = p.currentMedications?.join(", ") || "None";
      return `| **${p.name}** | ${p.age} | ${p.gender} | ${statusEmoji} ${p.status || "Unknown"} | ${allergies} | ${medications} |`;
    })
    .join("\n");

  return header + rows;
}

function formatAppointmentsTable(appointments: Appointment[]): string {
  if (appointments.length === 0) return "No appointments scheduled.";

  const header =
    "| Patient | Date | Time | Type | Status |\n|---------|------|------|------|--------|\n";
  const rows = appointments
    .map((a) => {
      const statusEmoji =
        a.status === "confirmed" ? "✅" : a.status === "pending" ? "⏳" : "❌";
      return `| **${a.patientName}** | ${a.date} | ${a.time} | ${a.type} | ${statusEmoji} ${a.status} |`;
    })
    .join("\n");

  return header + rows;
}

function formatPrescriptionsTable(prescriptions: Prescription[]): string {
  if (prescriptions.length === 0) return "No prescriptions found.";

  const header =
    "| Patient | Diagnosis | Date | Status | Medications |\n|---------|-----------|------|--------|-------------|\n";
  const rows = prescriptions
    .map((p) => {
      const statusEmoji =
        p.status === "active" ? "✅" : p.status === "completed" ? "✔️" : "⏳";
      const medications = Array.isArray(p.medications)
        ? p.medications.join(", ")
        : "Not specified";
      return `| **${p.patientName}** | ${p.diagnosis} | ${p.date} | ${statusEmoji} ${p.status} | ${medications} |`;
    })
    .join("\n");

  return header + rows;
}

function formatTodaysAppointments(appointments: Appointment[]): string {
  const today = new Date().toISOString().split("T")[0];
  const todaysAppts = appointments.filter((a) => {
    const apptDate = new Date(a.date).toISOString().split("T")[0];
    return apptDate === today;
  });

  if (todaysAppts.length === 0) {
    return "## 📅 Today's Schedule\n\n**No appointments scheduled for today.** You have a free day!";
  }

  return (
    `## 📅 Today's Schedule (${todaysAppts.length} appointments)\n\n` +
    formatAppointmentsTable(todaysAppts)
  );
}

function formatCriticalPatients(patients: Patient[]): string {
  const criticalPatients = patients.filter(
    (p) => p.status === "critical" || p.status === "urgent"
  );

  if (criticalPatients.length === 0) {
    return "## 🟢 Good News!\n\n**No critical patients** require immediate attention.";
  }

  return (
    `## 🔴 Critical Patients Alert (${criticalPatients.length} patients)\n\n` +
    formatPatientsTable(criticalPatients)
  );
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface MedicalHistory {
  id: string;
  patientId: string;
  condition: string;
  diagnosis: string;
  treatment: string;
  date: string;
}

interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  result: string;
  normalRange: string;
  date: string;
  status: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  patientId: string;
  prescribedDate: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface Allergy {
  id: string;
  patientId: string;
  allergen: string;
  severity: string;
  reaction: string;
}

interface Schedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface PrescriptionRenewal {
  id: string;
  patientId: string;
  prescriptionId: string;
  requestDate: string;
  status: string;
  notes: string;
}

// Get doctor info from JWT token
async function getDoctorInfo(request: NextRequest) {
  try {
    // Get token from cookie
    const cookieToken = request.cookies.get("auth-token")?.value;

    if (!cookieToken) {
      return null;
    }

    const decoded = verifyJWT(cookieToken);
    if (!decoded) {
      return null;
    }

    // Get doctor details from database
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "doctor-care-system");

    const doctor = await db.collection("doctors").findOne({
      _id: new ObjectId(decoded.doctorId),
    });

    return {
      id: decoded.doctorId,
      name: decoded.name,
      email: decoded.email,
      specialization: doctor?.specialization || "General Practice",
    };
  } catch (error) {
    console.error("Error getting doctor info:", error);
    return null;
  }
}

// Get all doctor's data from MongoDB
async function getDoctorData(doctorId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("Patient"); // Use the correct database name

    console.log("Fetching data for doctorId:", doctorId);

    // Get patients assigned to this doctor (using doctor_patient_assignments)
    const assignmentsCollection = db.collection("doctor_patient_assignments");
    const patientsCollection = db.collection("patients");

    // Find all patient assignments for this doctor
    const assignments = await assignmentsCollection
      .find({ doctorId: doctorId })
      .toArray();

    console.log("Found assignments:", assignments.length);

    const patientIds = assignments.map((assignment) => assignment.patientId);

    // Get patient details for assigned patients
    const patients = await patientsCollection
      .find({
        $or: [
          { id: { $in: patientIds } },
          { _id: { $in: patientIds.map((id) => new ObjectId(id)) } },
        ],
      })
      .limit(50)
      .toArray(); // Get ALL prescriptions for this doctor
    const prescriptions = await db
      .collection("prescriptions")
      .find({
        doctorId: doctorId,
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray(); // Get ALL appointments for this doctor (past 6 months + future)
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    const appointments = await db
      .collection("appointments")
      .find({
        doctorId: doctorId,
        appointmentDate: { $gte: sixMonthsAgo },
      })
      .sort({ appointmentDate: -1 })
      .limit(100)
      .toArray();

    // Get notifications for this doctor
    const notifications = await db
      .collection("notifications")
      .find({
        doctorId: doctorId,
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Get medical history records
    const medicalHistory = await db
      .collection("medical_history")
      .find({
        doctorId: doctorId,
      })
      .sort({ date: -1 })
      .limit(50)
      .toArray();

    // Get lab results
    const labResults = await db
      .collection("lab_results")
      .find({
        doctorId: doctorId,
      })
      .sort({ date: -1 })
      .limit(50)
      .toArray();

    // Get medications prescribed by this doctor
    const medications = await db
      .collection("medications")
      .find({
        prescribedBy: doctorId,
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    // Get doctor's messages
    const messages = await db
      .collection("messages")
      .find({
        $or: [{ senderId: doctorId }, { receiverId: doctorId }],
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Get allergies records for doctor's patients
    const allergies = await db
      .collection("allergies")
      .find({
        patientId: { $in: patientIds },
      })
      .toArray();

    // Get doctor's schedule/availability
    const schedule = await db
      .collection("doctor_schedule")
      .find({
        doctorId: doctorId,
      })
      .toArray();

    // Get prescription renewals
    const prescriptionRenewals = await db
      .collection("prescription_renewals")
      .find({
        doctorId: doctorId,
      })
      .sort({ requestDate: -1 })
      .limit(30)
      .toArray();
    console.log("Found comprehensive data:", {
      assignments: assignments.length,
      patients: patients.length,
      prescriptions: prescriptions.length,
      appointments: appointments.length,
      notifications: notifications.length,
      medicalHistory: medicalHistory.length,
      labResults: labResults.length,
      medications: medications.length,
      messages: messages.length,
      allergies: allergies.length,
      schedule: schedule.length,
      prescriptionRenewals: prescriptionRenewals.length,
    });
    return {
      patients: patients.map((p: { [key: string]: unknown }) => ({
        id: (p.id || p._id?.toString() || "") as string,
        name: (p.name || "") as string,
        age: (p.age || 0) as number,
        gender: (p.gender || "") as string,
        allergies: (p.allergies || []) as string[],
        currentMedications: (p.currentMedications || []) as string[],
        medicalHistory: (p.medicalHistory || []) as string[],
        status: (p.status || "stable") as string,
      })),
      prescriptions: prescriptions.map((p: { [key: string]: unknown }) => ({
        id: (p.id || p._id?.toString() || "") as string,
        patientName: (p.patientName || "") as string,
        diagnosis: (p.diagnosis || "") as string,
        medications: (p.medications || []) as string[],
        date: (p.date || "") as string,
        status: (p.status || "") as string,
      })),
      appointments: appointments.map((a: { [key: string]: unknown }) => ({
        id: (a.id || a._id?.toString() || "") as string,
        patientName: (a.patientName || "") as string,
        date: (a.appointmentDate || a.date || "") as string,
        time: (a.timeSlot || a.time || "") as string,
        type: (a.type || "") as string,
        status: (a.status || "") as string,
      })),
      notifications: notifications.map((n: { [key: string]: unknown }) => ({
        id: (n.id || n._id?.toString() || "") as string,
        title: (n.title || "") as string,
        message: (n.message || "") as string,
        type: (n.type || "") as string,
        isRead: (n.isRead || false) as boolean,
        createdAt: (n.createdAt || "") as string,
      })),
      medicalHistory: medicalHistory.map((m: { [key: string]: unknown }) => ({
        id: (m.id || m._id?.toString() || "") as string,
        patientId: (m.patientId || "") as string,
        condition: (m.condition || "") as string,
        diagnosis: (m.diagnosis || "") as string,
        treatment: (m.treatment || "") as string,
        date: (m.date || "") as string,
      })),
      labResults: labResults.map((l: { [key: string]: unknown }) => ({
        id: (l.id || l._id?.toString() || "") as string,
        patientId: (l.patientId || "") as string,
        testName: (l.testName || "") as string,
        result: (l.result || "") as string,
        normalRange: (l.normalRange || "") as string,
        date: (l.date || "") as string,
        status: (l.status || "") as string,
      })),
      medications: medications.map((m: { [key: string]: unknown }) => ({
        id: (m.id || m._id?.toString() || "") as string,
        name: (m.name || "") as string,
        dosage: (m.dosage || "") as string,
        frequency: (m.frequency || "") as string,
        patientId: (m.patientId || "") as string,
        prescribedDate: (m.prescribedDate || "") as string,
      })),
      messages: messages.map((m: { [key: string]: unknown }) => ({
        id: (m.id || m._id?.toString() || "") as string,
        senderId: (m.senderId || "") as string,
        receiverId: (m.receiverId || "") as string,
        subject: (m.subject || "") as string,
        content: (m.content || "") as string,
        createdAt: (m.createdAt || "") as string,
        isRead: (m.isRead || false) as boolean,
      })),
      allergies: allergies.map((a: { [key: string]: unknown }) => ({
        id: (a.id || a._id?.toString() || "") as string,
        patientId: (a.patientId || "") as string,
        allergen: (a.allergen || "") as string,
        severity: (a.severity || "") as string,
        reaction: (a.reaction || "") as string,
      })),
      schedule: schedule.map((s: { [key: string]: unknown }) => ({
        id: (s.id || s._id?.toString() || "") as string,
        dayOfWeek: (s.dayOfWeek || "") as string,
        startTime: (s.startTime || "") as string,
        endTime: (s.endTime || "") as string,
        isAvailable: (s.isAvailable || true) as boolean,
      })),
      prescriptionRenewals: prescriptionRenewals.map(
        (pr: { [key: string]: unknown }) => ({
          id: (pr.id || pr._id?.toString() || "") as string,
          patientId: (pr.patientId || "") as string,
          prescriptionId: (pr.prescriptionId || "") as string,
          requestDate: (pr.requestDate || "") as string,
          status: (pr.status || "") as string,
          notes: (pr.notes || "") as string,
        })
      ),
    };
  } catch (error) {
    console.error("Error fetching doctor data:", error);
    return {
      patients: [],
      prescriptions: [],
      appointments: [],
      notifications: [],
      medicalHistory: [],
      labResults: [],
      medications: [],
      messages: [],
      allergies: [],
      schedule: [],
      prescriptionRenewals: [],
    };
  }
}

// Create AI model with patient context
function createContextualModel(
  doctorInfo: {
    id: string;
    name: string;
    email: string;
    specialization: string;
  },
  patientData: DoctorData
) {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `You are an AI Medical Co-Pilot assistant for Dr. ${doctorInfo.name}, a ${doctorInfo.specialization}.

**FORMATTING GUIDELINES:**
- Always use markdown formatting for better readability
- Use tables for structured data (patients, appointments, prescriptions)
- Use bullet points for lists and key information
- Use headings and sections to organize information
- Include status badges and visual indicators when relevant
- Keep responses concise but comprehensive

**CURRENT DOCTOR CONTEXT:**
- **Doctor:** Dr. ${doctorInfo.name}
- **Specialization:** ${doctorInfo.specialization}
- **Total Patients:** ${patientData.patients.length}
- **Recent Prescriptions:** ${patientData.prescriptions.length}
- **Appointments:** ${patientData.appointments.length}

**PATIENT OVERVIEW** (Your current patients):
${patientData.patients
  .slice(0, 5)
  .map(
    (p: Patient) => `
- **${p.name}** (${p.age}yo, ${p.gender}) - Status: ${p.status === "critical" ? "🔴 Critical" : p.status === "stable" ? "🟢 Stable" : "🟡 " + p.status}
  - **Allergies:** ${p.allergies?.join(", ") || "None"}
  - **Current Medications:** ${p.currentMedications?.join(", ") || "None"}
  - **Medical History:** ${p.medicalHistory?.join(", ") || "None"}
`
  )
  .join("")}

**RECENT PRESCRIPTIONS:**
${patientData.prescriptions
  .slice(0, 3)
  .map(
    (p: Prescription) => `
- **${p.patientName}**: ${p.diagnosis} (${p.date})
  - Status: ${p.status === "active" ? "✅ Active" : p.status === "completed" ? "✔️ Completed" : "⏳ " + p.status}
`
  )
  .join("")}

**UPCOMING APPOINTMENTS:**
${patientData.appointments
  .slice(0, 3)
  .map(
    (a: Appointment) => `
- **${a.patientName}**: ${a.type} on ${a.date} at ${a.time}
  - Status: ${a.status === "confirmed" ? "✅ Confirmed" : a.status === "pending" ? "⏳ Pending" : "❌ " + a.status}
`
  )
  .join("")}

**CAPABILITIES:**
1. 📋 **Patient Information** - Detailed patient data with medical history
2. 🔬 **Clinical Decision Support** - Evidence-based diagnoses and treatments
3. 💊 **Prescription Management** - Drug recommendations and interaction checks
4. 📅 **Appointment Overview** - Schedule management and patient tracking
5. 📚 **Medical Research** - Latest medical information and guidelines

**RESPONSE FORMAT RULES:**
- When showing patient lists, use tables with columns: Name | Age | Gender | Status | Key Info
- When showing appointments, use tables with: Patient | Date | Time | Type | Status
- When showing prescriptions, use tables with: Patient | Diagnosis | Medications | Date | Status
- Use status emojis: 🔴 Critical, 🟡 Moderate, 🟢 Stable/Good, ✅ Active/Confirmed, ⏳ Pending, ❌ Cancelled
- Always include relevant medical context and safety considerations
- Reference specific patient data when available

Always prioritize patient safety and provide evidence-based recommendations.`,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = (await req.json()) as {
      message: string;
      history: Content[];
    };

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const doctorInfo = await getDoctorInfo(req);
    if (!doctorInfo) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Please log in to access the AI Medical Co-Pilot.",
        },
        { status: 401 }
      );
    }

    // Get the patient data for the doctor
    const patientData = await getDoctorData(doctorInfo.id);

    // Create a new model instance with the doctor and patient context
    const contextModel = createContextualModel(doctorInfo, patientData);

    // Filter and format the conversation history
    const validHistory = (history || []).filter(
      (msg: Content) => msg.role === "user" || msg.role === "model"
    );

    // Ensure the first message is from 'user' if history exists
    let chatHistory: Content[] = [];
    if (validHistory.length > 0) {
      if (validHistory[0].role === "user") {
        chatHistory = validHistory;
      } else {
        const firstUserIndex = validHistory.findIndex(
          (msg) => msg.role === "user"
        );
        if (firstUserIndex !== -1) {
          chatHistory = validHistory.slice(firstUserIndex);
        }
      }
    } // Start the chat with the properly formatted history
    const chat = contextModel.startChat({
      history: chatHistory,
    });

    // Check for specific formatting requests and pre-format data
    let enhancedMessage = message;
    let preFormattedData = "";

    // Detect common query patterns and provide pre-formatted responses
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("patient") &&
      (lowerMessage.includes("table") ||
        lowerMessage.includes("overview") ||
        lowerMessage.includes("list"))
    ) {
      preFormattedData = `\n\n**Patient Overview:**\n${formatPatientsTable(patientData.patients)}\n\n`;
    } else if (
      lowerMessage.includes("today") &&
      lowerMessage.includes("appointment")
    ) {
      preFormattedData = `\n\n${formatTodaysAppointments(patientData.appointments)}\n\n`;
    } else if (
      lowerMessage.includes("critical") ||
      lowerMessage.includes("urgent")
    ) {
      preFormattedData = `\n\n${formatCriticalPatients(patientData.patients)}\n\n`;
    } else if (
      lowerMessage.includes("prescription") &&
      (lowerMessage.includes("recent") || lowerMessage.includes("list"))
    ) {
      preFormattedData = `\n\n**Recent Prescriptions:**\n${formatPrescriptionsTable(patientData.prescriptions.slice(0, 10))}\n\n`;
    } else if (
      lowerMessage.includes("appointment") &&
      (lowerMessage.includes("upcoming") || lowerMessage.includes("scheduled"))
    ) {
      preFormattedData = `\n\n**Upcoming Appointments:**\n${formatAppointmentsTable(patientData.appointments.slice(0, 10))}\n\n`;
    }

    // Add context-aware formatting instructions to the user message
    enhancedMessage = `${message}

**Context Available:**
- Patients: ${patientData.patients.length} assigned
- Prescriptions: ${patientData.prescriptions.length} recent  
- Appointments: ${patientData.appointments.length} scheduled
- Notifications: ${patientData.notifications.length} unread

${preFormattedData}

Please provide a comprehensive response using markdown formatting with tables, bullet points, and status indicators for better readability. ${preFormattedData ? "I've included pre-formatted data above - please analyze it and provide insights." : ""}`;

    const result = await chat.sendMessage(enhancedMessage);
    const response = result.response;
    const aiResponse = response.text();

    return NextResponse.json({
      reply: aiResponse,
      context: {
        totalPatients: patientData.patients.length,
        recentPrescriptions: patientData.prescriptions.length,
        upcomingAppointments: patientData.appointments.length,
        doctorName: doctorInfo.name,
        specialization: doctorInfo.specialization,
      },
    });
  } catch (error) {
    console.error(
      "[ENHANCED_AI_COPILOT_ERROR] A critical error occurred:",
      error
    );
    return NextResponse.json(
      {
        error:
          "An internal server error occurred while contacting the AI Medical Co-Pilot.",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to provide initial context
export async function GET(req: NextRequest) {
  try {
    const doctor = await getDoctorInfo(req);
    if (!doctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientData = await getDoctorData(doctor.id);

    return NextResponse.json({
      doctorInfo: {
        name: doctor.name,
        specialization: doctor.specialization,
        email: doctor.email,
      },
      summary: {
        totalPatients: patientData.patients.length,
        recentPrescriptions: patientData.prescriptions.length,
        upcomingAppointments: patientData.appointments.length,
        criticalPatients: patientData.patients.filter(
          (p) => p.status === "critical"
        ).length,
        recentPatients: patientData.patients.slice(0, 5).map((p) => ({
          name: p.name,
          age: p.age,
          status: p.status,
        })),
      },
    });
  } catch (error) {
    console.error("[AI_COPILOT_CONTEXT_ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to load AI Medical Co-Pilot context" },
      { status: 500 }
    );
  }
}
