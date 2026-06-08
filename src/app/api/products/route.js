// GET  /api/products — list & search products
// POST /api/products — create product (vendor / admin)
import { NextResponse } from "next/server";
import { prisma, paginate, buildPagination, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const filter = searchParams.get("filter") || "";
  const sort = searchParams.get("sort") || "newest";

  try {
    const where = { status: "active" };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { shortDesc: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ];
    }

    if (category) where.category = { slug: category };

    if (filter === "sale") where.salePrice = { not: null };
    if (filter === "new")
      where.createdAt = {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
    if (filter === "popular") where.totalSales = { gt: 10 };

    const orderByMap = {
      price_asc: { price: "asc" },
      price_desc: { price: "desc" },
      rating: { avgRating: "desc" },
      popular: { totalSales: "desc" },
      newest: { createdAt: "desc" },
    };
    const orderBy = orderByMap[sort] || { createdAt: "desc" };

    const { data, total } = await paginate(
      prisma.product,
      {
        where,
        orderBy,
        include: { category: { select: { name: true, slug: true } } },
      },
      page,
      limit,
    );

    return NextResponse.json({
      success: true,
      data: serialize(data),
      pagination: buildPagination(total, page, limit),
    });
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  const user = await requireAuth(req, ["admin", "vendor"]);
  if (user instanceof NextResponse) return user;

  try {
    const body = await req.json();

    // Accept both camelCase (admin modal) and snake_case (create page)
    const name = body.name;
    const price = body.price;
    const description = body.description || null;
    const shortDesc = body.shortDesc || body.short_desc || null;
    const categoryId = body.categoryId ?? body.category_id ?? null;
    const productType = body.productType || body.product_type || "physical";
    const stock = body.stock ?? 1;
    const sku = body.sku || null;
    const status = body.status || "draft";
    const isFeatured = body.isFeatured ?? body.is_featured ?? false;
    const salePrice = body.salePrice ?? body.sale_price ?? null;
    const thumbnailUrl = body.thumbnailUrl || body.thumbnail_url || null;
    // ── tags — was never saved before ──────────────────────
    const tags = Array.isArray(body.tags) ? body.tags : [];

    if (!name || price === undefined || price === null)
      return NextResponse.json(
        { success: false, message: "Name and price are required" },
        { status: 400 },
      );

    const slug = `${slugify(name)}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        sellerId: user.userId,
        categoryId: categoryId ? parseInt(categoryId) : null,
        name,
        slug,
        description,
        shortDesc,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        thumbnailUrl,
        productType,
        stock: parseInt(stock),
        sku,
        status,
        isFeatured: Boolean(isFeatured),
        tags, // ← was missing — now saved to DB
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created",
        data: serialize({ id: product.id, slug: product.slug }),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/products]", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
