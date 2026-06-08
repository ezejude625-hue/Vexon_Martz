import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    const { permissions } = await req.json();
    if (!Array.isArray(permissions))
      return NextResponse.json({ success: false, message: "permissions must be an array" }, { status: 400 });

    const key = `role_permissions_${params.id}`;
    await prisma.setting.upsert({
      where: { key },
      update: { value: JSON.stringify(permissions) },
      create: { key, value: JSON.stringify(permissions), group: "roles" },
    });
    return NextResponse.json({ success: true, message: "Permissions saved" });
  } catch (err) {
    console.error("[PATCH /api/admin/roles/:id]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
