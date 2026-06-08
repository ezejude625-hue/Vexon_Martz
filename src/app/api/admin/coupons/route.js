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
    const { data, total } = await paginate(
      prisma.coupon,
      { orderBy: { createdAt: "desc" } },
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

export async function POST(req) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    const body = await req.json();
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount = 0,
      usage_limit,
      expires_at,
    } = body;
    if (!code || !discount_type || !discount_value)
      return NextResponse.json(
        {
          success: false,
          message: "code, discount_type, and discount_value are required",
        },
        { status: 400 },
      );
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        description: description || null,
        discountType: discount_type,
        discountValue: parseFloat(discount_value),
        minOrderAmount: parseFloat(min_order_amount),
        usageLimit: usage_limit ? parseInt(usage_limit) : null,
        expiresAt: expires_at ? new Date(expires_at) : null,
        isActive: true,
      },
    });
    return NextResponse.json(
      { success: true, message: "Coupon created", data: serialize(coupon) },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
