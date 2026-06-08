// ============================================================
// MIDDLEWARE — src/middleware.js
// ============================================================
// Runs before every matched request.
// Protects /dashboard, /admin, and /checkout routes by
// verifying the JWT cookie and redirecting unauthenticated
// visitors to the login page.
// ============================================================

import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Which URL patterns this middleware applies to
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/checkout/:path*"],
};

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  // Read the HttpOnly JWT cookie
  const token = req.cookies.get("vexon_auth")?.value;

  // No token → redirect to login, preserving the original URL
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("from", pathname); // So login page can redirect back
    return NextResponse.redirect(loginUrl);
  }

  // Invalid / expired token → same redirect
  const user = await verifyToken(token);
  if (!user) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only section — non-admin users get bounced to their dashboard
  if (
    pathname.startsWith("/admin") &&
    user.role !== "admin" &&
    user.role !== "support"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Valid — pass the request through, attaching the user role as a header
  // (useful for layout components that need to know the user's role)
  const response = NextResponse.next();
  response.headers.set("x-user-id", String(user.id));
  response.headers.set("x-user-role", user.role);
  return response;
}
