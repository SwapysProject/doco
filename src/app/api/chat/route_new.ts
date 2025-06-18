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
}

// Get doctor data from JWT and database
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
    const db = client.db("doctor-care-system");

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

// Get patient data for the doctor
async function getDoctorPatients(doctorId: string): Promise<DoctorData> {
  try {
    const client = await clientPromise;
    const db = client.db("doctor-care-system");

    console.log("Fetching data for doctorId:", doctorId);

    // Get patients assigned to this doctor
    const patients = await db
      .collection("patients")
      .find({
        doctorId: doctorId,
      })
      .limit(20)
      .toArray();

    // Get recent prescriptions
    const prescriptions = await db
      .collection("prescriptions")
      .find({
        doctorId: doctorId,
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Get recent appointments
    const appointments = await db
      .collection("appointments")
      .find({
        doctorId: doctorId,
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      })
      .sort({ date: -1 })
      .limit(10)
      .toArray();

    console.log("Found:", {
      patients: patients.length,
      prescriptions: prescriptions.length,
      appointments: appointments.length,
    });

    return {
      patients: patients.map((p) => ({
        id: p.id || p._id?.toString(),
        name: p.name,
        age: p.age,
        gender: p.gender,
        allergies: p.allergies || [],
        currentMedications: p.currentMedications || [],
        medicalHistory: p.medicalHistory || [],
        status: p.status || "stable",
      })),
      prescriptions: prescriptions.map((p) => ({
        id: p.id || p._id?.toString(),
        patientName: p.patientName,
        diagnosis: p.diagnosis,
        medications: p.medications || [],
        date: p.date,
        status: p.status,
      })),
      appointments: appointments.map((a) => ({
        id: a.id || a._id?.toString(),
        patientName: a.patientName,
        date: a.date,
        time: a.time,
        type: a.type,
        status: a.status,
      })),
    };
  } catch (error) {
    console.error("Error fetching doctor data:", error);
    return { patients: [], prescriptions: [], appointments: [] };
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

CURRENT DOCTOR CONTEXT:
- Doctor: Dr. ${doctorInfo.name}
- Specialization: ${doctorInfo.specialization}
- Total Patients: ${patientData.patients.length}
- Recent Prescriptions: ${patientData.prescriptions.length}
- Upcoming Appointments: ${patientData.appointments.length}

PATIENT OVERVIEW (Your current patients):
${patientData.patients
  .slice(0, 5)
  .map(
    (p: Patient) => `
- ${p.name} (${p.age}yo, ${p.gender}, Status: ${p.status})
  Allergies: ${p.allergies?.join(", ") || "None"}
  Current Medications: ${p.currentMedications?.join(", ") || "None"}
  Medical History: ${p.medicalHistory?.join(", ") || "None"}
`
  )
  .join("")}

RECENT PRESCRIPTIONS:
${patientData.prescriptions
  .slice(0, 3)
  .map(
    (p: Prescription) => `
- ${p.patientName}: ${p.diagnosis} (${p.date})
  Status: ${p.status}
`
  )
  .join("")}

UPCOMING APPOINTMENTS:
${patientData.appointments
  .slice(0, 3)
  .map(
    (a: Appointment) => `
- ${a.patientName}: ${a.type} on ${a.date} at ${a.time} (${a.status})
`
  )
  .join("")}

You can help with:
1. **Patient Information** - Answer questions about specific patients
2. **Clinical Decision Support** - Suggest diagnoses and treatments
3. **Prescription Assistance** - Recommend medications and check interactions
4. **Appointment Management** - Provide schedule overview
5. **Medical Research** - Provide evidence-based information

Always prioritize patient safety and provide evidence-based recommendations. Reference specific patient data when relevant.`,
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
    const patientData = await getDoctorPatients(doctorInfo.id);

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
    }

    // Start the chat with the properly formatted history
    const chat = contextModel.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);
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

    const patientData = await getDoctorPatients(doctor.id);

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
