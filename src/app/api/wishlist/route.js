import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: user.userId },
      orderBy: { addedAt: "desc" }, // schema uses addedAt not createdAt
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            salePrice: true,
            thumbnailUrl: true,
            stock: true,
          },
        },
      },
    });
    const shaped = items.map((w) => ({
      wishlist_item_id: w.id,
      product_id: w.productId,
      name: w.product?.name,
      price: parseFloat(w.product?.price || 0),
      sale_price: w.product?.salePrice ? parseFloat(w.product.salePrice) : null,
      img: w.product?.thumbnailUrl,
      category: w.product?.category?.name || null,
      rating: w.product?.avgRating || null,
      reviews: w.product?.reviewCount || 0,
      in_stock: (w.product?.stock ?? 1) !== 0,
      added_at: w.addedAt,
    }));
    return NextResponse.json({ success: true, data: shaped });
  } catch (err) {
    console.error("[GET /api/wishlist]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;
  try {
    const { product_id } = await req.json();
    if (!product_id)
      return NextResponse.json(
        { success: false, message: "product_id is required" },
        { status: 400 },
      );

    const existing = await prisma.wishlist.findFirst({
      where: { userId: user.userId, productId: product_id },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({
        success: true,
        wishlisted: false,
        message: "Removed from wishlist",
      });
    } else {
      await prisma.wishlist.create({
        data: { userId: user.userId, productId: product_id },
      });
      return NextResponse.json({
        success: true,
        wishlisted: true,
        message: "Added to wishlist",
      });
    }
  } catch (err) {
    console.error("[POST /api/wishlist]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;
  try {
    const raw = new URL(req.url).searchParams.get("product_id");
    const product_id = parseInt(raw, 10);
    if (!raw || isNaN(product_id))
      return NextResponse.json(
        { success: false, message: "product_id required" },
        { status: 400 },
      );
    await prisma.wishlist.deleteMany({
      where: { userId: user.userId, productId: product_id },
    });
    return NextResponse.json({ success: true, message: "Removed" });
  } catch (err) {
    console.error("[DELETE /api/wishlist]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
