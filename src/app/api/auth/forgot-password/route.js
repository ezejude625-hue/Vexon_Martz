// ============================================================
// POST /api/auth/forgot-password
// ============================================================
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email)
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );

    // Look up the user — do this silently to prevent email enumeration
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        isActive: true,
      },
    });

    if (user) {
      // Generate a cryptographically secure reset token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      // Store the token and expiry on the user record
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetExpires: expires,
        },
      });

      // In production: send the reset email via SMTP here
      // await sendResetEmail(user.email, token)
      console.info(`[forgot-password] Reset link → /auth/reset?token=${token}`);
    }

    // Always return 200 — never confirm or deny email existence
    return NextResponse.json({
      success: true,
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("[POST /api/auth/forgot-password]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
