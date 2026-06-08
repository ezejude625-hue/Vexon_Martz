// GET    /api/products/:id — fetch product + reviews
// PATCH  /api/products/:id — update  (owner / admin)
// DELETE /api/products/:id — archive (owner / admin)
import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id))
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 },
      );

    const product = await prisma.product.findFirst({
      where: { id, status: "active" },
      include: {
        category: { select: { name: true, slug: true } },
        seller: { select: { firstName: true, lastName: true, email: true } },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    if (!product)
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );

    return NextResponse.json({ success: true, data: serialize(product) });
  } catch (err) {
    console.error("[GET /api/products/:id]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req, { params }) {
  const user = await requireAuth(req, ["admin", "vendor"]);
  if (user instanceof NextResponse) return user;

  try {
    const id = parseInt(params.id);
    if (isNaN(id))
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 },
      );

    const body = await req.json();

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );

    if (user.role !== "admin" && existing.sellerId !== user.userId)
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );

    // ── Full allowed field list — productType and sku were missing ──
    const allowed = [
      "name",
      "slug",
      "description",
      "shortDesc",
      "price",
      "salePrice",
      "thumbnailUrl",
      "images",
      "tags",
      "stock",
      "sku", // ← sku was missing
      "productType", // ← productType was missing
      "status",
      "isFeatured",
      "categoryId",
      "metaTitle",
      "metaDesc",
    ];

    const data = {};
    for (const key of allowed) {
      if (key in body) data[key] = body[key];
    }

    // Coerce numeric fields
    if ("price" in data) data.price = parseFloat(data.price);
    if ("salePrice" in data)
      data.salePrice = data.salePrice ? parseFloat(data.salePrice) : null;
    if ("stock" in data) data.stock = parseInt(data.stock);
    if ("categoryId" in data)
      data.categoryId = data.categoryId ? parseInt(data.categoryId) : null;
    if ("tags" in data && !Array.isArray(data.tags)) data.tags = [];

    if (!Object.keys(data).length)
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 },
      );

    await prisma.product.update({ where: { id }, data });

    return NextResponse.json({ success: true, message: "Product updated" });
  } catch (err) {
    console.error("[PATCH /api/products/:id]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  const user = await requireAuth(req, ["admin", "vendor"]);
  if (user instanceof NextResponse) return user;

  try {
    const id = parseInt(params.id);
    if (isNaN(id))
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 },
      );

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );

    if (user.role !== "admin" && existing.sellerId !== user.userId)
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );

    await prisma.product.update({
      where: { id },
      data: { status: "archived" },
    });

    return NextResponse.json({ success: true, message: "Product archived" });
  } catch (err) {
    console.error("[DELETE /api/products/:id]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
