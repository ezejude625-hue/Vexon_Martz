import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  const user = await requireAuth(req, ["admin", "support"]);
  if (user instanceof NextResponse) return user;
  try {
    const now = new Date();
    // Build 6 monthly buckets
    const buckets = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleString("default", { month: "short" }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end:   new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
        revenue: 0, orders: 0, customers: 0,
      };
    });

    // Fetch all relevant orders in one query then bucket
    const from = buckets[0].start;
    const [orders, customers, topProducts, categories] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: from } },
        select: { totalAmount: true, paymentStatus: true, createdAt: true },
      }),
      prisma.user.findMany({
        where: { role: "customer", createdAt: { gte: from } },
        select: { createdAt: true },
      }),
      prisma.product.findMany({
        where: { status: "active" },
        orderBy: { totalSales: "desc" },
        take: 5,
        select: { id: true, name: true, totalSales: true, avgRating: true, price: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        include: { _count: { select: { products: true } } },
      }),
    ]);

    for (const o of orders) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const b = buckets.find(x => x.key === key);
      if (b) { b.orders++; if (o.paymentStatus === "paid") b.revenue += parseFloat(o.totalAmount || 0); }
    }
    for (const c of customers) {
      const d = new Date(c.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const b = buckets.find(x => x.key === key);
      if (b) b.customers++;
    }

    return NextResponse.json({
      success: true,
      data: serialize({
        monthly:     buckets.map(({ label, revenue, orders, customers }) => ({ label, revenue, orders, customers })),
        topProducts, categories,
      }),
    });
  } catch (err) {
    console.error("[GET /api/admin/analytics]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
