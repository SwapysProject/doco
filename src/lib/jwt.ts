import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";

export interface JWTPayload {
  doctorId: string;
  email: string;
  name: string;
  role: "doctor" | "admin";
  iat?: number;
  exp?: number;
}

export function signJWT(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
  });
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Try to get token from cookies
  const tokenFromCookie = request.cookies.get("auth-token")?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  return null;
}

export function getCurrentUser(request: NextRequest): JWTPayload | null {
  const token = extractTokenFromRequest(request);
  if (!token) return null;

  return verifyJWT(token);
}
