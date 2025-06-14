// src/app/api/patients-data/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: Fetch all patients
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");
    const collection = db.collection("patients");

    const patients = await collection.find({}).toArray();
    return NextResponse.json({ patients }, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { message: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

// POST: Add a new patient
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const client = await clientPromise;
    const db = client.db("Patient");
    const collection = db.collection("patients");

    // Generate a unique patient ID
    const count = await collection.countDocuments();
    const nextId = `P${String(count + 1).padStart(3, "0")}`;

    // Add the generated ID to the patient data
    const patientData = {
      ...body,
      id: nextId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(patientData);
    return NextResponse.json(
      {
        message: "Patient added successfully",
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

// PUT: Update a patient by _id
export async function PUT(request: Request) {
  try {
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

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Patient updated" }, { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { message: "Failed to update patient" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a patient by _id
export async function DELETE(request: Request) {
  try {
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

    const result = await collection.deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Patient deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { message: "Failed to delete patient" },
      { status: 500 }
    );
  }
}
