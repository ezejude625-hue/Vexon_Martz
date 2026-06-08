import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    const body = await req.json();
    const data = {};
    if ("description" in body) data.description = body.description;
    if ("amount" in body) data.amount = parseFloat(body.amount);
    if ("category" in body) data.category = body.category;
    if ("date" in body) data.date = new Date(body.date);
    const expense = await prisma.expense.update({
      where: { id: parseInt(params.id) },
      data,
    });
    return NextResponse.json({ success: true, data: serialize(expense) });
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
    await prisma.expense.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
