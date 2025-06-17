import { MongoClient } from "mongodb";

async function getPatients() {
  const client = new MongoClient(
    "mongodb+srv://doc2025:4VyNMAvQtApjqJP7@doc.clwfyfj.mongodb.net/Patient?retryWrites=true&w=majority&appName=doc"
  );

  try {
    await client.connect();
    const db = client.db("Patient");
    const patients = await db
      .collection("patients")
      .find({})
      .limit(5)
      .toArray();

    console.log("🔍 Available Patient IDs for MCP Testing:");
    console.log("==========================================");

    if (patients.length === 0) {
      console.log("❌ No patients found in database");
      console.log("Creating a test patient for MCP testing...");

      const testPatient = {
        id: "P001",
        name: "John Doe",
        age: 45,
        gender: "male",
        allergies: ["Penicillin", "Sulfa"],
        currentMedications: ["Metformin 500mg", "Lisinopril 10mg"],
        medicalHistory: ["Type 2 Diabetes", "Hypertension"],
        email: "john.doe@example.com",
        phone: "555-0123",
      };

      await db.collection("patients").insertOne(testPatient);
      console.log("✅ Created test patient with ID: P001");
      return "P001";
    }

    patients.forEach((patient, index) => {
      console.log(`${index + 1}. Patient ID: ${patient.id || patient._id}`);
      console.log(`   Name: ${patient.name}`);
      console.log(`   Age: ${patient.age}`);
      console.log(`   Allergies: ${patient.allergies?.join(", ") || "None"}`);
      console.log(
        `   Current Meds: ${patient.currentMedications?.join(", ") || "None"}`
      );
      console.log("   ---");
    });

    return patients[0].id || patients[0]._id;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return null;
  } finally {
    await client.close();
  }
}

getPatients().then((patientId) => {
  if (patientId) {
    console.log("\n🧪 MCP Testing with Postman:");
    console.log("============================");
    console.log("1. Start your app: npm run dev");
    console.log("2. Open Postman");
    console.log("3. Method: POST");
    console.log("4. URL: http://localhost:3000/api/mcp-prescription");
    console.log("5. Headers: Content-Type: application/json");
    console.log("\n📋 Test Cases:");

    console.log("\n🎯 Test 1 - Enhanced Patient Context:");
    console.log(
      JSON.stringify(
        {
          action: "get_enhanced_patient_context",
          patientId: patientId,
        },
        null,
        2
      )
    );

    console.log("\n🧠 Test 2 - Create Prescription with Gemini:");
    console.log(
      JSON.stringify(
        {
          action: "create_prescription_with_gemini",
          patientId: patientId,
          symptoms: ["chest pain", "shortness of breath"],
          diagnosis: "suspected angina",
          doctorId: "DOC001",
          doctorName: "Dr. Smith",
        },
        null,
        2
      )
    );

    console.log("\n🛡️ Test 3 - Validate Safety (use medications from Test 2):");
    console.log(
      JSON.stringify(
        {
          action: "validate_prescription_safety",
          patientId: patientId,
          medications: [
            {
              name: "MEDICATION_FROM_GEMINI",
              strength: "STRENGTH",
              dosage: "DOSAGE",
            },
          ],
        },
        null,
        2
      )
    );

    console.log("\n⚠️ Test 4 - Check Drug Interactions:");
    console.log(
      JSON.stringify(
        {
          action: "check_drug_interactions",
          patientId: patientId,
          newMedications: ["MEDICATION_NAMES_FROM_GEMINI"],
        },
        null,
        2
      )
    );
  }
});
