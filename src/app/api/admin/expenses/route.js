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
    const cat = searchParams.get("category") || "";
    const where = cat ? { category: cat } : {};
    const { data, total } = await paginate(
      prisma.expense,
      { where, orderBy: { date: "desc" } },
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
    const { category, description, amount, date } = await req.json();
    if (!category || !amount || !date)
      return NextResponse.json(
        { success: false, message: "category, amount, date required" },
        { status: 400 },
      );
    const expense = await prisma.expense.create({
      data: {
        category,
        description: description || null,
        amount: parseFloat(amount),
        date: new Date(date),
        createdById: user.id,
      },
    });
    return NextResponse.json(
      { success: true, message: "Expense logged", data: serialize(expense) },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
