// src/app/api/patients-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getCurrentUser } from "@/lib/jwt";

// GET: Fetch patients assigned to the current doctor
export async function GET(request: NextRequest) {
  try {
    // Get current user from JWT
    const currentUser = getCurrentUser(request);

    // If no user authentication, return demo data for development
    if (!currentUser) {
      console.log("No authenticated user, returning demo patients data");
      return NextResponse.json(
        {
          patients: [
            {
              _id: "demo1",
              firstName: "John",
              lastName: "Doe",
              email: "john.doe@example.com",
              phone: "+1-555-0100",
              dateOfBirth: new Date("1985-03-15"),
              gender: "male",
              lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              status: "Stable",
              medicalHistory: ["Hypertension", "Diabetes Type 2"],
              allergies: ["Penicillin"],
              isActive: true,
            },
            {
              _id: "demo2",
              firstName: "Sarah",
              lastName: "Johnson",
              email: "sarah.johnson@example.com",
              phone: "+1-555-0102",
              dateOfBirth: new Date("1990-07-22"),
              gender: "female",
              lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              status: "Monitoring",
              medicalHistory: ["Asthma"],
              allergies: ["Shellfish"],
              isActive: true,
            },
            {
              _id: "demo3",
              firstName: "Robert",
              lastName: "Smith",
              email: "robert.smith@example.com",
              phone: "+1-555-0104",
              dateOfBirth: new Date("1975-11-08"),
              gender: "male",
              lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              status: "Critical",
              medicalHistory: ["High Cholesterol", "Arthritis"],
              allergies: [],
              isActive: true,
            },
          ],
        },
        { status: 200 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const collection = db.collection("patients");

    // Only fetch patients assigned to the current doctor
    const patients = await collection
      .find({
        doctorId: currentUser.doctorId,
      })
      .toArray();

    return NextResponse.json({ patients }, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { message: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

// POST: Add a new patient (assign to current doctor)
export async function POST(request: NextRequest) {
  try {
    // Get current user from JWT
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const client = await clientPromise;
    const db = client.db("Patient");
    const collection = db.collection("patients");

    // Check if patient with same email or phone already exists for any doctor
    const existingPatient = await collection.findOne({
      $or: [{ email: body.email }, { phone: body.phone }],
    });

    if (existingPatient) {
      return NextResponse.json(
        {
          message: "Patient with this email or phone number already exists",
          existingPatient: {
            name: existingPatient.name,
            email: existingPatient.email,
            phone: existingPatient.phone,
            assignedDoctor: existingPatient.doctorId,
          },
        },
        { status: 409 }
      );
    }

    // Generate a unique patient ID
    const count = await collection.countDocuments();
    const nextId = `P${String(count + 1).padStart(3, "0")}`;

    // Add the generated ID and assign to current doctor
    const patientData = {
      ...body,
      id: nextId,
      doctorId: currentUser.doctorId, // Assign to current doctor
      doctorName: currentUser.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: body.status || "active",
    };

    const result = await collection.insertOne(patientData);
    return NextResponse.json(
      {
        message: "Patient added successfully and assigned to you",
        id: result.insertedId,
        patientId: nextId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { message: "Failed to add patient" },
      { status: 500 }
    );
  }
}

// PUT: Update a patient (only if assigned to current doctor)
export async function PUT(request: NextRequest) {
  try {
    // Get current user from JWT
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { message: "Missing _id in request body" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const collection = db.collection("patients");

    // Check if patient exists and is assigned to current doctor
    const existingPatient = await collection.findOne({
      _id: new ObjectId(_id),
      doctorId: currentUser.doctorId,
    });

    if (!existingPatient) {
      return NextResponse.json(
        { message: "Patient not found or not assigned to you" },
        { status: 404 }
      );
    }

    // Update the patient
    const result = await collection.updateOne(
      { _id: new ObjectId(_id), doctorId: currentUser.doctorId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Patient not found or not authorized to update" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Patient updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { message: "Failed to update patient" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a patient (only if assigned to current doctor)
export async function DELETE(request: NextRequest) {
  try {
    // Get current user from JWT
    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json(
        { message: "Missing _id in request body" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Patient");
    const collection = db.collection("patients");

    // Only allow deletion if patient is assigned to current doctor
    const result = await collection.deleteOne({
      _id: new ObjectId(_id),
      doctorId: currentUser.doctorId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Patient not found or not authorized to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Patient deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { message: "Failed to delete patient" },
      { status: 500 }
    );
  }
}
