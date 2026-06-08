import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    const body = await req.json();
    const data = {};
    const allowed = [
      "code",
      "description",
      "discountType",
      "discountValue",
      "minOrderAmount",
      "maxDiscount",
      "usageLimit",
      "startsAt",
      "expiresAt",
      "isActive",
    ];
    for (const key of allowed) if (key in body) data[key] = body[key];
    const coupon = await prisma.coupon.update({
      where: { id: parseInt(params.id) },
      data,
    });
    return NextResponse.json({ success: true, data: serialize(coupon) });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    await prisma.coupon.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
