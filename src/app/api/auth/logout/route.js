// ============================================================
// POST /api/auth/logout — clears the auth cookie
// No database call needed — just expire the cookie
// ============================================================
import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out" });
  return clearAuthCookie(res);
}
