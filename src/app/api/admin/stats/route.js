import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  const user = await requireAuth(req, ["admin", "support"]);
  if (user instanceof NextResponse) return user;
  try {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDays  = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      revenueThis, revenueLast,
      allTimeOrders,
      ordersThis, ordersLast,
      customersThis, customersLast,
      products, pendingOrders, recentOrders,
    ] = await Promise.all([
      // Revenue last 30 days
      prisma.order.aggregate({
        where: { paymentStatus: "paid", createdAt: { gte: thirtyDays } },
        _sum: { totalAmount: true },
      }),
      // Revenue prev 30-60 day window (for % change)
      prisma.order.aggregate({
        where: { paymentStatus: "paid", createdAt: { gte: sixtyDays, lt: thirtyDays } },
        _sum: { totalAmount: true },
      }),
      // All-time order count (was the bug — was only counting 30-day)
      prisma.order.count(),
      // Orders last 30 days
      prisma.order.count({ where: { createdAt: { gte: thirtyDays } } }),
      // Orders prev 30-60 day window
      prisma.order.count({ where: { createdAt: { gte: sixtyDays, lt: thirtyDays } } }),
      // Customers last 30 days
      prisma.user.count({ where: { role: "customer", isActive: true, createdAt: { gte: thirtyDays } } }),
      // Customers prev 30-60 day window
      prisma.user.count({ where: { role: "customer", isActive: true, createdAt: { gte: sixtyDays, lt: thirtyDays } } }),
      // Active products
      prisma.product.count({ where: { status: "active" } }),
      // Pending orders
      prisma.order.count({ where: { status: "pending" } }),
      // Recent 6 orders for dashboard table
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: { select: { productName: true, quantity: true } },
        },
      }),
    ]);

    const thisRev  = parseFloat(revenueThis._sum.totalAmount || 0);
    const lastRev  = parseFloat(revenueLast._sum.totalAmount || 0);

    function pctChange(current, previous) {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    }

    return NextResponse.json({
      success: true,
      data: serialize({
        total_revenue:      thisRev,
        revenue_change:     pctChange(thisRev, lastRev),
        total_orders:       allTimeOrders,         // ← fixed: all-time count
        orders_this_month:  ordersThis,
        orders_change:      pctChange(ordersThis, ordersLast),
        total_customers:    await prisma.user.count({ where: { role: "customer", isActive: true } }),
        customers_this_month: customersThis,
        customers_change:   pctChange(customersThis, customersLast),
        total_products:     products,
        pending_orders:     pendingOrders,
        recent_orders:      recentOrders,
      }),
    });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
