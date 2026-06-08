// ============================================================
// GET    /api/cart — fetch user's cart with product details
// POST   /api/cart — add a product to cart (upsert)
// PUT    /api/cart — set exact quantity on a cart item
// DELETE /api/cart — remove a product from cart
// ============================================================
import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const PRODUCT_SELECT = {
  id: true,
  name: true,
  price: true,
  salePrice: true,
  thumbnailUrl: true,
  productType: true,
  stock: true,
};

const CART_INCLUDE = {
  items: {
    include: {
      product: { select: PRODUCT_SELECT },
    },
  },
};

async function getOrCreateCart(userId) {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    include: CART_INCLUDE,
  });
  if (existing) return existing;

  return prisma.cart.create({
    data: { userId },
    include: CART_INCLUDE,
  });
}

function shapeItem(item) {
  const p = item.product;
  return {
    id: item.id,
    quantity: item.quantity,
    product_id: p.id,
    name: p.name,
    price: parseFloat(p.salePrice ?? p.price ?? 0),
    sale_price: p.salePrice ? parseFloat(p.salePrice) : null,
    thumbnail_url: p.thumbnailUrl,
    product_type: p.productType,
    stock: p.stock,
  };
}

// ── GET ───────────────────────────────────────────────────────
export async function GET(req) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const cart = await getOrCreateCart(user.userId);

    const items = cart.items.filter((i) => i.product !== null).map(shapeItem);

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const item_count = items.reduce((s, i) => s + i.quantity, 0);

    return NextResponse.json({
      success: true,
      data: { items, subtotal, item_count },
    });
  } catch (err) {
    console.error("[GET /api/cart]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── POST ──────────────────────────────────────────────────────
export async function POST(req) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const { product_id, quantity = 1 } = await req.json();

    if (!product_id)
      return NextResponse.json(
        { success: false, message: "product_id is required" },
        { status: 400 },
      );

    if (!quantity || quantity < 1)
      return NextResponse.json(
        { success: false, message: "quantity must be at least 1" },
        { status: 400 },
      );

    const cart = await prisma.cart.upsert({
      where: { userId: user.userId },
      create: { userId: user.userId },
      update: {},
    });

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: product_id } },
      create: { cartId: cart.id, productId: product_id, quantity },
      update: { quantity: { increment: quantity } },
    });

    return NextResponse.json({ success: true, message: "Added to cart" });
  } catch (err) {
    console.error("[POST /api/cart]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── PUT ───────────────────────────────────────────────────────
export async function PUT(req) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const { product_id, quantity } = await req.json();

    if (!product_id || !quantity || quantity < 1)
      return NextResponse.json(
        { success: false, message: "Valid product_id and quantity required" },
        { status: 400 },
      );

    const cart = await prisma.cart.findUnique({
      where: { userId: user.userId },
    });

    if (!cart)
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 },
      );

    await prisma.cartItem.updateMany({
      where: { cartId: cart.id, productId: product_id },
      data: { quantity },
    });

    return NextResponse.json({ success: true, message: "Cart updated" });
  } catch (err) {
    console.error("[PUT /api/cart]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── DELETE ────────────────────────────────────────────────────
export async function DELETE(req) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const raw = new URL(req.url).searchParams.get("product_id");
    const product_id = parseInt(raw, 10);

    if (!raw || isNaN(product_id))
      return NextResponse.json(
        { success: false, message: "product_id is required" },
        { status: 400 },
      );

    const cart = await prisma.cart.findUnique({
      where: { userId: user.userId },
    });

    if (!cart)
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 },
      );

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId: product_id },
    });

    return NextResponse.json({ success: true, message: "Item removed" });
  } catch (err) {
    console.error("[DELETE /api/cart]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
