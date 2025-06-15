import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT, extractTokenFromRequest } from "@/lib/jwt";

// Define protected routes
const protectedRoutes = [
  "/dashboard",
  "/api/prescriptions",
  "/api/patients-data",
  "/api/medical-history",
  "/api/medications",
  "/api/allergies",
];

// Define public routes that should redirect to dashboard if authenticated
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get token from request
  const token = extractTokenFromRequest(request);
  const isAuthenticated = token ? !!verifyJWT(token) : false;

  // If user is trying to access protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For API routes, return 401 if not authenticated
  if (pathname.startsWith("/api/") && isProtectedRoute && !isAuthenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
