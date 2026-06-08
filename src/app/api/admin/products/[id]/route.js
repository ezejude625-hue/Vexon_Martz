import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req, { params }) {
  const user = await requireAuth(req, ["admin", "vendor"]);
  if (user instanceof NextResponse) return user;

  try {
    const id = parseInt(params.id);
    if (isNaN(id))
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 },
      );

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: { select: { firstName: true, lastName: true, email: true } },
        reviews: { take: 5, orderBy: { createdAt: "desc" } },
      },
    });

    if (!product)
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );

    return NextResponse.json({ success: true, data: serialize(product) });
  } catch (err) {
    console.error("[GET /api/admin/products/:id]", err);
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
    const id = parseInt(params.id);
    if (isNaN(id))
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 },
      );

    const body = await req.json();

    // All updatable fields — productType, sku, tags were missing before
    const allowed = [
      "name",
      "description",
      "shortDesc",
      "price",
      "salePrice",
      "thumbnailUrl",
      "images",
      "stock",
      "sku", // ← sku was missing
      "productType", // ← productType was missing
      "tags", // ← tags was missing
      "status",
      "isFeatured",
      "categoryId",
      "metaTitle",
      "metaDesc",
    ];

    const data = {};
    for (const k of allowed) {
      if (k in body) data[k] = body[k];
    }

    // Coerce types so Prisma doesn't get strings for numeric fields
    if ("price" in data) data.price = parseFloat(data.price);
    if ("salePrice" in data)
      data.salePrice = data.salePrice ? parseFloat(data.salePrice) : null;
    if ("stock" in data) data.stock = parseInt(data.stock);
    if ("categoryId" in data)
      data.categoryId = data.categoryId ? parseInt(data.categoryId) : null;
    if ("isFeatured" in data) data.isFeatured = Boolean(data.isFeatured);
    if ("tags" in data && !Array.isArray(data.tags)) data.tags = [];

    if (!Object.keys(data).length)
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 },
      );

    const updated = await prisma.product.update({ where: { id }, data });

    return NextResponse.json({
      success: true,
      message: "Product updated",
      data: serialize(updated),
    });
  } catch (err) {
    console.error("[PATCH /api/admin/products/:id]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;

  try {
    const id = parseInt(params.id);
    if (isNaN(id))
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 },
      );

    await prisma.product.update({
      where: { id },
      data: { status: "archived" },
    });

    return NextResponse.json({ success: true, message: "Product archived" });
  } catch (err) {
    console.error("[DELETE /api/admin/products/:id]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
