import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    const { searchParams } = new URL(req.url);
    const type   = searchParams.get("type")   || "sales";
    const format = searchParams.get("format") || "CSV";
    const from   = searchParams.get("from")   ? new Date(searchParams.get("from")) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const to     = searchParams.get("to")     ? new Date(searchParams.get("to"))   : new Date();

    let rows = [];
    let headers = [];

    if (type === "sales") {
      headers = ["Order Number", "Customer", "Email", "Amount", "Status", "Payment Status", "Date"];
      const orders = await prisma.order.findMany({
        where: { createdAt: { gte: from, lte: to } },
        orderBy: { createdAt: "desc" },
        take: 5000,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      });
      rows = orders.map(o => [
        o.orderNumber,
        `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.trim(),
        o.user?.email || "",
        parseFloat(o.totalAmount || 0).toFixed(2),
        o.status,
        o.paymentStatus,
        new Date(o.createdAt).toISOString().slice(0, 10),
      ]);
    } else if (type === "customers") {
      headers = ["Name", "Email", "Phone", "Status", "Orders", "Joined"];
      const customers = await prisma.user.findMany({
        where: { role: "customer", createdAt: { gte: from, lte: to } },
        orderBy: { createdAt: "desc" },
        take: 5000,
        select: {
          firstName: true, lastName: true, email: true, phone: true,
          isActive: true, createdAt: true,
          _count: { select: { orders: true } },
        },
      });
      rows = customers.map(c => [
        `${c.firstName || ""} ${c.lastName || ""}`.trim(),
        c.email,
        c.phone || "",
        c.isActive ? "Active" : "Suspended",
        c._count.orders,
        new Date(c.createdAt).toISOString().slice(0, 10),
      ]);
    } else if (type === "products") {
      headers = ["Name", "SKU", "Category", "Price", "Sale Price", "Stock", "Status", "Total Sales", "Avg Rating"];
      const products = await prisma.product.findMany({
        where: { createdAt: { gte: from, lte: to } },
        orderBy: { totalSales: "desc" },
        take: 5000,
        include: { category: { select: { name: true } } },
      });
      rows = products.map(p => [
        p.name, p.sku || "", p.category?.name || "",
        parseFloat(p.price || 0).toFixed(2),
        p.salePrice ? parseFloat(p.salePrice).toFixed(2) : "",
        p.stock ?? 0, p.status, p.totalSales || 0,
        parseFloat(p.avgRating || 0).toFixed(2),
      ]);
    } else if (type === "inventory") {
      headers = ["Name", "SKU", "Stock", "Status", "Price"];
      const products = await prisma.product.findMany({
        where: { status: { in: ["active", "draft"] } },
        orderBy: { stock: "asc" },
        take: 5000,
      });
      rows = products.map(p => [p.name, p.sku || "", p.stock ?? 0, p.status, parseFloat(p.price || 0).toFixed(2)]);
    } else if (type === "taxes") {
      headers = ["Order Number", "Amount", "Tax", "Date"];
      const orders = await prisma.order.findMany({
        where: { paymentStatus: "paid", createdAt: { gte: from, lte: to } },
        orderBy: { createdAt: "desc" },
        take: 5000,
      });
      rows = orders.map(o => [
        o.orderNumber,
        parseFloat(o.totalAmount || 0).toFixed(2),
        (parseFloat(o.totalAmount || 0) * 0.075).toFixed(2),
        new Date(o.createdAt).toISOString().slice(0, 10),
      ]);
    } else if (type === "marketing") {
      headers = ["Code", "Type", "Value", "Used Count", "Discount Given", "Expires"];
      const coupons = await prisma.coupon.findMany({ orderBy: { usedCount: "desc" }, take: 500 });
      rows = coupons.map(c => [
        c.code, c.discountType,
        c.discountType === "percentage" ? `${c.discountValue}%` : `$${parseFloat(c.discountValue || 0).toFixed(2)}`,
        c.usedCount || 0, "",
        c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : "",
      ]);
    }

    // Build CSV
    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${type}-report-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/reports]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
