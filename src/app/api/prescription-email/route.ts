import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/jwt";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { prescriptionId } = await request.json();

    if (!prescriptionId) {
      return NextResponse.json(
        { success: false, message: "Prescription ID is required" },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db("Patient");

    // Get prescription details
    const prescriptionsCollection = db.collection("prescriptions");

    // Validate prescriptionId format before using it
    if (!/^[0-9a-fA-F]{24}$/.test(prescriptionId)) {
      return NextResponse.json(
        { success: false, message: "Invalid prescription ID format" },
        { status: 400 }
      );
    }

    const prescription = await prescriptionsCollection.findOne({
      _id: new ObjectId(prescriptionId),
    });
    if (!prescription) {
      return NextResponse.json(
        { success: false, message: "Prescription not found" },
        { status: 404 }
      );
    }

    console.log(
      "Found prescription with patientId:",
      prescription.patientId,
      "type:",
      typeof prescription.patientId
    );

    // Get patient email
    const patientsCollection = db.collection("patients"); // Helper function to check if string is valid ObjectId
    const isValidObjectId = (id: unknown) => {
      if (typeof id !== "string") return false;
      return /^[0-9a-fA-F]{24}$/.test(id);
    };

    // Build query based on patientId format
    let patientQuery;
    if (isValidObjectId(prescription.patientId)) {
      patientQuery = {
        $or: [
          { id: prescription.patientId },
          { _id: new ObjectId(prescription.patientId) },
        ],
      };
    } else {
      // If not a valid ObjectId, search by id field only
      patientQuery = { id: prescription.patientId };
    }
    const patient = await patientsCollection.findOne(patientQuery);

    console.log("Patient query used:", JSON.stringify(patientQuery));
    console.log("Patient found:", patient ? "Yes" : "No");
    if (!patient) {
      console.log("Patient not found for ID:", prescription.patientId);
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 }
      );
    }

    // Check if patient has a valid email
    if (!patient.email || patient.email.trim() === "") {
      console.log("Patient found but email is missing or empty:", {
        patientId: patient.id || patient._id,
        patientName: patient.name,
        email: patient.email,
      });
      return NextResponse.json(
        {
          success: false,
          message:
            "Patient email is not available. Please update patient contact information.",
          patientInfo: {
            id: patient.id || patient._id,
            name: patient.name,
          },
        },
        { status: 422 } // 422 Unprocessable Entity - more appropriate than 404
      );
    } // Get doctor details
    const doctorsCollection = db.collection("doctors");
    const doctor = await doctorsCollection.findOne({
      _id: new ObjectId(currentUser.doctorId),
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    // Check if doctor has a valid email
    if (!doctor.email || doctor.email.trim() === "") {
      console.log("Doctor found but email is missing or empty:", {
        doctorId: doctor._id,
        doctorName: doctor.name,
        email: doctor.email,
      });
      return NextResponse.json(
        {
          success: false,
          message:
            "Doctor email is not available. Please update doctor profile.",
          doctorInfo: {
            id: doctor._id,
            name: doctor.name,
          },
        },
        { status: 422 }
      );
    }

    // Prepare email content
    const subject = `Prescription from Dr. ${doctor.name} - ${prescription.patientName}`;
    const emailBody = `
Dear ${prescription.patientName},

I hope this message finds you in good health. Please find your prescription details below:

PRESCRIPTION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prescription ID: ${prescription._id}
Date Issued: ${new Date(
      prescription.date || prescription.createdAt
    ).toLocaleDateString()}
Doctor: Dr. ${doctor.name}
Specialization: ${doctor.specialization || "General Medicine"}
Diagnosis: ${prescription.diagnosis}

MEDICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${prescription.medications
  ?.map(
    (
      med: {
        name: string;
        strength: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions: string;
      },
      index: number
    ) => `
${index + 1}. ${med.name} (${med.strength})
   • Dosage: ${med.dosage}
   • Frequency: ${med.frequency}
   • Duration: ${med.duration}
   • Instructions: ${med.instructions}
`
  )
  .join("")}

IMPORTANT NOTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Please take medications exactly as prescribed
• Complete the full course of treatment even if you feel better
• Contact us immediately if you experience any adverse reactions
• Store medications in a cool, dry place away from children

If you have any questions or concerns about this prescription, please don't hesitate to contact our clinic.

Best regards,
Dr. ${doctor.name}
${doctor.email}

---
This is an official prescription from our healthcare system.
Please keep this for your records.
    `;

    // Prepare email data for frontend EmailJS sending
    const emailData = {
      to: patient.email,
      from: doctor.email,
      subject,
      body: emailBody,
      patientName: prescription.patientName,
      doctorName: doctor.name,
    };

    // Return email data for EmailJS to handle on frontend
    return NextResponse.json({
      success: true,
      message: "Email data prepared for EmailJS sending",
      emailData,
      method: "emailjs",
    });
  } catch (error) {
    console.error("Error preparing prescription email:", error);
    return NextResponse.json(
      { success: false, message: "Failed to prepare prescription email" },
      { status: 500 }
    );
  }
}
