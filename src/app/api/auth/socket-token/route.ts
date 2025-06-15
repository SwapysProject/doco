import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from the HTTP-only cookie
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No authentication token found" },
        { status: 401 }
      );
    }

    // Verify the token is valid
    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Return the same token for WebSocket use
    return NextResponse.json({
      success: true,
      token: token,
    });
  } catch (error) {
    console.error("Socket token error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
