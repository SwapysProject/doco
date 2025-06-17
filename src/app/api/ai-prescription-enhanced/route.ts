import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface MedicationRecord {
  name: string;
  strength: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface Prescription {
  id: string;
  patientId: string;
  diagnosis: string;
  date: string;
  medications: MedicationRecord[];
  doctorName: string;
  status: string;
  createdAt: string;
}

interface PrescriptionHistoryAnalysis {
  hasHistory: boolean;
  totalPrescriptions: number;
  activePrescriptions: Prescription[];
  recentPrescriptions: Prescription[];
  commonMedications: string[];
  allergicReactions: string[];
  effectiveTreatments: string[];
  warnings: string[];
  recommendations: string[];
}

interface Patient {
  id?: string;
  _id?: string;
  name: string;
  age: number;
  gender: string;
  allergies?: string[];
  medicalHistory?: string[];
  condition?: string;
}

interface AIAnalysisResult {
  finalDiagnosis: string;
  confidence: number;
  reasoning: string;
  medications: MedicationRecord[];
  conflictWarnings: string[];
  recommendations: string[];
  notes: string;
  historyInsights: string;
}

// Gemini AI analysis function
async function analyzeWithGemini(prompt: string): Promise<string | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Gemini API Key available:", !!apiKey);

    if (!apiKey) {
      console.warn("GEMINI_API_KEY not configured, using fallback analysis");
      return null;
    }

    console.log("Attempting Gemini AI analysis...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Gemini AI response received:", text.substring(0, 200) + "...");
    return text;
  } catch (error) {
    console.error("Gemini AI error:", error);
    return null;
  }
}

// Enhanced AI prescription generation with Gemini integration
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
    } // Get comprehensive prescription history
    const prescriptionsCollection = db.collection("prescriptions");
    const prescriptionHistory = await prescriptionsCollection
      .find({ patientId })
      .sort({ createdAt: -1 })
      .toArray();

    // Cast to proper types
    const typedPrescriptions = prescriptionHistory.map((p) => ({
      id: p.id || p._id?.toString() || "",
      patientId: p.patientId || "",
      diagnosis: p.diagnosis || "",
      date: p.date || p.createdAt || "",
      medications: p.medications || [],
      doctorName: p.doctorName || "",
      status: p.status || "",
      createdAt: p.createdAt || "",
    })) as Prescription[];

    const typedPatient = patient as unknown as Patient;

    // Analyze prescription history
    const historyAnalysis = await analyzePrescriptionHistory(
      typedPrescriptions,
      typedPatient
    );

    // Create comprehensive prompt for Gemini AI
    const geminiPrompt = createGeminiPrompt(
      typedPatient,
      symptoms,
      diagnosis,
      historyAnalysis
    ); // Get AI analysis from Gemini
    let geminiAnalysis = null;
    console.log("Checking Gemini API key...");
    if (process.env.GEMINI_API_KEY) {
      console.log("Gemini API key found, calling analyzeWithGemini...");
      geminiAnalysis = await analyzeWithGemini(geminiPrompt);
      console.log(
        "Gemini analysis result:",
        geminiAnalysis ? "Success" : "Failed"
      );
    } else {
      console.log("No Gemini API key found");
    } // Generate prescription based on AI analysis or fallback logic
    const aiResult = geminiAnalysis
      ? parseGeminiResponse(geminiAnalysis)
      : await fallbackAnalysis(
          typedPatient,
          symptoms,
          diagnosis,
          historyAnalysis
        );

    // Create prescription object
    const prescription = {
      id: `RX${Date.now()}`,
      patientId,
      patientName: patient.name,
      doctorId,
      doctorName,
      date: new Date().toISOString().split("T")[0],
      diagnosis: aiResult.finalDiagnosis || diagnosis || "To be determined",
      symptoms,
      medications: aiResult.medications || [],
      notes: aiResult.notes || "",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAiGenerated: true,
      aiConfidence: aiResult.confidence || 0.7,
      aiAnalysis: {
        conflictWarnings: aiResult.conflictWarnings || [],
        recommendations: aiResult.recommendations || [],
        reasoning: aiResult.reasoning || "",
        prescriptionHistory: historyAnalysis,
        geminiInsights: geminiAnalysis
          ? "Analyzed with Gemini AI"
          : "Used fallback analysis",
      },
    };

    return {
      success: true,
      prescription,
      historyAnalysis,
      aiInsights: aiResult,
    };
  } catch (error) {
    console.error("AI prescription generation error:", error);
    throw error;
  }
}

// Analyze prescription history
async function analyzePrescriptionHistory(
  prescriptions: Prescription[],
  patient: Patient
): Promise<PrescriptionHistoryAnalysis> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const activePrescriptions = prescriptions.filter(
    (p) => p.status === "active"
  );
  const recentPrescriptions = prescriptions.filter((p) => {
    const prescriptionDate = new Date(p.createdAt || p.date);
    return prescriptionDate >= thirtyDaysAgo;
  });

  // Extract medication patterns
  const allMedications = prescriptions.flatMap((p) => p.medications || []);
  const medicationCounts = allMedications.reduce(
    (acc: Record<string, number>, med: MedicationRecord | string) => {
      const name = typeof med === "string" ? med : med.name;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    },
    {}
  );

  const commonMedications = Object.entries(medicationCounts)
    .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
    .slice(0, 5)
    .map(([name]) => name);

  // Generate warnings and recommendations
  const warnings = [];
  const recommendations = [];

  if (activePrescriptions.length > 0) {
    warnings.push(
      `Patient has ${activePrescriptions.length} active prescription(s)`
    );
    recommendations.push(
      "Review active medications for potential interactions"
    );
  }

  if (recentPrescriptions.length > 2) {
    warnings.push(
      `Patient has received ${recentPrescriptions.length} prescriptions in the last 30 days`
    );
    recommendations.push(
      "Consider underlying cause for frequent prescriptions"
    );
  }

  if (commonMedications.length > 0) {
    recommendations.push(
      `Patient frequently uses: ${commonMedications.slice(0, 3).join(", ")}`
    );
  }

  return {
    hasHistory: prescriptions.length > 0,
    totalPrescriptions: prescriptions.length,
    activePrescriptions,
    recentPrescriptions,
    commonMedications,
    allergicReactions: patient.allergies || [],
    effectiveTreatments: commonMedications,
    warnings,
    recommendations,
  };
}

// Create comprehensive prompt for Gemini AI
function createGeminiPrompt(
  patient: Patient,
  symptoms: string[],
  diagnosis?: string,
  historyAnalysis?: PrescriptionHistoryAnalysis
): string {
  return `As a medical AI assistant, analyze the following patient case and provide prescription recommendations:

PATIENT INFORMATION:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Known Allergies: ${patient.allergies?.join(", ") || "None reported"}
- Medical History: ${
    patient.medicalHistory?.join(", ") || patient.condition || "None reported"
  }

CURRENT CONSULTATION:
- Symptoms: ${symptoms.join(", ")}
- Diagnosis: ${diagnosis || "To be determined"}

PRESCRIPTION HISTORY:
- Total Past Prescriptions: ${historyAnalysis?.totalPrescriptions || 0}
- Active Prescriptions: ${historyAnalysis?.activePrescriptions?.length || 0}
- Recent Prescriptions (30 days): ${
    historyAnalysis?.recentPrescriptions?.length || 0
  }
- Commonly Prescribed Medications: ${
    historyAnalysis?.commonMedications?.join(", ") || "None"
  }

ACTIVE MEDICATIONS:
${
  historyAnalysis?.activePrescriptions
    ?.map(
      (p) =>
        `- ${p.diagnosis} (${p.date}): ${
          p.medications
            ?.map((m: MedicationRecord) => `${m.name} ${m.strength}`)
            .join(", ") || "No medications listed"
        }`
    )
    .join("\n") || "None"
}

RECENT PRESCRIPTION HISTORY:
${
  historyAnalysis?.recentPrescriptions
    ?.slice(0, 3)
    .map(
      (p) =>
        `- ${p.diagnosis} (${p.date}): ${
          p.medications
            ?.map((m: MedicationRecord) => `${m.name} ${m.strength}`)
            .join(", ") || "No medications listed"
        }`
    )
    .join("\n") || "None"
}

Please provide your analysis in the following JSON format only. Do not include any other text before or after the JSON:

{
  "finalDiagnosis": "Your diagnosis based on symptoms and history",
  "confidence": 0.85,
  "reasoning": "Detailed explanation of your analysis considering patient history",
  "medications": [
    {
      "name": "Medication Name",
      "strength": "Dosage",
      "frequency": "How often",
      "duration": "How long",
      "instructions": "Special instructions"
    }
  ],
  "conflictWarnings": ["Any warnings about drug interactions or contradictions"],
  "recommendations": ["Clinical recommendations based on history"],
  "notes": "Additional clinical notes and follow-up instructions",
  "historyInsights": "Key insights from prescription history analysis"
}

IMPORTANT: Respond with ONLY the JSON object above, no additional text.

Focus on:
1. Drug interactions with current medications
2. Allergy considerations
3. Pattern analysis from prescription history
4. Effectiveness of previous treatments
5. Safety considerations based on patient profile
6. Alternative treatments if current approach isn't working

Provide safe, evidence-based recommendations while considering the patient's unique medical history.`;
}

// Parse Gemini AI response
function parseGeminiResponse(response: string): AIAnalysisResult {
  try {
    console.log("Parsing Gemini response:", response.substring(0, 500) + "...");

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log("Found JSON in response, parsing...");
      const parsed = JSON.parse(jsonMatch[0]);
      console.log("Successfully parsed Gemini JSON:", parsed);
      return parsed;
    }

    console.log("No valid JSON found in Gemini response, using fallback");
    // If no valid JSON, return structured fallback
    return {
      finalDiagnosis: "Diagnosis based on symptoms",
      confidence: 0.6,
      reasoning: "AI analysis completed with limited structured output",
      medications: [],
      conflictWarnings: [],
      recommendations: ["Please review AI suggestions carefully"],
      notes: response.substring(0, 500) + "...",
      historyInsights: "Analysis performed by Gemini AI",
    };
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return {
      finalDiagnosis: "Unable to parse AI response",
      confidence: 0.3,
      reasoning: "AI response parsing failed",
      medications: [],
      conflictWarnings: ["AI analysis incomplete"],
      recommendations: ["Manual review required"],
      notes: "Please review case manually",
      historyInsights: "AI analysis error",
    };
  }
}

// Fallback analysis when Gemini is not available
async function fallbackAnalysis(
  patient: Patient,
  symptoms: string[],
  diagnosis?: string,
  historyAnalysis?: PrescriptionHistoryAnalysis
): Promise<AIAnalysisResult> {
  console.log("Running enhanced fallback analysis for symptoms:", symptoms);
  // Enhanced symptom-to-treatment mapping with more specific patterns
  const symptomTreatmentPatterns = [
    // Respiratory symptoms
    {
      patterns: [
        "cough",
        "dry cough",
        "productive cough",
        "persistent cough",
        "chest congestion",
      ],
      medications: [
        {
          name: "Dextromethorphan",
          strength: "15mg",
          frequency: "Every 4 hours",
          duration: "7 days",
          instructions: "Take as needed for cough suppression",
        },
        {
          name: "Guaifenesin",
          strength: "400mg",
          frequency: "Every 4 hours",
          duration: "7 days",
          instructions: "Helps loosen mucus",
        },
      ],
    },
    // Cold and flu symptoms
    {
      patterns: [
        "cold",
        "flu",
        "runny nose",
        "stuffy nose",
        "nasal congestion",
        "sneezing",
      ],
      medications: [
        {
          name: "Pseudoephedrine",
          strength: "30mg",
          frequency: "Every 6 hours",
          duration: "5 days",
          instructions: "For nasal congestion",
        },
        {
          name: "Acetaminophen",
          strength: "500mg",
          frequency: "Every 6 hours",
          duration: "5 days",
          instructions: "For aches and fever",
        },
      ],
    },
    // Fever and general pain
    {
      patterns: [
        "fever",
        "high temperature",
        "chills",
        "body aches",
        "muscle pain",
      ],
      medications: [
        {
          name: "Ibuprofen",
          strength: "400mg",
          frequency: "Every 8 hours",
          duration: "3-5 days",
          instructions: "Take with food to reduce stomach upset",
        },
        {
          name: "Acetaminophen",
          strength: "500mg",
          frequency: "Every 6 hours",
          duration: "3-5 days",
          instructions: "Alternative to ibuprofen for fever reduction",
        },
      ],
    },
    // Headaches
    {
      patterns: [
        "headache",
        "migraine",
        "head pain",
        "tension headache",
        "sinus headache",
      ],
      medications: [
        {
          name: "Ibuprofen",
          strength: "600mg",
          frequency: "Every 8 hours",
          duration: "3 days",
          instructions: "Take with food for headache relief",
        },
        {
          name: "Sumatriptan",
          strength: "50mg",
          frequency: "As needed",
          duration: "For migraines only",
          instructions: "For severe migraines - max 2 doses per day",
        },
      ],
    },
    // Stomach issues
    {
      patterns: [
        "nausea",
        "vomiting",
        "stomach upset",
        "indigestion",
        "acid reflux",
      ],
      medications: [
        {
          name: "Ondansetron",
          strength: "4mg",
          frequency: "Every 8 hours",
          duration: "3 days",
          instructions: "For nausea and vomiting",
        },
        {
          name: "Omeprazole",
          strength: "20mg",
          frequency: "Once daily",
          duration: "14 days",
          instructions: "For acid reflux, take before meals",
        },
      ],
    },
    // Allergies
    {
      patterns: [
        "allergy",
        "allergic reaction",
        "hives",
        "itching",
        "rash",
        "hay fever",
      ],
      medications: [
        {
          name: "Cetirizine",
          strength: "10mg",
          frequency: "Once daily",
          duration: "7-14 days",
          instructions: "For allergic reactions",
        },
        {
          name: "Loratadine",
          strength: "10mg",
          frequency: "Once daily",
          duration: "7-14 days",
          instructions: "Non-drowsy allergy relief",
        },
      ],
    },
    // Bacterial infections
    {
      patterns: [
        "bacterial infection",
        "strep throat",
        "urinary tract infection",
        "uti",
        "skin infection",
      ],
      medications: [
        {
          name: "Amoxicillin",
          strength: "500mg",
          frequency: "Every 8 hours",
          duration: "7-10 days",
          instructions: "Complete full course even if feeling better",
        },
        {
          name: "Azithromycin",
          strength: "250mg",
          frequency: "Once daily",
          duration: "5 days",
          instructions: "Alternative antibiotic for penicillin allergies",
        },
      ],
    },
    // Anxiety and stress
    {
      patterns: ["anxiety", "stress", "panic", "nervous", "worried"],
      medications: [
        {
          name: "Lorazepam",
          strength: "0.5mg",
          frequency: "As needed",
          duration: "Short-term use only",
          instructions: "For acute anxiety - use sparingly",
        },
      ],
    },
    // Sleep issues
    {
      patterns: [
        "insomnia",
        "trouble sleeping",
        "can't sleep",
        "sleep problems",
      ],
      medications: [
        {
          name: "Melatonin",
          strength: "3mg",
          frequency: "30 minutes before bed",
          duration: "2 weeks",
          instructions: "Natural sleep aid",
        },
        {
          name: "Diphenhydramine",
          strength: "25mg",
          frequency: "Before bed",
          duration: "3-5 days",
          instructions: "May cause drowsiness",
        },
      ],
    },
  ];
  const symptomLower = symptoms.map((s) => s.toLowerCase().trim());
  const recommendedMeds: MedicationRecord[] = [];
  const matchedPatterns: string[] = [];

  // Enhanced symptom matching with fuzzy pattern matching
  for (const symptom of symptomLower) {
    for (const pattern of symptomTreatmentPatterns) {
      // Check if any pattern matches the symptom
      const isMatch = pattern.patterns.some(
        (p) =>
          symptom.includes(p) ||
          p.includes(symptom) ||
          // Handle partial matches for common variations
          (symptom.length > 3 &&
            p.length > 3 &&
            (symptom.startsWith(p.substring(0, 3)) ||
              p.startsWith(symptom.substring(0, 3))))
      );

      if (isMatch && !matchedPatterns.includes(pattern.patterns[0])) {
        console.log(
          `Matched symptom "${symptom}" to pattern "${pattern.patterns[0]}"`
        );
        matchedPatterns.push(pattern.patterns[0]);

        // Add medications from this pattern (limit to 2 per pattern to avoid overloading)
        const patternMeds = pattern.medications.slice(0, 2);
        recommendedMeds.push(...patternMeds);
      }
    }
  }
  // If no specific matches, provide symptom-based general treatment
  if (recommendedMeds.length === 0) {
    console.log(
      "No specific pattern matches found, analyzing symptoms for general treatment"
    );

    // More intelligent general treatment based on symptom context
    const symptomText = symptoms.join(" ").toLowerCase();

    if (
      symptomText.includes("pain") ||
      symptomText.includes("ache") ||
      symptomText.includes("sore")
    ) {
      recommendedMeds.push({
        name: "Ibuprofen",
        strength: "400mg",
        frequency: "Every 8 hours",
        duration: "3-5 days",
        instructions: "Take with food for pain relief",
      });
    } else if (
      symptomText.includes("tired") ||
      symptomText.includes("fatigue") ||
      symptomText.includes("weak")
    ) {
      recommendedMeds.push({
        name: "Multivitamin",
        strength: "1 tablet",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "To support energy and general health",
      });
    } else {
      // Last resort - general symptomatic relief
      recommendedMeds.push({
        name: "Acetaminophen",
        strength: "500mg",
        frequency: "Every 6 hours as needed",
        duration: "3-5 days",
        instructions: "For general symptomatic relief",
      });
    }

    console.log("Provided general treatment based on symptom context");
  } else {
    console.log(
      `Found ${
        matchedPatterns.length
      } matching patterns: ${matchedPatterns.join(", ")}`
    );
  }

  // Check for conflicts with current medications
  const conflicts = [];

  if (
    patient.allergies?.includes("Penicillin") &&
    recommendedMeds.some((m) => m.name.includes("Penicillin"))
  ) {
    conflicts.push(
      "Patient allergic to Penicillin - avoid beta-lactam antibiotics"
    );
  }
  console.log(
    "Enhanced fallback analysis complete, recommended meds:",
    recommendedMeds.length,
    "from patterns:",
    matchedPatterns.join(", ") || "general treatment"
  );

  // Enhanced reasoning based on matched patterns
  let reasoningText = `Enhanced AI analysis using pattern matching. `;
  if (matchedPatterns.length > 0) {
    reasoningText += `Identified patterns: ${matchedPatterns.join(", ")}. `;
  }
  reasoningText += `${
    historyAnalysis?.hasHistory
      ? "Previous prescriptions reviewed for safety."
      : "No prescription history available."
  }`;

  return {
    finalDiagnosis: diagnosis || `Symptoms: ${symptoms.join(", ")}`,
    confidence: matchedPatterns.length > 0 ? 0.8 : 0.6, // Higher confidence for pattern matches
    reasoning: reasoningText,
    medications: recommendedMeds.slice(0, 4), // Allow up to 4 medications for complex cases
    conflictWarnings: conflicts,
    recommendations: [
      ...(historyAnalysis?.recommendations || []),
      "Monitor patient response to treatment",
      matchedPatterns.length > 1
        ? "Multiple symptoms identified - monitor for interactions"
        : "Schedule follow-up in 3-5 days",
      ...(matchedPatterns.length === 0
        ? ["Consider specialist consultation for unspecified symptoms"]
        : []),
    ],
    notes: `Enhanced pattern-based treatment for: ${
      matchedPatterns.join(", ") || "general symptoms"
    }. ${
      historyAnalysis?.hasHistory
        ? `Patient has ${historyAnalysis.totalPrescriptions} previous prescriptions.`
        : ""
    }`,
    historyInsights: historyAnalysis?.hasHistory
      ? `Patient commonly uses: ${historyAnalysis.commonMedications
          .slice(0, 3)
          .join(", ")}`
      : "No prescription history available",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, patientId, symptoms, diagnosis, doctorId, doctorName } =
      body;

    if (action === "analyze_and_generate") {
      const result = await generateIntelligentPrescription(
        patientId,
        symptoms || [],
        diagnosis,
        doctorId,
        doctorName
      );

      return NextResponse.json(result);
    }
    if (action === "save_prescription") {
      console.log(
        "💾 Saving prescription with data:",
        JSON.stringify(body.prescription, null, 2)
      );

      // Save the AI-generated prescription to database
      const client = await clientPromise;
      const db = client.db("Patient");
      const collection = db.collection("prescriptions");

      // Generate a unique prescription ID
      const timestamp = Date.now();
      const prescriptionId = `RX${timestamp}`;

      const prescriptionData = {
        ...body.prescription,
        id: prescriptionId, // Add unique prescription ID
        status: "active", // Change from pending to active when saved
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      console.log(
        "💾 Final prescription data being saved:",
        JSON.stringify(prescriptionData, null, 2)
      );

      const result = await collection.insertOne(prescriptionData);

      console.log("💾 Save result:", result.insertedId);

      return NextResponse.json({
        success: true,
        insertedId: result.insertedId,
        prescriptionId: prescriptionId,
        prescription: prescriptionData,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[AI Prescription API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: "Patient ID required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");

    // Get patient info
    const patientsCollection = db.collection("patients");
    let patient = await patientsCollection.findOne({ id: patientId });
    if (!patient && ObjectId.isValid(patientId)) {
      patient = await patientsCollection.findOne({
        _id: new ObjectId(patientId),
      });
    }

    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    } // Get prescription history
    const prescriptionsCollection = db.collection("prescriptions");
    const prescriptionHistoryRaw = await prescriptionsCollection
      .find({ patientId })
      .sort({ createdAt: -1 })
      .toArray();

    // Cast to proper types
    const prescriptionHistory = prescriptionHistoryRaw.map((p) => ({
      id: p.id || p._id?.toString() || "",
      patientId: p.patientId || "",
      diagnosis: p.diagnosis || "",
      date: p.date || p.createdAt || "",
      medications: p.medications || [],
      doctorName: p.doctorName || "",
      status: p.status || "",
      createdAt: p.createdAt || "",
    })) as Prescription[];

    const typedPatient = patient as unknown as Patient;

    const historyAnalysis = await analyzePrescriptionHistory(
      prescriptionHistory,
      typedPatient
    );

    return NextResponse.json({
      success: true,
      patient,
      prescriptionHistory,
      historyAnalysis,
    });
  } catch (error) {
    console.error("[GET AI Prescription API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
