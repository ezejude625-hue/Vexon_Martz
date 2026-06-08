import { NextResponse } from "next/server";
import { prisma, serialize } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });
    const map = {};
    for (const s of settings) map[s.key] = s.value;
    return NextResponse.json({ success: true, data: map });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  const user = await requireAuth(req, ["admin"]);
  if (user instanceof NextResponse) return user;
  try {
    const body = await req.json();
    const ops = Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: String(value), group: key.split("_")[0] },
        update: { value: String(value) },
      }),
    );
    await prisma.$transaction(ops);
    return NextResponse.json({ success: true, message: "Settings saved" });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
