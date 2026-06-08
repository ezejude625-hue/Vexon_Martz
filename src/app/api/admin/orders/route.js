import { NextResponse } from "next/server";
import { prisma, paginate, buildPagination, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
    const status = searchParams.get("status") || "";
    const search = searchParams.get("q") || "";
    const where = {};
    if (status) where.status = status;
    if (search)
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    const { data, total } = await paginate(
      prisma.order,
      {
        where,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: { select: { productName: true, quantity: true } },
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
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
