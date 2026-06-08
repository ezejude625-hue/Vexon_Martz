import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";
    const days = range === "7d" ? 7 : range === "90d" ? 90 : range === "1y" ? 365 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [gross, refunds, expenses, recentOrders] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: "paid", createdAt: { gte: since } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: "refunded", createdAt: { gte: since } },
        _sum: { totalAmount: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: since } },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: 0 } })),
      // Real transactions from DB (was returning empty [])
      prisma.order.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          paymentStatus: true,
          status: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
    ]);

    const grossAmount  = parseFloat(gross._sum.totalAmount || 0);
    const refundAmount = parseFloat(refunds._sum.totalAmount || 0);
    const expenseTotal = parseFloat(expenses._sum.amount || 0);
    const platformFees = grossAmount * 0.1;
    const net          = grossAmount - refundAmount - platformFees;

    // Build monthly breakdown for chart (last 6 months)
    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const [rev, exp] = await Promise.all([
        prisma.order.aggregate({ where: { paymentStatus: "paid", createdAt: { gte: start, lte: end } }, _sum: { totalAmount: true } }),
        prisma.expense.aggregate({ where: { date: { gte: start, lte: end } }, _sum: { amount: true } }).catch(() => ({ _sum: { amount: 0 } })),
      ]);
      monthlyData.push({
        m: start.toLocaleString("default", { month: "short" }),
        r: parseFloat(rev._sum.totalAmount || 0),
        e: parseFloat(exp._sum.amount || 0),
      });
    }

    return NextResponse.json({
      success: true,
      data: serialize({
        gross:           grossAmount,
        net,
        refunds:         refundAmount,
        fees:            platformFees,
        expenses:        expenseTotal,
        pending_payout:  net * 0.15,
        tax_collected:   grossAmount * 0.075,
        monthly_chart:   monthlyData,
        transactions:    recentOrders,   // ← real data now
      }),
    });
  } catch (err) {
    console.error("[GET /api/admin/finance]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
