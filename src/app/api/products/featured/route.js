import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "active", isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { category: { select: { name: true, slug: true } } },
    });
    return NextResponse.json({ success: true, data: serialize(products) });
  } catch (err) {
    console.error("[GET /api/products/featured]", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
