import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req, { params }) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;
  try {
    const order = await prisma.order.findFirst({
      where: { orderNumber: params.id },
      include: {
        items: {
          select: {
            productName: true,
            productImage: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
    });
    if (!order)
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    if (user.role !== "admin" && order.userId !== user.userId)
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    return NextResponse.json({ success: true, data: serialize(order) });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req, { params }) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    const { status, payment_status } = await req.json();
    const order = await prisma.order.findFirst({
      where: { orderNumber: params.id },
    });
    if (!order)
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    const data = {};
    if (status) data.status = status;
    if (payment_status) data.paymentStatus = payment_status;
    if (!Object.keys(data).length)
      return NextResponse.json(
        { success: false, message: "Nothing to update" },
        { status: 400 },
      );
    await prisma.order.update({ where: { id: order.id }, data });
    return NextResponse.json({ success: true, message: "Order updated" });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
