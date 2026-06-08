import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req, { params }) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    const customer = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        lastLogin: true,
        addresses: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
            _count: { select: { items: true } },
          },
        },
        _count: { select: { orders: true, reviews: true } },
      },
    });
    if (!customer)
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, data: serialize(customer) });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req, { params }) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    const body = await req.json();
    const data = {};
    if ("isActive" in body) data.isActive = body.isActive;
    if ("role" in body) data.role = body.role;
    if ("firstName" in body) data.firstName = body.firstName;
    if ("lastName" in body) data.lastName = body.lastName;
    const customer = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data,
    });
    return NextResponse.json({ success: true, data: serialize(customer) });
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
    await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true, message: "Account deactivated" });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
