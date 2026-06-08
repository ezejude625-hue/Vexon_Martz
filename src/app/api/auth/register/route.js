// ============================================================
// POST /api/auth/register
// ============================================================
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma, serialize } from "@/lib/prisma";
import { signToken, setAuthCookie } from "@/lib/auth";
import { isValidEmail, isStrongPassword } from "@/lib/utils";

export async function POST(req) {
  try {
    const { first_name, last_name, email, password } = await req.json();

    // Validate required fields
    if (!first_name?.trim() || !last_name?.trim())
      return NextResponse.json(
        { success: false, message: "First and last name are required" },
        { status: 400 },
      );
    if (!isValidEmail(email))
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 },
      );
    if (!isStrongPassword(password))
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be 8+ chars with uppercase, lowercase, and a number",
        },
        { status: 400 },
      );

    // Check for existing account with this email
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing)
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists",
        },
        { status: 409 },
      );

    // Hash password — 12 rounds is strong and acceptably fast (~300ms)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create the user as a customer
    const user = await prisma.user.create({
      data: {
        role: "customer",
        firstName: first_name.trim(),
        lastName: last_name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        emailVerified: false,
        isActive: true,
      },
    });

    // Auto-login — sign token so user lands on dashboard immediately
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        data: serialize({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        }),
      },
      { status: 201 },
    );

    return setAuthCookie(response, token);
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
