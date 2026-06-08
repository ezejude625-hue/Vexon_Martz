// ============================================================
// POST /api/auth/login
// ============================================================
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma, serialize } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json(
        { success: false, message: "Email and password required" },
        { status: 400 },
      );

    // Find user by email — isActive must be true
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        isActive: true,
      },
    });

    // bcrypt.compare is constant-time — safe against timing attacks
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 },
      );

    // Record last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Sign JWT — role is already an enum string on the user record
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return clean payload — never expose passwordHash
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: serialize({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      }),
    });

    return setAuthCookie(response, token);
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
