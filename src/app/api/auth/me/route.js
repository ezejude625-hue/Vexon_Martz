// ============================================================
// GET /api/auth/me — return logged-in user from JWT cookie
// Returns null (not 401) when not logged in so pages can
// handle the guest state gracefully without throwing errors
// ============================================================
import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  const session = await requireAuth(req);

  // Not logged in — return null gracefully
  if (session instanceof NextResponse)
    return NextResponse.json({ success: true, data: null });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ success: true, data: serialize(user) });
  } catch {
    return NextResponse.json({ success: true, data: null });
  }
}
