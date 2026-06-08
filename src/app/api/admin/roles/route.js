import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    // Count users per role from actual DB
    const [adminCount, customerCount, vendorCount, supportCount] = await Promise.all([
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.count({ where: { role: "customer" } }),
      prisma.user.count({ where: { role: "vendor" } }),
      prisma.user.count({ where: { role: "support" } }),
    ]);

    const ROLES = [
      { id: 1, name: "Admin",    icon: "admin_panel_settings", color: "#003F47", users: adminCount,    system: true  },
      { id: 2, name: "Customer", icon: "person",               color: "#059669", users: customerCount, system: true  },
      { id: 3, name: "Vendor",   icon: "storefront",           color: "#7C3AED", users: vendorCount,   system: false },
      { id: 4, name: "Support",  icon: "support_agent",        color: "#0ea5e9", users: supportCount,  system: false },
    ];
    return NextResponse.json({ success: true, data: serialize(ROLES) });
  } catch (err) {
    console.error("[GET /api/admin/roles]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
