import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req, { params }) {
  const user = await requireAuth(req, ["admin", "support"]);
  if (user instanceof NextResponse) return user;
  try {
    const id = isNaN(params.id) ? undefined : parseInt(params.id);
    const order = await prisma.order.findFirst({
      where: id ? { id } : { orderNumber: params.id },
      include: {
        user: {
          select: {
            id: true,           // needed for "View Profile" link
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        items: {
          include: {
            product: {
              select: { thumbnailUrl: true, sku: true, name: true },
            },
          },
        },
        address: true,
        coupon: { select: { code: true, discountType: true, discountValue: true } },
      },
    });
    if (!order)
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: serialize(order) });
  } catch (err) {
    console.error("[GET /api/admin/orders/:id]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    const body = await req.json();
    const id = isNaN(params.id) ? undefined : parseInt(params.id);
    const where = id ? { id } : { orderNumber: params.id };
    const existing = await prisma.order.findFirst({ where });
    if (!existing)
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    const data = {};
    if (body.status)         data.status        = body.status;
    if (body.payment_status) data.paymentStatus = body.payment_status;
    if (body.notes !== undefined) data.notes    = body.notes;

    const updated = await prisma.order.update({ where: { id: existing.id }, data });
    return NextResponse.json({ success: true, message: "Order updated", data: serialize(updated) });
  } catch (err) {
    console.error("[PATCH /api/admin/orders/:id]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
