import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Direct MCP implementation without spawning external processes
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...params } = body;

    console.log(`MCP Direct API: ${action}`, params);

    let result;

    switch (action) {
      case "get_enhanced_patient_context":
        result = await getEnhancedPatientContext(params.patientId);
        break;

      case "create_prescription_with_gemini":
        result = await createPrescriptionWithGemini(
          params.patientId,
          params.symptoms,
          params.diagnosis,
          params.doctorId,
          params.doctorName,
          params.notes
        );
        break;

      case "validate_prescription_safety":
        result = await validatePrescriptionSafety(
          params.patientId,
          params.medications
        );
        break;

      case "check_drug_interactions":
        result = await checkDrugInteractions(
          params.patientId,
          params.newMedications
        );
        break;

      case "suggest_prescription_improvements":
        result = await suggestPrescriptionImprovements(
          params.patientId,
          params.currentPrescription,
          params.symptoms
        );
        break;

      case "get_doctor_preferences":
        result = await getDoctorPreferences(
          params.doctorId,
          params.symptoms,
          params.diagnosis
        );
        break;

      case "get_patient_history":
        result = await getPatientHistory(params.patientId);
        break;

      case "search_prescriptions":
        result = await searchPrescriptions(
          params.patientId,
          params.status,
          params.doctorId
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("MCP Direct API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Enhanced Patient Context
async function getEnhancedPatientContext(patientId: string) {
  const client = await clientPromise;
  const db = client.db("Patient");

  // Get patient
  const patient = await db
    .collection("patients")
    .findOne(
      ObjectId.isValid(patientId)
        ? { _id: new ObjectId(patientId) }
        : { id: patientId }
    );

  if (!patient) {
    throw new Error(`Patient ${patientId} not found`);
  }

  // Get prescriptions
  const prescriptions = await db
    .collection("prescriptions")
    .find({ patientId })
    .sort({ createdAt: -1 })
    .toArray();

  // Analyze risk factors
  const riskFactors = [];
  if (patient.allergies?.length > 0) {
    riskFactors.push(`Allergies: ${patient.allergies.join(", ")}`);
  }
  if (patient.currentMedications?.length > 0) {
    riskFactors.push(
      `Current medications: ${patient.currentMedications.join(", ")}`
    );
  }

  const enhancedContext = {
    riskLevel:
      patient.allergies?.length > 2
        ? "HIGH"
        : patient.allergies?.length > 0
          ? "MEDIUM"
          : "LOW",
    keyRiskFactors: riskFactors,
    treatmentHistory: {
      totalPrescriptions: prescriptions.length,
      recentTreatments: prescriptions.slice(0, 5).map((p) => ({
        diagnosis: p.diagnosis,
        medications: p.medications?.map((m: any) => m.name) || [],
        date: p.date,
        status: p.status,
      })),
    },
    recommendations: [
      "Review current medications for interactions",
      "Check allergy status before prescribing",
      "Consider patient's treatment history for effectiveness",
    ],
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            patient,
            enhancedContext,
            lastUpdated: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ],
  };
}

// Create Prescription with Gemini
async function createPrescriptionWithGemini(
  patientId: string,
  symptoms: string[],
  diagnosis?: string,
  doctorId: string = "DOC001",
  doctorName: string = "Dr. Smith",
  notes?: string
) {
  const client = await clientPromise;
  const db = client.db("Patient");

  // Get patient
  const patient = await db
    .collection("patients")
    .findOne(
      ObjectId.isValid(patientId)
        ? { _id: new ObjectId(patientId) }
        : { id: patientId }
    );

  if (!patient) {
    throw new Error(`Patient ${patientId} not found`);
  }

  // Get prescription history
  const prescriptions = await db
    .collection("prescriptions")
    .find({ patientId })
    .sort({ createdAt: -1 })
    .toArray();

  let geminiResponse = null;
  let medications = [];

  // Try Gemini AI if available
  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
You are an expert medical AI. Create a prescription for:

PATIENT: ${patient.name}, Age: ${patient.age}, Gender: ${patient.gender}
ALLERGIES: ${patient.allergies?.join(", ") || "None"}
CURRENT MEDICATIONS: ${patient.currentMedications?.join(", ") || "None"}
MEDICAL HISTORY: ${patient.medicalHistory?.join(", ") || "None"}

SYMPTOMS: ${symptoms.join(", ")}
DIAGNOSIS: ${diagnosis || "To be determined"}

PREVIOUS PRESCRIPTIONS: ${prescriptions
        .slice(0, 3)
        .map(
          (p) =>
            `Date: ${p.date}, Diagnosis: ${p.diagnosis}, Medications: ${p.medications?.map((m: any) => m.name).join(", ") || "None"}`
        )
        .join(" | ")}

Provide response in JSON format:
{
  "final_diagnosis": "specific diagnosis",
  "medications": [
    {
      "name": "Drug name",
      "strength": "dosage strength",
      "dosage": "amount per dose",
      "frequency": "how often",
      "duration": "how long",
      "instructions": "specific instructions"
    }
  ],
  "confidence": 0.85,
  "warnings": ["any warnings"],
  "reasoning": "explanation of treatment choice"
}
`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      geminiResponse = response.text();

      // Extract JSON from response
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const geminiData = JSON.parse(jsonMatch[0]);
        medications =
          geminiData.medications?.map((med: any, index: number) => ({
            id: `M${Date.now()}_${index}`,
            name: med.name,
            strength: med.strength,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            instructions: med.instructions,
            quantity: 30,
            refills: 0,
          })) || [];
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      // Fallback to basic medication
      medications = [
        {
          id: `M${Date.now()}`,
          name: "Paracetamol",
          strength: "500mg",
          dosage: "1 tablet",
          frequency: "Every 6 hours",
          duration: "3 days",
          instructions: "Take with food if stomach upset",
          quantity: 12,
          refills: 0,
        },
      ];
    }
  } else {
    // Fallback medications
    medications = [
      {
        id: `M${Date.now()}`,
        name: "Paracetamol",
        strength: "500mg",
        dosage: "1 tablet",
        frequency: "Every 6 hours",
        duration: "3 days",
        instructions: "Take with food if stomach upset",
        quantity: 12,
        refills: 0,
      },
    ];
  }

  // Create prescription
  const newPrescription = {
    id: `RX${Date.now()}`,
    patientId,
    patientName: patient.name,
    doctorId,
    doctorName,
    date: new Date().toISOString().split("T")[0],
    diagnosis: diagnosis || "Symptomatic treatment",
    symptoms,
    medications,
    notes,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAiGenerated: true,
    geminiResponse,
  };

  // Save to database
  await db.collection("prescriptions").insertOne(newPrescription);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            prescription: newPrescription,
            geminiUsed: !!geminiResponse,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ],
  };
}

// Validate Prescription Safety
async function validatePrescriptionSafety(
  patientId: string,
  medications: any[]
) {
  const client = await clientPromise;
  const db = client.db("Patient");

  const patient = await db
    .collection("patients")
    .findOne(
      ObjectId.isValid(patientId)
        ? { _id: new ObjectId(patientId) }
        : { id: patientId }
    );

  if (!patient) {
    throw new Error(`Patient ${patientId} not found`);
  }

  const safetyChecks = {
    allergyConflicts: [] as any[],
    drugInteractions: [] as any[],
    overallSafety: "SAFE",
  };

  // Check allergies
  if (patient.allergies) {
    for (const med of medications) {
      for (const allergy of patient.allergies) {
        if (
          med.name.toLowerCase().includes(allergy.toLowerCase()) ||
          allergy.toLowerCase().includes(med.name.toLowerCase())
        ) {
          safetyChecks.allergyConflicts.push({
            medication: med.name,
            allergy: allergy,
            severity: "HIGH",
          });
          safetyChecks.overallSafety = "UNSAFE";
        }
      }
    }
  }

  // Basic drug interaction check
  const knownInteractions = [
    ["warfarin", "aspirin"],
    ["metformin", "contrast"],
    ["lithium", "ibuprofen"],
  ];

  for (const med of medications) {
    if (patient.currentMedications) {
      for (const currentMed of patient.currentMedications) {
        for (const [drug1, drug2] of knownInteractions) {
          if (
            (med.name.toLowerCase().includes(drug1) &&
              currentMed.toLowerCase().includes(drug2)) ||
            (med.name.toLowerCase().includes(drug2) &&
              currentMed.toLowerCase().includes(drug1))
          ) {
            safetyChecks.drugInteractions.push({
              newMedication: med.name,
              existingMedication: currentMed,
              severity: "MODERATE",
              recommendation: "Monitor closely",
            });
            if (safetyChecks.overallSafety === "SAFE") {
              safetyChecks.overallSafety = "CAUTION";
            }
          }
        }
      }
    }
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            safetyAssessment: safetyChecks,
            patientId,
            checkedMedications: medications,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ],
  };
}

// Check Drug Interactions
async function checkDrugInteractions(
  patientId: string,
  newMedications: string[]
) {
  const client = await clientPromise;
  const db = client.db("Patient");

  const patient = await db
    .collection("patients")
    .findOne(
      ObjectId.isValid(patientId)
        ? { _id: new ObjectId(patientId) }
        : { id: patientId }
    );

  if (!patient) {
    throw new Error(`Patient ${patientId} not found`);
  }

  const interactions = {
    major: [] as any[],
    moderate: [] as any[],
    minor: [] as any[],
    recommendations: [] as string[],
  };

  const knownInteractions = new Map([
    [
      "warfarin-aspirin",
      { severity: "major", effect: "Increased bleeding risk" },
    ],
    [
      "metformin-contrast",
      { severity: "major", effect: "Risk of lactic acidosis" },
    ],
    [
      "lithium-ibuprofen",
      { severity: "moderate", effect: "Increased lithium levels" },
    ],
  ]);

  if (patient.currentMedications) {
    for (const newMed of newMedications) {
      for (const currentMed of patient.currentMedications) {
        const key1 = `${newMed.toLowerCase()}-${currentMed.toLowerCase()}`;
        const key2 = `${currentMed.toLowerCase()}-${newMed.toLowerCase()}`;

        const interaction =
          knownInteractions.get(key1) || knownInteractions.get(key2);

        if (interaction) {
          const data = {
            newMedication: newMed,
            existingMedication: currentMed,
            effect: interaction.effect,
            action: "Monitor closely",
          };

          if (interaction.severity === "major") {
            interactions.major.push(data);
          } else if (interaction.severity === "moderate") {
            interactions.moderate.push(data);
          } else {
            interactions.minor.push(data);
          }
        }
      }
    }
  }

  if (interactions.major.length > 0) {
    interactions.recommendations.push("URGENT: Major interactions detected");
  } else if (interactions.moderate.length > 0) {
    interactions.recommendations.push("Monitor patient closely");
  } else {
    interactions.recommendations.push("No significant interactions detected");
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            drugInteractionAnalysis: interactions,
            checkedMedications: newMedications,
            patientCurrentMedications: patient.currentMedications || [],
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ],
  };
}

// Suggest Prescription Improvements
async function suggestPrescriptionImprovements(
  patientId: string,
  currentPrescription: any,
  symptoms: string[]
) {
  const client = await clientPromise;
  const db = client.db("Patient");

  const patient = await db
    .collection("patients")
    .findOne(
      ObjectId.isValid(patientId)
        ? { _id: new ObjectId(patientId) }
        : { id: patientId }
    );

  if (!patient) {
    throw new Error(`Patient ${patientId} not found`);
  }

  const improvements = {
    dosageOptimization: [] as any[],
    costOptimization: [] as any[],
    efficacyImprovements: [] as any[],
  };

  // Age-based recommendations
  if (patient.age > 65) {
    improvements.dosageOptimization.push({
      recommendation: "Consider reduced dosage for elderly patient",
      reason: "Elderly patients may require lower doses",
    });
  }

  // Generic alternatives
  improvements.costOptimization.push({
    recommendation: "Consider generic alternatives where available",
    reason: "Reduce patient cost burden",
  });

  // Based on history
  const prescriptions = await db
    .collection("prescriptions")
    .find({ patientId, status: "completed" })
    .toArray();

  if (prescriptions.length > 0) {
    improvements.efficacyImprovements.push({
      recommendation: "Consider medications that worked well previously",
      successfulMedications: prescriptions
        .flatMap((p) => p.medications?.map((m: any) => m.name) || [])
        .slice(0, 3),
    });
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            prescriptionImprovements: improvements,
            analysisDate: new Date().toISOString(),
            patientContext: {
              age: patient.age,
              allergies: patient.allergies,
              treatmentHistory: prescriptions.length,
            },
          },
          null,
          2
        ),
      },
    ],
  };
}

// Get Doctor Preferences
async function getDoctorPreferences(
  doctorId: string,
  symptoms?: string[],
  diagnosis?: string
) {
  const client = await clientPromise;
  const db = client.db("Patient");

  const doctorPrescriptions = await db
    .collection("prescriptions")
    .find({ doctorId })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const medicationFrequency = new Map();

  for (const prescription of doctorPrescriptions) {
    if (prescription.medications) {
      for (const med of prescription.medications) {
        const medName = med.name || "";
        medicationFrequency.set(
          medName,
          (medicationFrequency.get(medName) || 0) + 1
        );
      }
    }
  }

  const topMedications = Array.from(medicationFrequency.entries())
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([med, count]) => ({ medication: med, frequency: count }));

  const preferences = {
    totalPrescriptions: doctorPrescriptions.length,
    preferredMedications: topMedications,
    prescribingStyle: {
      averageMedicationsPerPrescription:
        doctorPrescriptions.length > 0
          ? doctorPrescriptions.reduce(
              (acc, p) => acc + (p.medications?.length || 0),
              0
            ) / doctorPrescriptions.length
          : 0,
    },
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            doctorPreferences: preferences,
            doctorId,
            analysisDate: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ],
  };
}

// Get Patient History
async function getPatientHistory(patientId: string) {
  const client = await clientPromise;
  const db = client.db("Patient");

  const patient = await db
    .collection("patients")
    .findOne(
      ObjectId.isValid(patientId)
        ? { _id: new ObjectId(patientId) }
        : { id: patientId }
    );

  if (!patient) {
    throw new Error(`Patient ${patientId} not found`);
  }

  const prescriptions = await db
    .collection("prescriptions")
    .find({ patientId })
    .sort({ createdAt: -1 })
    .toArray();

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            patient,
            prescriptionHistory: prescriptions,
            totalPrescriptions: prescriptions.length,
          },
          null,
          2
        ),
      },
    ],
  };
}

// Search Prescriptions
async function searchPrescriptions(
  patientId?: string,
  status?: string,
  doctorId?: string
) {
  const client = await clientPromise;
  const db = client.db("Patient");

  const query: any = {};
  if (patientId) query.patientId = patientId;
  if (status) query.status = status;
  if (doctorId) query.doctorId = doctorId;

  const prescriptions = await db
    .collection("prescriptions")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            prescriptions,
            count: prescriptions.length,
            query,
          },
          null,
          2
        ),
      },
    ],
  };
}
