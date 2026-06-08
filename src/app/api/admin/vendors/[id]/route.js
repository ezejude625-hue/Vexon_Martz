import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    const { status } = await req.json();
    const validStatuses = ["pending", "active", "suspended"];
    if (!validStatuses.includes(status))
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });

    const vendor = await prisma.vendor.update({
      where: { id: parseInt(params.id) },
      data: { status },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    return NextResponse.json({ success: true, data: serialize(vendor) });
  } catch (err) {
    console.error("[PATCH /api/admin/vendors/:id]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
