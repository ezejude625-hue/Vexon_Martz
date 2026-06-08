import { NextResponse } from "next/server";
import { prisma, paginate, buildPagination, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  const user = await requireAuth(req, ["admin", "support"]);
  if (user instanceof NextResponse) return user;
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
    const status = searchParams.get("status") || "";
    const where = status ? { status } : {};
    const { data, total } = await paginate(
      prisma.supportTicket,
      {
        where,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              user: { select: { firstName: true, lastName: true, role: true } },
            },
          },
        },
      },
      page,
      limit,
    );
    return NextResponse.json({
      success: true,
      data: serialize(data),
      pagination: buildPagination(total, page, limit),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  const user = await requireAuth(req, ["admin", "support"]);
  if (user instanceof NextResponse) return user;
  try {
    const { ticketId, body } = await req.json();
    const msg = await prisma.ticketMessage.create({
      data: { ticketId, userId: user.id, body, isStaff: true },
    });
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: "in_progress" },
    });
    return NextResponse.json(
      { success: true, data: serialize(msg) },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
