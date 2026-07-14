import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["OUTFIT", "HAT", "FACE", "ACCESSORY", "BACKGROUND", "EMOTION"]),
  price: z.number().int().min(0),
  emoji: z.string().min(1),
  color: z.string().min(1).default("#FFD966"),
  rarity: z.enum(["COMMON", "RARE", "EPIC"]).default("COMMON"),
});

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  const items = await prisma.item.findMany({ orderBy: [{ category: "asc" }, { price: "asc" }] });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  const item = await prisma.item.create({ data: parsed.data });
  return NextResponse.json({ ok: true, item });
}
