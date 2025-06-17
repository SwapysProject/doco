import { MongoClient } from "mongodb";

async function findNewPpPatient() {
  const client = new MongoClient(
    "mongodb+srv://doc2025:4VyNMAvQtApjqJP7@doc.clwfyfj.mongodb.net/Patient?retryWrites=true&w=majority&appName=doc"
  );

  try {
    await client.connect();
    const db = client.db("Patient");

    // Search for patient with name containing "new pp"
    const patient = await db.collection("patients").findOne({
      name: { $regex: /new pp/i },
    });

    if (patient) {
      console.log('✅ Found patient "new pp":');
      console.log("==========================");
      console.log("ID:", patient.id || patient._id);
      console.log("Name:", patient.name);
      console.log("Age:", patient.age);
      console.log("Gender:", patient.gender);
      console.log("Allergies:", patient.allergies?.join(", ") || "None");
      console.log(
        "Current Meds:",
        patient.currentMedications?.join(", ") || "None"
      );
      console.log(
        "Medical History:",
        patient.medicalHistory?.join(", ") || "None"
      );

      const patientId = patient.id || patient._id;

      console.log('\n🧪 MCP Test Cases for Patient "new pp":');
      console.log("========================================");

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
            symptoms: ["headache", "fever"],
            diagnosis: "viral infection",
            doctorId: "DOC001",
            doctorName: "Dr. Smith",
          },
          null,
          2
        )
      );

      console.log("\n🛡️ Test 3 - Validate Safety:");
      console.log(
        JSON.stringify(
          {
            action: "validate_prescription_safety",
            patientId: patientId,
            medications: [
              {
                name: "Acetaminophen",
                strength: "500mg",
                dosage: "1 tablet every 6 hours",
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
            newMedications: ["Ibuprofen", "Acetaminophen"],
          },
          null,
          2
        )
      );
    } else {
      console.log('❌ Patient "new pp" not found');
      console.log('Searching for patients with "pp" in name...');

      const similar = await db
        .collection("patients")
        .find({
          name: { $regex: /pp/i },
        })
        .toArray();

      if (similar.length > 0) {
        console.log("Similar patients found:");
        similar.forEach((p) => {
          console.log(`- ID: ${p.id || p._id} | Name: ${p.name}`);
        });
      } else {
        console.log('No patients with "pp" in name found');
        console.log("Available patients:");
        const allPatients = await db
          .collection("patients")
          .find({})
          .limit(5)
          .toArray();
        allPatients.forEach((p) => {
          console.log(`- ID: ${p.id || p._id} | Name: ${p.name}`);
        });
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.close();
  }
}

findNewPpPatient();
