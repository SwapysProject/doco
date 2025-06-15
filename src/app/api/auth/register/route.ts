import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, specialization, licenseNumber } =
      await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db("Patient");
    const doctorsCollection = db.collection("doctors");

    // Check if doctor already exists
    const existingDoctor = await doctorsCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existingDoctor) {
      return NextResponse.json(
        { success: false, message: "Doctor with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate doctor ID
    const count = await doctorsCollection.countDocuments();
    const doctorId = `DOC${String(count + 1).padStart(3, "0")}`;

    // Create doctor record
    const doctorData = {
      doctorId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      specialization: specialization || "General Medicine",
      licenseNumber: licenseNumber || "",
      role: "doctor",
      isOnline: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      lastSeen: null,
    };

    const result = await doctorsCollection.insertOne(doctorData);

    return NextResponse.json({
      success: true,
      message: "Doctor registered successfully",
      doctorId: result.insertedId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
