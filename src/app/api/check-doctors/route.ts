import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Patient");
    const doctorsCollection = db.collection("doctors");

    // Get all doctors with their login info (excluding actual passwords)
    const doctors = await doctorsCollection.find({}).toArray();

    const doctorInfo = doctors.map((doc) => ({
      _id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      specialization: doc.specialization,
      hasPassword: !!doc.password,
      passwordLength: doc.password ? doc.password.length : 0,
    }));

    return NextResponse.json({
      success: true,
      doctors: doctorInfo,
    });
  } catch (error) {
    console.error("Error checking doctors:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
