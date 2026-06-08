// ============================================================
// GET    /api/users — get current user profile
// PATCH  /api/users — update profile / change password
// DELETE /api/users — deactivate account
// ============================================================
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { isStrongPassword } from "@/lib/utils";

// ── GET ───────────────────────────────────────────────────────
export async function GET(req) {
  const caller = await requireAuth(req);
  if (caller instanceof NextResponse) return caller;

  try {
    const user = await prisma.user.findUnique({
      where: { id: caller.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        emailVerified: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );

    return NextResponse.json({ success: true, data: serialize(user) });
  } catch (err) {
    console.error("[GET /api/users]", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

// ── PATCH ─────────────────────────────────────────────────────
export async function PATCH(req) {
  const caller = await requireAuth(req);
  if (caller instanceof NextResponse) return caller;

  try {
    const body = await req.json();

    // Build the update data — only whitelist safe fields
    const data = {};
    if ("first_name" in body) data.firstName = body.first_name;
    if ("last_name" in body) data.lastName = body.last_name;
    if ("phone" in body) data.phone = body.phone;
    if ("avatar_url" in body) data.avatarUrl = body.avatar_url;
    if ("bio" in body) data.bio = body.bio;

    // Handle password change
    if (body.password) {
      if (!isStrongPassword(body.password))
        return NextResponse.json(
          {
            success: false,
            message:
              "Password must be 8+ chars with uppercase, lowercase, and a number",
          },
          { status: 400 },
        );
      data.passwordHash = await bcrypt.hash(body.password, 12);
    }

    if (!Object.keys(data).length)
      return NextResponse.json(
        { success: false, message: "Nothing to update" },
        { status: 400 },
      );

    await prisma.user.update({
      where: { id: caller.userId },
      data,
    });

    return NextResponse.json({ success: true, message: "Profile updated" });
  } catch (err) {
    console.error("[PATCH /api/users]", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

// ── DELETE ────────────────────────────────────────────────────
export async function DELETE(req) {
  const caller = await requireAuth(req);
  if (caller instanceof NextResponse) return caller;

  try {
    // Soft-delete — deactivate rather than hard delete
    await prisma.user.update({
      where: { id: caller.userId },
      data: { isActive: false },
    });

    const res = NextResponse.json({
      success: true,
      message: "Account deactivated",
    });
    // Clear the auth cookie
    res.cookies.set("vexon_auth", "", { maxAge: 0, path: "/" });
    return res;
  } catch (err) {
    console.error("[DELETE /api/users]", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
