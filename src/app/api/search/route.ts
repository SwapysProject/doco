// File: /app/api/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // Using the same DB connection as your other routes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    // If there's no query, it's not an error; just return an empty array.
    if (!query) {
      return NextResponse.json([], { status: 200 });
    }

    const client = await clientPromise;
    const db = client.db("Patient"); // Your database name
    const collection = db.collection("patients"); // Your collection name

    // This query is case-insensitive and searches for the text in the 'name' and 'email' fields.
    // You can add more fields to the $or array as needed.
    const searchRegex = new RegExp(query, "i");
    
    const results = await collection.find({
        $or: [
          { name: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
          // { someOtherField: { $regex: searchRegex } },
        ],
      })
      .limit(10) // Limit results for performance
      .toArray();

    return NextResponse.json(results, { status: 200 });
      
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch search results" },
      { status: 500 }
    );
  }
}
