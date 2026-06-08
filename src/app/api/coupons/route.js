// ============================================================
// POST /api/coupons — validate a coupon code at checkout
// ============================================================
import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { applyCoupon } from "@/lib/utils";

export async function POST(req) {
  try {
    const { code, cart_total } = await req.json();

    if (!code || !cart_total)
      return NextResponse.json(
        { success: false, message: "code and cart_total are required" },
        { status: 400 },
      );

    // Find an active, non-expired coupon with remaining usage
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase().trim(),
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (!coupon)
      return NextResponse.json(
        { success: false, message: "Coupon code is invalid or expired" },
        { status: 404 },
      );

    // Check usage limit (null = unlimited)
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
      return NextResponse.json(
        { success: false, message: "This coupon has reached its usage limit" },
        { status: 400 },
      );

    // Check minimum order amount
    const minOrder = parseFloat(coupon.minOrderAmount || 0);
    if (cart_total < minOrder)
      return NextResponse.json(
        {
          success: false,
          message: `Minimum order of $${minOrder.toFixed(2)} required for this coupon`,
        },
        { status: 400 },
      );

    // Calculate the discount
    const { discount, finalPrice } = applyCoupon(
      cart_total,
      coupon.discountType,
      parseFloat(coupon.discountValue),
      coupon.maxDiscount ? parseFloat(coupon.maxDiscount) : null,
    );

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        discount_type: coupon.discountType,
        discount_value: parseFloat(coupon.discountValue),
        discount_amount: discount,
        original_total: cart_total,
        final_total: finalPrice,
      },
    });
  } catch (err) {
    console.error("[POST /api/coupons]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
