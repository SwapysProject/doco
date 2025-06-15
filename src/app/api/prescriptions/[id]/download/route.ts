import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { jsPDF } from "jspdf";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch prescription from database
    const client = await clientPromise;
    const db = client.db("Patient");
    const collection = db.collection("prescriptions");

    const prescription = await collection.findOne({
      $or: [{ id: id }, { _id: new ObjectId(id) }],
    });

    if (!prescription) {
      return NextResponse.json(
        { success: false, error: "Prescription not found" },
        { status: 404 }
      );
    }

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("PRESCRIPTION", pageWidth / 2, 30, { align: "center" });

    // Prescription details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    let yPos = 50;

    // Prescription ID and Date
    doc.text(`Prescription ID: ${prescription.id}`, margin, yPos);
    doc.text(
      `Date: ${new Date(prescription.date).toLocaleDateString()}`,
      pageWidth - margin - 60,
      yPos
    );
    yPos += 15;

    // Patient Information
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT INFORMATION", margin, yPos);
    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${prescription.patientName}`, margin, yPos);
    yPos += 8;
    doc.text(`Patient ID: ${prescription.patientId}`, margin, yPos);
    yPos += 15;

    // Doctor Information
    doc.setFont("helvetica", "bold");
    doc.text("DOCTOR INFORMATION", margin, yPos);
    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.text(`Doctor: ${prescription.doctorName}`, margin, yPos);
    yPos += 8;
    doc.text(`Doctor ID: ${prescription.doctorId}`, margin, yPos);
    yPos += 15;

    // Diagnosis
    doc.setFont("helvetica", "bold");
    doc.text("DIAGNOSIS", margin, yPos);
    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.text(prescription.diagnosis, margin, yPos);
    yPos += 15;

    // Medications
    doc.setFont("helvetica", "bold");
    doc.text("MEDICATIONS", margin, yPos);
    yPos += 10;

    prescription.medications.forEach((med: any, index: number) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${med.name} ${med.strength}`, margin, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      doc.text(`   Dosage: ${med.dosage}`, margin, yPos);
      yPos += 6;
      doc.text(`   Frequency: ${med.frequency}`, margin, yPos);
      yPos += 6;
      doc.text(`   Duration: ${med.duration}`, margin, yPos);
      yPos += 6;
      doc.text(`   Quantity: ${med.quantity}`, margin, yPos);
      yPos += 6;
      doc.text(`   Instructions: ${med.instructions}`, margin, yPos);
      yPos += 10;

      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }
    });

    // Footer
    yPos += 20;
    doc.setFontSize(10);
    doc.text(
      "This prescription is generated electronically and is valid.",
      margin,
      yPos
    );
    yPos += 8;
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPos);

    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer");

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="prescription-${prescription.id}.pdf"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("[GET /prescriptions/[id]/download]", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
