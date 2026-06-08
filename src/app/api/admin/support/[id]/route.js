import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const user = await requireAuth(req, ["admin", "support"]);
  if (user instanceof NextResponse) return user;
  try {
    const { status } = await req.json();
    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status))
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });

    const ticket = await prisma.supportTicket.update({
      where: { id: parseInt(params.id) },
      data: { status },
    });
    return NextResponse.json({ success: true, data: serialize(ticket) });
  } catch (err) {
    console.error("[PATCH /api/admin/support/:id]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
