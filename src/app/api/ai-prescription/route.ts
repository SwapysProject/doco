import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface Medication {
  id?: string;
  name: string;
  strength: string;
  frequency: string;
  duration: string;
}

// Enhanced AI prescription generation with prescription history analysis
async function generateIntelligentPrescription(
  patientId: string,
  symptoms: string[],
  diagnosis?: string,
  doctorId: string = "DOC001",
  doctorName: string = "Dr. Smith"
) {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");
    // Get patient information
    const patientsCollection = db.collection("patients");
    let patient;

    // Try to find by string ID first, then by ObjectId
    try {
      patient = await patientsCollection.findOne({ id: patientId });
      if (!patient && ObjectId.isValid(patientId)) {
        patient = await patientsCollection.findOne({
          _id: new ObjectId(patientId),
        });
      }
    } catch {
      patient = await patientsCollection.findOne({ id: patientId });
    }

    if (!patient) {
      throw new Error(`Patient with ID ${patientId} not found`);
    }

    // Get prescription history
    const prescriptionsCollection = db.collection("prescriptions");
    const prescriptionHistory = await prescriptionsCollection
      .find({ patientId })
      .sort({ createdAt: -1 })
      .toArray();

    // Analyze existing prescriptions
    const activePrescriptions = prescriptionHistory.filter(
      (p) => p.status === "active"
    );
    const recentPrescriptions = prescriptionHistory.filter((p) => {
      const prescriptionDate = new Date(p.createdAt || p.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return prescriptionDate >= thirtyDaysAgo;
    });

    // Extract current medications from active prescriptions
    const currentMedications = activePrescriptions.flatMap(
      (p) => p.medications?.map((m: { name: string }) => m.name) || []
    );

    // Analyze symptoms and generate prescription
    const aiAnalysis = await analyzeSymptomsAndHistory({
      patient,
      symptoms,
      diagnosis,
      activePrescriptions,
      recentPrescriptions,
      currentMedications,
      allergies: patient.allergies || [],
      medicalHistory:
        patient.medicalHistory || [patient.condition].filter(Boolean),
    });

    // Generate prescription based on analysis
    const prescription = {
      id: `RX${Date.now()}`,
      patientId,
      patientName: patient.name,
      doctorId,
      doctorName,
      date: new Date().toISOString().split("T")[0],
      diagnosis: aiAnalysis.finalDiagnosis,
      symptoms,
      medications: aiAnalysis.medications,
      notes: aiAnalysis.notes,
      status: "pending", // Pending until doctor approval
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAiGenerated: true,
      aiConfidence: aiAnalysis.confidence,
      aiAnalysis: {
        conflictWarnings: aiAnalysis.conflictWarnings,
        recommendations: aiAnalysis.recommendations,
        reasoning: aiAnalysis.reasoning,
      },
    };

    return {
      success: true,
      prescription,
      analysis: aiAnalysis,
      patientContext: {
        activePrescriptions: activePrescriptions.length,
        recentPrescriptions: recentPrescriptions.length,
        totalPrescriptions: prescriptionHistory.length,
        currentMedications,
      },
    };
  } catch (error) {
    console.error("Error generating intelligent prescription:", error);
    throw error;
  }
}

// AI analysis function that considers patient history and symptoms
async function analyzeSymptomsAndHistory(context: {
  patient: Record<string, unknown>;
  symptoms: string[];
  diagnosis?: string;
  activePrescriptions: Record<string, unknown>[];
  recentPrescriptions: Record<string, unknown>[];
  currentMedications: string[];
  allergies: string[];
  medicalHistory: string[];
}) {
  const {
    patient,
    symptoms,
    diagnosis,
    activePrescriptions,
    currentMedications,
    allergies,
    medicalHistory,
  } = context;

  // Symptom-to-medication mapping (simplified AI logic)
  const symptomMedicationMap: Record<string, Medication> = {
    headache: {
      name: "Ibuprofen",
      strength: "400mg",
      frequency: "every 6-8 hours as needed",
      duration: "7 days",
    },
    fever: {
      name: "Acetaminophen",
      strength: "500mg",
      frequency: "every 4-6 hours as needed",
      duration: "5 days",
    },
    cough: {
      name: "Dextromethorphan",
      strength: "15mg",
      frequency: "every 4 hours as needed",
      duration: "10 days",
    },
    pain: {
      name: "Ibuprofen",
      strength: "400mg",
      frequency: "every 6-8 hours as needed",
      duration: "7 days",
    },
    nausea: {
      name: "Ondansetron",
      strength: "4mg",
      frequency: "every 8 hours as needed",
      duration: "3 days",
    },
  };

  // Analyze conflicts and generate warnings
  const conflictWarnings: string[] = [];
  const recommendations: string[] = [];

  // Check for active prescriptions
  if (activePrescriptions.length > 0) {
    conflictWarnings.push(
      `Patient has ${activePrescriptions.length} active prescription(s)`
    );
    recommendations.push(
      "Review active prescriptions before prescribing new medications"
    );
  }

  // Check for drug allergies
  const proposedMedications = symptoms.map((symptom) => {
    const normalizedSymptom = symptom.toLowerCase().trim();
    return (
      symptomMedicationMap[normalizedSymptom] || symptomMedicationMap["pain"]
    ); // Default fallback
  });

  for (const med of proposedMedications) {
    for (const allergy of allergies) {
      if (
        med.name.toLowerCase().includes(allergy.toLowerCase()) ||
        allergy.toLowerCase().includes(med.name.toLowerCase())
      ) {
        conflictWarnings.push(
          `ALLERGY ALERT: Patient is allergic to ${allergy}, avoid ${med.name}`
        );
      }
    }
  }

  // Check for drug interactions with current medications
  for (const currentMed of currentMedications) {
    for (const newMed of proposedMedications) {
      if (
        currentMed.toLowerCase().includes("ibuprofen") &&
        newMed.name.toLowerCase().includes("ibuprofen")
      ) {
        conflictWarnings.push(
          `Potential duplicate therapy: Patient already on ${currentMed}`
        );
      }
    }
  }

  // Generate medications with safety considerations
  const safeMedications = proposedMedications
    .filter((med) => {
      // Filter out medications that conflict with allergies
      return !allergies.some(
        (allergy) =>
          med.name.toLowerCase().includes(allergy.toLowerCase()) ||
          allergy.toLowerCase().includes(med.name.toLowerCase())
      );
    })
    .map((med, index) => ({
      id: `M${Date.now()}_${index}`,
      name: med.name,
      genericName: med.name,
      strength: med.strength,
      form: "tablet",
      quantity: 30,
      dosage: med.strength,
      frequency: med.frequency,
      duration: med.duration,
      instructions: "Take as directed",
      refills: 0,
      cost: Math.floor(Math.random() * 50) + 10,
    }));

  // Generate reasoning
  const reasoning = `
    Analysis for ${patient.name} (Age: ${patient.age}, Gender: ${
    patient.gender
  }):
    
    Symptoms: ${symptoms.join(", ")}
    ${diagnosis ? `Preliminary Diagnosis: ${diagnosis}` : ""}
    
    Patient History:
    - Active Prescriptions: ${activePrescriptions.length}
    - Medical History: ${medicalHistory.join(", ") || "None"}
    - Known Allergies: ${allergies.join(", ") || "None"}
    - Current Medications: ${currentMedications.join(", ") || "None"}
    
    AI Recommendation: Based on symptoms and patient history, prescribing ${
      safeMedications.length
    } medication(s).
    ${
      conflictWarnings.length > 0
        ? `⚠️ Warnings: ${conflictWarnings.join("; ")}`
        : "✅ No conflicts detected"
    }
  `.trim();

  return {
    finalDiagnosis:
      diagnosis || `Symptom-based treatment for: ${symptoms.join(", ")}`,
    medications: safeMedications,
    confidence: conflictWarnings.length === 0 ? 0.9 : 0.6,
    conflictWarnings,
    recommendations,
    reasoning,
    notes: `AI-generated prescription considering patient history and current medications. ${
      conflictWarnings.length > 0
        ? "REQUIRES DOCTOR REVIEW due to potential conflicts."
        : "Safe to prescribe with standard monitoring."
    }`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { patientId, symptoms, diagnosis, doctorId, doctorName, action } =
      await req.json();

    if (action === "analyze_and_generate") {
      if (!patientId || !symptoms || !Array.isArray(symptoms)) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing required fields: patientId, symptoms",
          },
          { status: 400 }
        );
      }

      const result = await generateIntelligentPrescription(
        patientId,
        symptoms,
        diagnosis,
        doctorId,
        doctorName
      );

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in AI prescription service:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
