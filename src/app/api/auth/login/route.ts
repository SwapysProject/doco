import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/jwt";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db("Patient");
    const doctorsCollection = db.collection("doctors");

    // Find doctor by email
    const doctor = await doctorsCollection.findOne({
      email: email.toLowerCase(),
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, doctor.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login and online status
    await doctorsCollection.updateOne(
      { _id: doctor._id },
      {
        $set: {
          lastLogin: new Date(),
          isOnline: true,
          lastSeen: new Date(),
        },
      }
    );

    // Generate JWT token
    const token = signJWT({
      doctorId: doctor._id.toString(),
      email: doctor.email,
      name: doctor.name,
      role: doctor.role || "doctor",
    });

    // Create response with token in both cookie and body
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: doctor._id.toString(),
        email: doctor.email,
        name: doctor.name,
        role: doctor.role || "doctor",
        specialization: doctor.specialization,
        isOnline: true,
      },
      token,
    });

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
