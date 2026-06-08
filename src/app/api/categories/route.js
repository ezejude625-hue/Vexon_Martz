import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch categories with their active products' stock included
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        // Pull stock of every active product in this category
        products: {
          where: { status: "active" },
          select: { stock: true },
        },
      },
    });

    // Compute totalStock per category
    // stock === -1 means unlimited (digital) — treat as 0 for counting purposes
    const data = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      totalStock: c.products.reduce(
        (sum, p) => sum + (p.stock === -1 ? 0 : p.stock),
        0,
      ),
    }));

    // Also compute the grand total across all categories
    const grandTotal = data.reduce((s, c) => s + c.totalStock, 0);

    return NextResponse.json({ success: true, data, grandTotal });
  } catch (err) {
    console.error("[GET /api/categories]", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const { name, slug, icon, sortOrder } = await req.json();
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon: icon || "category",
        sortOrder: sortOrder || 0,
        isActive: true,
      },
    });
    return NextResponse.json(
      { success: true, data: category },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/categories]", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
